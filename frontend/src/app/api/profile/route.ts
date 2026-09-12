import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/security/activityLog";

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { fullName, phone, address } = await req.json();
  if (!fullName || !phone) {
    return NextResponse.json({ error: "Nom et téléphone obligatoires." }, { status: 400 });
  }

  const existing = await db.user.findFirst({ where: { phone, NOT: { id: user.id } } });
  if (existing) {
    return NextResponse.json({ error: "Ce numéro est déjà utilisé par un autre compte." }, { status: 409 });
  }

  await db.user.update({ where: { id: user.id }, data: { fullName, phone, address: address || null } });
  await logActivity({ userId: user.id, userName: fullName, role: user.role, action: "Modification du profil" });

  return NextResponse.json({ success: true });
}