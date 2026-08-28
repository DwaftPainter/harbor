import { and, eq } from "drizzle-orm";

import { type AppDb, getDb } from "@/db";
import {
  connectionCredentials,
  providerConnections,
} from "@/db/schema/connections";
import { recordAuditEvent } from "@/features/audit/server/audit-service";
import { requirePermission } from "@/features/authorization/server/authorization-service";

import { validateProviderCredentials } from "../providers/validator";
import {
  type CreateConnectionInput,
  createConnectionSchema,
  type ProviderConnectionDTO,
  type RotateConnectionInput,
  rotateConnectionSchema,
  type ValidationResult,
} from "../types";
import { decryptCredential, encryptCredential } from "./encryption";

function mapToDTO(
  conn: typeof providerConnections.$inferSelect,
  fingerprint?: string,
): ProviderConnectionDTO {
  return {
    id: conn.id,
    organizationId: conn.organizationId,
    providerId: conn.providerId as ProviderConnectionDTO["providerId"],
    name: conn.name,
    status: conn.status as ProviderConnectionDTO["status"],
    externalAccountId: conn.externalAccountId,
    externalAccountName: conn.externalAccountName,
    scope: conn.scope,
    fingerprint,
    lastValidatedAt: conn.lastValidatedAt?.toISOString() ?? null,
    lastSyncAt: conn.lastSyncAt?.toISOString() ?? null,
    errorSummary: conn.errorSummary,
    createdAt: conn.createdAt.toISOString(),
    updatedAt: conn.updatedAt.toISOString(),
  };
}

/**
 * Creates a new provider connection, validates credentials against provider APIs,
 * encrypts credentials with AES-256-GCM, and emits an audit event.
 */
export async function createConnection(
  organizationId: string,
  actorUserId: string,
  input: CreateConnectionInput,
  db: AppDb = getDb(),
): Promise<ProviderConnectionDTO> {
  await requirePermission(organizationId, actorUserId, "connection:create", db);

  const validated = createConnectionSchema.parse(input);

  // 1. Validate credentials with provider adapter
  const valResult = await validateProviderCredentials(
    validated.providerId,
    validated.credentials,
  );

  const status = valResult.valid ? "connected" : "degraded";
  const errorSummary = valResult.valid ? null : valResult.error;

  // 2. Encrypt credentials with AES-256-GCM envelope encryption
  const envelope = encryptCredential(validated.credentials);
  const connectionId = crypto.randomUUID();
  const credentialId = crypto.randomUUID();

  // 3. Persist connection and credential envelope in a transaction
  const [createdConn] = await db.transaction(async (tx) => {
    const [conn] = await tx
      .insert(providerConnections)
      .values({
        id: connectionId,
        organizationId,
        providerId: validated.providerId,
        name: validated.name,
        status,
        externalAccountId: valResult.externalAccountId || null,
        externalAccountName: valResult.externalAccountName || null,
        scope: valResult.scopes?.join(", ") || null,
        lastValidatedAt: new Date(),
        errorSummary,
      })
      .returning();

    await tx.insert(connectionCredentials).values({
      id: credentialId,
      connectionId,
      encryptedData: envelope.encryptedData,
      iv: envelope.iv,
      authTag: envelope.authTag,
      keyVersion: envelope.keyVersion,
      fingerprint: envelope.fingerprint,
    });

    return [conn];
  });

  // 4. Record audit event (secrets automatically redacted/omitted)
  await recordAuditEvent(
    {
      organizationId,
      actorId: actorUserId,
      actorType: "user",
      action: "connection.created",
      targetType: "connection",
      targetId: connectionId,
      outcome: valResult.valid ? "success" : "error",
      metadata: {
        providerId: validated.providerId,
        name: validated.name,
        externalAccountId: valResult.externalAccountId,
        fingerprint: envelope.fingerprint,
        status,
      },
    },
    db,
  );

  return mapToDTO(createdConn!, envelope.fingerprint);
}

/**
 * Lists all provider connections for an organization.
 * Never returns plaintext credentials.
 */
export async function listConnections(
  organizationId: string,
  actorUserId: string,
  db: AppDb = getDb(),
): Promise<ProviderConnectionDTO[]> {
  await requirePermission(organizationId, actorUserId, "connection:read", db);

  const rows = await db
    .select({
      conn: providerConnections,
      fingerprint: connectionCredentials.fingerprint,
    })
    .from(providerConnections)
    .leftJoin(
      connectionCredentials,
      eq(providerConnections.id, connectionCredentials.connectionId),
    )
    .where(eq(providerConnections.organizationId, organizationId))
    .orderBy(providerConnections.createdAt);

  return rows.map((r) => mapToDTO(r.conn, r.fingerprint || undefined));
}

/**
 * Gets a single provider connection by ID within the active organization boundary.
 */
