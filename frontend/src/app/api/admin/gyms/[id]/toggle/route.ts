import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { logActivity } from "@/lib/security/activityLog";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const gym = await db.gym.findUnique({ where: { id } });
  if (!gym) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const newActive = !gym.active;
  await db.gym.update({ where: { id }, data: { active: newActive } });

  await logActivity({
    userId: user!.id,
    userName: user!.fullName,
    role: user!.role,
    action: `Salle ${newActive ? "activée" : "désactivée"} : ${gym.name}`,
  });

  return NextResponse.json({ success: true });
}