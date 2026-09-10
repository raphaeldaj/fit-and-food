import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const items = await db.subscriptionItem.findMany({
    where: { subscription: { userId: user.id } },
    include: { meal: true },
    distinct: ["mealId"],
  });

  return NextResponse.json({ meals: items.map((it) => ({ id: it.meal.id, name: it.meal.name })) });
}