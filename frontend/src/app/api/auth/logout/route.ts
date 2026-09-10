import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { logActivity } from "@/lib/security/activityLog";

export async function POST() {
  const user = await getCurrentUser();
  if (user) {
    await logActivity({ userId: user.id, userName: user.fullName, role: user.role, action: "Déconnexion" });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set("access_token", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 0, path: "/" });
  res.cookies.set("refresh_token", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 0, path: "/" });
  return res;
}