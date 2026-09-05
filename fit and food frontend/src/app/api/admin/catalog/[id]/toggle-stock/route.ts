import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const meal = await db.mealItem.findUnique({ where: { id } });
  if (!meal) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  await db.mealItem.update({
    where: { id },
    data: { availability: meal.availability === "IN_STOCK" ? "OUT_OF_STOCK" : "IN_STOCK" },
  });
  return NextResponse.json({ success: true });
}