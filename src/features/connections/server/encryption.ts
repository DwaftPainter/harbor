import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scryptSync,
} from "node:crypto";

export interface EncryptedEnvelope {
  encryptedData: string; // hex
  iv: string; // hex
  authTag: string; // hex
  keyVersion: string;
  fingerprint: string;
}

export class DecryptionError extends Error {
  constructor(message = "Failed to decrypt credential envelope") {
    super(message);
    this.name = "DecryptionError";
  }
}

const ALGORITHM = "aes-256-gcm";
const SALT = "harbor-provider-credential-v1-salt";

/**
 * Derives a 256-bit AES master key from the environment.
 * Prefers ENCRYPTION_KEY; falls back to BETTER_AUTH_SECRET for unified local/test setup.
 */
function getMasterKey(keyVersion = "v1"): Buffer {
  const secret =
    process.env.ENCRYPTION_KEY ||
    process.env.BETTER_AUTH_SECRET ||
    "harbor-default-dev-secret-minimum-32-chars-key";

  return scryptSync(secret, `${SALT}-${keyVersion}`, 32);
}

/**
 * Calculates a non-reversible SHA-256 fingerprint prefix (16 hex chars)
 * for tracking credential identity and rotation without leaking the secret.
 */
export function calculateFingerprint(secret: string): string {
  if (!secret) return "empty";
  return createHash("sha256").update(secret).digest("hex").slice(0, 16);
}

/**
 * Encrypts a credential object using AES-256-GCM authenticated envelope encryption.
 */
export function encryptCredential(
  payload: Record<string, unknown>,
  keyVersion = "v1",
): EncryptedEnvelope {
  const key = getMasterKey(keyVersion);
  const iv = randomBytes(12); // 96-bit standard GCM IV

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const serialized = JSON.stringify(payload);

  const encrypted = Buffer.concat([
    cipher.update(serialized, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Find a prominent secret string (apiKey, apiToken, token, password) for the fingerprint
  const primarySecret =
    typeof payload.apiKey === "string"
      ? payload.apiKey
      : typeof payload.apiToken === "string"
        ? payload.apiToken
        : typeof payload.token === "string"
          ? payload.token
          : typeof payload.password === "string"
            ? payload.password
            : serialized;

  const fingerprint = calculateFingerprint(primarySecret);

  return {
    encryptedData: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    keyVersion,
    fingerprint,
  };
}

/**
 * Decrypts an AES-256-GCM credential envelope and returns the parsed JSON payload.
 * Throws DecryptionError if the ciphertext or authentication tag is invalid or tampered.
 */
export function decryptCredential(envelope: {
  encryptedData: string;
  iv: string;
  authTag: string;
  keyVersion?: string;
}): Record<string, unknown> {
  const { encryptedData, iv, authTag, keyVersion = "v1" } = envelope;

  try {
    const key = getMasterKey(keyVersion);
    const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, "hex"));

    decipher.setAuthTag(Buffer.from(authTag, "hex"));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedData, "hex")),
      decipher.final(),
    ]);

    return JSON.parse(decrypted.toString("utf8")) as Record<string, unknown>;
  } catch (error) {
    if (error instanceof DecryptionError) {
      throw error;
    }
    throw new DecryptionError(
      `Credential decryption failed: ${error instanceof Error ? error.message : "invalid ciphertext or auth tag"}`,
    );
  }
}
