import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { generateTwoFactorSecret, generateQrCode, encryptSecret } from "@/lib/auth/twoFactor";
import { db } from "@/lib/db";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { secret, otpauthUrl } = generateTwoFactorSecret(user.email);
  const qrCodeDataUrl = await generateQrCode(otpauthUrl);

  await db.user.update({
    where: { id: user.id },
    data: { twoFactorSecret: encryptSecret(secret) },
  });

  return NextResponse.json({ qrCodeDataUrl });
}