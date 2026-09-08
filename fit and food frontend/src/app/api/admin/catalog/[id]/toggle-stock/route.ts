import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { logActivity } from "@/lib/security/activityLog";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const meal = await db.mealItem.findUnique({ where: { id } });
  if (!meal) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const newAvailability = meal.availability === "IN_STOCK" ? "OUT_OF_STOCK" : "IN_STOCK";
  await db.mealItem.update({ where: { id }, data: { availability: newAvailability } });

  await logActivity({
    userId: user!.id,
    userName: user!.fullName,
    role: user!.role,
    action: `Stock basculé (${newAvailability === "IN_STOCK" ? "en stock" : "rupture"}) : ${meal.name}`,
  });

  return NextResponse.json({ success: true });
}