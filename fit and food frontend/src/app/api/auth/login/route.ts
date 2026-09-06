import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators/auth";
import { verifyPassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed } = rateLimit(`login:${ip}`, 10, 60_000); // 10 tentatives / minute / IP
    if (!allowed) {
      return NextResponse.json({ error: "Trop de tentatives. Réessaie dans une minute." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return NextResponse.json({ error: "Compte temporairement verrouillé." }, { status: 423 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      const attempts = user.failedLoginCount + 1;
      await db.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: attempts,
          lockedUntil: attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null,
        },
      });
      return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
    }

    await db.user.update({ where: { id: user.id }, data: { failedLoginCount: 0, lockedUntil: null } });

    if (user.twoFactorEnabled) {
      return NextResponse.json({ requires2FA: true, userId: user.id });
    }

    const accessToken = await signAccessToken(user.id, user.role);
    const refreshToken = await signRefreshToken(user.id);

    const res = NextResponse.json({ success: true });
    setAuthCookies(res, accessToken, refreshToken);
    return res;
  } catch (err) {
    console.error("Erreur /api/auth/login :", err);
    return NextResponse.json({ error: "Erreur serveur, réessaie." }, { status: 500 });
  }
}

export function setAuthCookies(res: NextResponse, accessToken: string, refreshToken: string) {
  res.cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60,
    path: "/",
  });
  res.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
}