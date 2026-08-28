import assert from "node:assert/strict";
import test from "node:test";

import {
  PROVIDER_CATALOG,
  getProviderDescriptor,
} from "../src/features/connections/providers/catalog.ts";
import {
  calculateFingerprint,
  DecryptionError,
  decryptCredential,
  encryptCredential,
} from "../src/features/connections/server/encryption.ts";
import { PROVIDER_IDS } from "../src/features/connections/types.ts";

test("AES-256-GCM envelope encryption and decryption roundtrip", () => {
  const secretPayload = {
    apiKey: "neon_prod_secret_token_1234567890",
    projectId: "project-abc-xyz",
    config: {
      region: "us-east-1",
      maxConnections: 20,
    },
  };

  const envelope = encryptCredential(secretPayload);

  assert.ok(envelope.encryptedData, "Ciphertext must be present");
  assert.ok(envelope.iv, "IV must be present");
  assert.ok(envelope.authTag, "AuthTag must be present");
  assert.equal(envelope.keyVersion, "v1");
  assert.equal(
    envelope.fingerprint.length,
    16,
    "Fingerprint must be 16 hex chars",
  );

  // Ciphertext must never contain the cleartext secret
  assert.equal(
    envelope.encryptedData.includes("neon_prod_secret_token_1234567890"),
    false,
    "Ciphertext must not contain plaintext string",
  );

  // Decryption recovers exact payload
  const decrypted = decryptCredential(envelope);
  assert.deepEqual(decrypted, secretPayload);
});

test("tampered ciphertext or invalid auth tag is rejected", () => {
  const envelope = encryptCredential({ token: "secure_token_abc" });

  // Tamper ciphertext
  const tamperedEnvelope = {
    ...envelope,
    encryptedData:
      envelope.encryptedData.slice(0, -2) +
      (envelope.encryptedData.endsWith("0") ? "1" : "0"),
  };

  assert.throws(
    () => decryptCredential(tamperedEnvelope),
    (err) => err instanceof DecryptionError,
  );

  // Tamper auth tag
  const badTagEnvelope = {
    ...envelope,
    authTag: "00000000000000000000000000000000",
  };

  assert.throws(
    () => decryptCredential(badTagEnvelope),
    (err) => err instanceof DecryptionError,
  );
});

test("calculateFingerprint is deterministic and non-reversible", () => {
  const tokenA = "neon_test_token_123";
  const tokenB = "neon_test_token_456";

  const fpA1 = calculateFingerprint(tokenA);
  const fpA2 = calculateFingerprint(tokenA);
  const fpB = calculateFingerprint(tokenB);

  assert.equal(fpA1, fpA2);
  assert.notEqual(fpA1, fpB);
  assert.equal(fpA1.length, 16);
});

test("provider catalog defines required descriptors and scopes", () => {
  assert.ok(
    PROVIDER_CATALOG.length >= 3,
    "Catalog must have at least 3 providers",
  );
  for (const id of ["neon", "vercel", "render"]) {
    assert.ok(
      PROVIDER_IDS.includes(id),
      `Provider id ${id} must be in PROVIDER_IDS`,
    );
    const descriptor = getProviderDescriptor(id);
    assert.ok(descriptor, `Descriptor for ${id} must exist`);
    assert.ok(descriptor.name, `Descriptor for ${id} must have a name`);
    assert.ok(
      descriptor.requiredScopes.length > 0,
      `Descriptor for ${id} must declare required scopes`,
    );
    assert.ok(
      descriptor.fields.length > 0,
      `Descriptor for ${id} must define form fields`,
    );
    assert.ok(descriptor.docUrl, `Descriptor for ${id} must have docUrl`);
  }
});
