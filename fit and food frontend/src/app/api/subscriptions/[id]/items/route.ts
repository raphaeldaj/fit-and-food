import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const subscription = await db.subscription.findUnique({ where: { id }, include: { pack: true } });
  if (!subscription || subscription.userId !== user.id) {
    return NextResponse.json({ error: "Abonnement introuvable." }, { status: 404 });
  }
  if (subscription.status !== "ACTIVE") {
    return NextResponse.json({ error: "Seul un abonnement actif peut être modifié." }, { status: 409 });
  }

  const body = await req.json();
  const items: { mealId: string; quantity: number }[] = body.items ?? [];

  if (!items.length) {
    return NextResponse.json({ error: "La composition ne peut pas être vide." }, { status: 400 });
  }

  const mealIds = items.map((it) => it.mealId);
  const meals = await db.mealItem.findMany({ where: { id: { in: mealIds } } });

  const repasCount = items.reduce((sum, it) => {
    const meal = meals.find((m) => m.id === it.mealId);
    return meal?.type === "Repas" ? sum + it.quantity : sum;
  }, 0);
  const snackCount = items.reduce((sum, it) => {
    const meal = meals.find((m) => m.id === it.mealId);
    return meal?.type === "Collation" ? sum + it.quantity : sum;
  }, 0);

  if (repasCount !== subscription.pack.mealsQty || snackCount !== subscription.pack.snackQty) {
    return NextResponse.json(
      { error: `La composition doit contenir exactement ${subscription.pack.mealsQty} repas et ${subscription.pack.snackQty} collations.` },
      { status: 400 }
    );
  }

  await db.$transaction([
    db.subscriptionItem.deleteMany({ where: { subscriptionId: id } }),
    db.subscriptionItem.createMany({
      data: items.map((it) => ({ subscriptionId: id, mealId: it.mealId, quantity: it.quantity })),
    }),
  ]);

  return NextResponse.json({ success: true });
}