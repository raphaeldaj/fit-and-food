import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";
import { encrypt, decrypt } from "./crypto";

export function generateTwoFactorSecret(email: string) {
  const secret = generateSecret();
  const otpauthUrl = generateURI({
    issuer: "Fit & Food",
    label: email,
    secret,
  });
  return { secret, otpauthUrl };
}

export async function generateQrCode(otpauthUrl: string) {
  return QRCode.toDataURL(otpauthUrl);
}

export async function verifyTwoFactorToken(token: string, encryptedSecret: string) {
  const secret = decrypt(encryptedSecret);
  const result = await verify({ secret, token });
  return result.valid;
}

export function encryptSecret(secret: string) {
  return encrypt(secret);
}