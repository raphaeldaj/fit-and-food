import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const meals = await db.mealItem.findMany({
    include: { reviews: true },
  });

  const ranked = meals
    .filter((m) => m.reviews.length > 0)
    .map((m) => {
      const totalStars = m.reviews.reduce((sum, r) => sum + r.rating, 0);
      const average = totalStars / m.reviews.length;
      return {
        id: m.id,
        name: m.name,
        type: m.type,
        reviewCount: m.reviews.length,
        average: Math.round(average * 10) / 10,
      };
    })
    .sort((a, b) => b.average - a.average);

  const unreviewedCount = meals.filter((m) => m.reviews.length === 0).length;

  return NextResponse.json({ ranked, unreviewedCount });
}