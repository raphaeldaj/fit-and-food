import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { logActivity } from "@/lib/security/activityLog";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const { price } = await req.json();

  if (typeof price !== "number" || price <= 0) {
    return NextResponse.json({ error: "Prix invalide." }, { status: 400 });
  }

  await db.pack.update({ where: { id }, data: { price } });
  await logActivity({ userId: user!.id, userName: user!.fullName, role: user!.role, action: `Prix modifié sur le pack #${id.slice(0, 6)} (${price} F)` });

  return NextResponse.json({ success: true });
}