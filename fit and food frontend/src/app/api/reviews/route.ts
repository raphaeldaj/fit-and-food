import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/security/activityLog";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { mealId, rating, comment } = await req.json();

  if (!mealId || typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Note invalide (1 à 5)." }, { status: 400 });
  }

  const hasReceived = await db.subscriptionItem.findFirst({
    where: { mealId, subscription: { userId: user.id } },
  });
  if (!hasReceived) {
    return NextResponse.json({ error: "Tu ne peux laisser un avis que sur un plat que tu as commandé." }, { status: 403 });
  }

  const meal = await db.mealItem.findUnique({ where: { id: mealId } });

  const review = await db.review.create({
    data: { userId: user.id, mealId, rating, comment: comment || null },
  });

  await logActivity({ userId: user.id, userName: user.fullName, role: user.role, action: `Avis laissé sur "${meal?.name ?? mealId}" (${rating}/5)` });

  return NextResponse.json({ review }, { status: 201 });
}