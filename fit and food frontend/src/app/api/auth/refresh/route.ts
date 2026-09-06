import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, signAccessToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;
  if (!refreshToken) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  try {
    const payload = await verifyRefreshToken(refreshToken);
    const user = await db.user.findUnique({ where: { id: payload.sub as string } });
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 401 });

    const accessToken = await signAccessToken(user.id, user.role);

    const res = NextResponse.json({ success: true });
    res.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Session expirée." }, { status: 401 });
  }
}