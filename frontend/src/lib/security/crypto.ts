import crypto from "crypto";

const ALGO = "aes-256-gcm";
const KEY = crypto.scryptSync(
  process.env.FIELD_ENCRYPTION_KEY ?? process.env.JWT_ACCESS_SECRET!,
  "fitfood-field-encryption",
  32
);

export function encryptField(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decryptField(payload: string): string {
  try {
    const data = Buffer.from(payload, "base64");
    const iv = data.subarray(0, 12);
    const authTag = data.subarray(12, 28);
    const encrypted = data.subarray(28);
    const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    // Donnée créée avant l'activation du chiffrement — retournée telle quelle plutôt que de planter.
    return payload;
  }
}