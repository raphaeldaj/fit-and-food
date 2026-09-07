import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const { name, type, calories, proteins, goal, categories, allergenTags, photoUrl } = body;

  if (!name || !type || !calories || !proteins) {
    return NextResponse.json({ error: "Nom, type, calories et protéines sont obligatoires." }, { status: 400 });
  }

  const meal = await db.mealItem.update({
    where: { id },
    data: {
      name,
      type,
      calories: Number(calories),
      proteins: Number(proteins),
      goal: goal || null,
      allergenTags: allergenTags ?? [],
      photoUrl: photoUrl || null,
      categories: { set: [], connect: (categories ?? []).map((c: string) => ({ name: c })) },
    },
  });

  await db.adminLog.create({ data: { adminName: "Admin", action: `Plat modifié : ${meal.name}` } });
  return NextResponse.json({ meal });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const meal = await db.mealItem.findUnique({ where: { id } });
  if (!meal) return NextResponse.json({ error: "Plat introuvable." }, { status: 404 });

  try {
    await db.mealItem.delete({ where: { id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return NextResponse.json(
        { error: "Ce plat est utilisé dans des abonnements ou des avis existants. Marque-le plutôt en rupture de stock." },
        { status: 409 }
      );
    }
    throw err;
  }

  await db.adminLog.create({ data: { adminName: "Admin", action: `Plat supprimé : ${meal.name}` } });
  return NextResponse.json({ success: true });
}