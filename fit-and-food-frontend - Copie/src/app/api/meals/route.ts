import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const category = searchParams.get("category");
  const allergen = searchParams.get("allergen");

  const where: Prisma.MealItemWhereInput = {};

  if (type && type !== "all") {
    where.type = type;
  }
  if (category && category !== "all") {
    where.categories = { some: { name: category } };
  }
  if (allergen && allergen !== "all") {
    where.allergenTags = { has: allergen };
  }

  const meals = await db.mealItem.findMany({
    where,
    include: { categories: true },
  });

  return NextResponse.json({
    meals: meals.map((m) => ({
      ...m,
      categories: m.categories.map((c) => c.name),
    })),
  });
}