export async function getConnectionById(
  organizationId: string,
  connectionId: string,
  actorUserId: string,
  db: AppDb = getDb(),
): Promise<ProviderConnectionDTO | null> {
  await requirePermission(organizationId, actorUserId, "connection:read", db);

  const [row] = await db
    .select({
      conn: providerConnections,
      fingerprint: connectionCredentials.fingerprint,
    })
    .from(providerConnections)
    .leftJoin(
      connectionCredentials,
      eq(providerConnections.id, connectionCredentials.connectionId),
    )
    .where(
      and(
        eq(providerConnections.id, connectionId),
        eq(providerConnections.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!row) return null;
  return mapToDTO(row.conn, row.fingerprint || undefined);
}

/**
 * Rotates credentials for an existing provider connection.
 * Encrypts and updates the credential envelope, revalidates provider connection, and logs an audit event.
 */
export async function rotateConnectionCredentials(
  organizationId: string,
  connectionId: string,
  actorUserId: string,
  input: RotateConnectionInput,
  db: AppDb = getDb(),
): Promise<ProviderConnectionDTO> {
  await requirePermission(organizationId, actorUserId, "connection:update", db);

  const validated = rotateConnectionSchema.parse(input);

  const existing = await getConnectionById(
    organizationId,
    connectionId,
    actorUserId,
    db,
  );
  if (!existing) {
    throw new Error("Connection not found in active organization");
  }

  // 1. Validate new credentials
  const valResult = await validateProviderCredentials(
    existing.providerId,
    validated.credentials,
  );

  const status = valResult.valid ? "connected" : "degraded";
  const errorSummary = valResult.valid ? null : valResult.error;

  // 2. Encrypt new credentials
  const envelope = encryptCredential(validated.credentials);

  // 3. Update credential envelope & connection status
  await db.transaction(async (tx) => {
    await tx
      .update(connectionCredentials)
      .set({
        encryptedData: envelope.encryptedData,
        iv: envelope.iv,
        authTag: envelope.authTag,
        keyVersion: envelope.keyVersion,
        fingerprint: envelope.fingerprint,
        updatedAt: new Date(),
      })
      .where(eq(connectionCredentials.connectionId, connectionId));

    await tx
      .update(providerConnections)
      .set({
        status,
        lastValidatedAt: new Date(),
        errorSummary,
        externalAccountId:
          valResult.externalAccountId || existing.externalAccountId,
        externalAccountName:
          valResult.externalAccountName || existing.externalAccountName,
        scope: valResult.scopes?.join(", ") || existing.scope,
        updatedAt: new Date(),
      })
      .where(eq(providerConnections.id, connectionId));
  });

  // 4. Record audit event
  await recordAuditEvent(
    {
      organizationId,
      actorId: actorUserId,
      actorType: "user",
      action: "connection.updated",
      targetType: "connection",
      targetId: connectionId,
      outcome: valResult.valid ? "success" : "error",
      metadata: {
        operation: "credential_rotation",
        newFingerprint: envelope.fingerprint,
        status,
      },
    },
    db,
  );

  const updated = await getConnectionById(
    organizationId,
    connectionId,
    actorUserId,
    db,
  );
  return updated!;
}

/**
 * Validates an existing connection by retrieving and decrypting its credentials on the server,
 * calling the provider adapter, and updating its health status.
 */
export async function validateConnection(
  organizationId: string,
  connectionId: string,
  actorUserId: string,
  db: AppDb = getDb(),
): Promise<{
  connection: ProviderConnectionDTO;
  validation: ValidationResult;
}> {
  await requirePermission(organizationId, actorUserId, "connection:update", db);

  const [row] = await db
    .select({
      conn: providerConnections,
      cred: connectionCredentials,
    })
    .from(providerConnections)
    .innerJoin(
      connectionCredentials,
      eq(providerConnections.id, connectionCredentials.connectionId),
    )
    .where(
      and(
        eq(providerConnections.id, connectionId),
        eq(providerConnections.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!row) {
    throw new Error("Connection not found in active organization");
  }

  // 1. Decrypt credential envelope on server
  const credentials = decryptCredential({
    encryptedData: row.cred.encryptedData,
    iv: row.cred.iv,
    authTag: row.cred.authTag,
    keyVersion: row.cred.keyVersion,
  });

  // 2. Validate against provider
  const valResult = await validateProviderCredentials(
    row.conn.providerId as ProviderConnectionDTO["providerId"],
    credentials,
  );

  const status = valResult.valid ? "connected" : "degraded";
  const errorSummary = valResult.valid ? null : valResult.error;

  // 3. Update status & timestamp
  await db
    .update(providerConnections)
    .set({
      status,
      lastValidatedAt: new Date(),
      errorSummary,
      updatedAt: new Date(),
    })
    .where(eq(providerConnections.id, connectionId));

  // 4. Record audit event
  await recordAuditEvent(
    {
      organizationId,
      actorId: actorUserId,
      actorType: "user",
      action: "connection.updated",
      targetType: "connection",
      targetId: connectionId,
      outcome: valResult.valid ? "success" : "error",
      metadata: {
        operation: "test_validation",
        status,
        errorSummary,
      },
    },
    db,
  );

  const updated = await getConnectionById(
    organizationId,
    connectionId,
    actorUserId,
    db,
  );
  return { connection: updated!, validation: valResult };
}

/**
 * Revokes or deletes a provider connection, immediately disabling any background sync
 * and cascading credential deletion.
 */
export async function revokeConnection(
  organizationId: string,
  connectionId: string,
  actorUserId: string,
  db: AppDb = getDb(),
): Promise<void> {
  await requirePermission(organizationId, actorUserId, "connection:delete", db);

  const existing = await getConnectionById(
    organizationId,
    connectionId,
    actorUserId,
    db,
  );
  if (!existing) {
    throw new Error("Connection not found in active organization");
  }

  await db
    .delete(providerConnections)
    .where(
      and(
        eq(providerConnections.id, connectionId),
        eq(providerConnections.organizationId, organizationId),
      ),
    );

  await recordAuditEvent(
    {
      organizationId,
      actorId: actorUserId,
      actorType: "user",
      action: "connection.deleted",
      targetType: "connection",
      targetId: connectionId,
      outcome: "success",
      metadata: {
        providerId: existing.providerId,
        name: existing.name,
        externalAccountId: existing.externalAccountId,
      },
    },
    db,
  );
}
