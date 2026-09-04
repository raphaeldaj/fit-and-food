import { NextRequest, NextResponse } from "next/server";
import { twoFactorSchema } from "@/lib/validators/auth";
import { verifyTwoFactorToken } from "@/lib/auth/twoFactor";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import { setAuthCookies } from "../../login/route";

export async function POST(req: NextRequest) {
  const { userId, token } = await req.json();
  const parsed = twoFactorSchema.safeParse({ token });
  if (!parsed.success) return NextResponse.json({ error: "Code invalide." }, { status: 400 });

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || !user.twoFactorSecret) {
    return NextResponse.json({ error: "2FA non configurée." }, { status: 400 });
  }

  const valid = await verifyTwoFactorToken(token, user.twoFactorSecret);
  if (!valid) return NextResponse.json({ error: "Code incorrect." }, { status: 401 });

  const accessToken = await signAccessToken(user.id, user.role);
  const refreshToken = await signRefreshToken(user.id);

  const res = NextResponse.json({ success: true });
  setAuthCookies(res, accessToken, refreshToken);
  return res;
}