import { NextRequest, NextResponse } from "next/server";
import { twoFactorSchema } from "@/lib/validators/auth";
import { verifyTwoFactorToken } from "@/lib/auth/twoFactor";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import { setAuthCookies } from "../../login/route";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

const MAX_2FA_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed } = rateLimit(`2fa:${ip}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Trop de tentatives. Réessaie dans une minute." }, { status: 429 });
    }

    const { userId, token } = await req.json();
    const parsed = twoFactorSchema.safeParse({ token });
    if (!parsed.success) return NextResponse.json({ error: "Code invalide." }, { status: 400 });

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: "2FA non configurée." }, { status: 400 });
    }

    if (user.locked2FAUntil && user.locked2FAUntil > new Date()) {
      return NextResponse.json({ error: "Trop de tentatives. Réessaie dans quelques minutes." }, { status: 423 });
    }

    const valid = await verifyTwoFactorToken(token, user.twoFactorSecret);
    if (!valid) {
      const attempts = user.failed2FACount + 1;
      await db.user.update({
        where: { id: user.id },
        data: {
          failed2FACount: attempts,
          locked2FAUntil: attempts >= MAX_2FA_ATTEMPTS ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null,
        },
      });
      return NextResponse.json({ error: "Code incorrect." }, { status: 401 });
    }

    await db.user.update({ where: { id: user.id }, data: { failed2FACount: 0, locked2FAUntil: null } });

    const accessToken = await signAccessToken(user.id, user.role);
    const refreshToken = await signRefreshToken(user.id);

    const res = NextResponse.json({ success: true });
    setAuthCookies(res, accessToken, refreshToken);
    return res;
  } catch (err) {
    console.error("Erreur /api/auth/2fa/verify :", err);
    return NextResponse.json({ error: "Erreur serveur, réessaie." }, { status: 500 });
  }
}