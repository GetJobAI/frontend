import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { env } from "~/env";

const ALGO = "aes-256-gcm";

export class StepDataDecryptError extends Error {
  constructor(message = "Unable to decrypt wizard step data") {
    super(message);
    this.name = "StepDataDecryptError";
  }
}

function getKey(): Buffer {
  return Buffer.from(env.WIZARD_ENCRYPTION_KEY, "base64");
}

export function encryptStepData(data: object): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data), "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decryptStepData(encoded: unknown): Record<string, unknown> {
  if (typeof encoded !== "string") {
    if (encoded && typeof encoded === "object" && !Array.isArray(encoded)) {
      return encoded as Record<string, unknown>;
    }
    throw new StepDataDecryptError("Wizard step data is not a string/object");
  }
  if (encoded === "{}" || encoded === "") {
    return {};
  }
  try {
    const key = getKey();
    const buf = Buffer.from(encoded, "base64");
    const iv = buf.subarray(0, 12);
    const authTag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);
    const decipher = createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    const parsed = JSON.parse(decrypted.toString("utf8")) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new StepDataDecryptError("Wizard step data is not an object");
    }
    return parsed as Record<string, unknown>;
  } catch {
    throw new StepDataDecryptError();
  }
}
