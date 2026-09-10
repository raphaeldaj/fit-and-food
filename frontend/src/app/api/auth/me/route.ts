import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  return NextResponse.json({ user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
}