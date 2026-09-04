import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { verifyTwoFactorToken } from "@/lib/auth/twoFactor";
import { twoFactorSchema } from "@/lib/validators/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await req.json();
  const parsed = twoFactorSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Code invalide." }, { status: 400 });

  if (!user.twoFactorSecret) {
    return NextResponse.json({ error: "Aucune configuration 2FA en attente." }, { status: 400 });
  }

  const valid = await verifyTwoFactorToken(parsed.data.token, user.twoFactorSecret);
  if (!valid) return NextResponse.json({ error: "Code incorrect." }, { status: 401 });

  await db.user.update({ where: { id: user.id }, data: { twoFactorEnabled: true } });
  return NextResponse.json({ success: true });
}