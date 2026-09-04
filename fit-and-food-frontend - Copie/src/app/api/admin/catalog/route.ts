import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const meals = await db.mealItem.findMany({ include: { categories: true } });
  return NextResponse.json({ meals: meals.map((m) => ({ ...m, categories: m.categories.map((c) => c.name) })) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, type, calories, proteins, goal, categories, allergenTags, photoUrl } = body;

  if (!name || !type || !calories || !proteins) {
    return NextResponse.json({ error: "Nom, type, calories et protéines sont obligatoires." }, { status: 400 });
  }

  const meal = await db.mealItem.create({
    data: {
      name,
      type,
      calories: Number(calories),
      proteins: Number(proteins),
      goal: goal || null,
      allergenTags: allergenTags ?? [],
      photoUrl: photoUrl || null,
      availability: "IN_STOCK",
      categories: { connect: (categories ?? []).map((c: string) => ({ name: c })) },
    },
  });

  await db.adminLog.create({ data: { adminName: "Admin", action: `Nouveau plat ajouté : ${meal.name}` } });

  return NextResponse.json({ meal }, { status: 201 });
}