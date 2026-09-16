import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getEffectivePrice } from "@/lib/pricing";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { logActivity } from "@/lib/security/activityLog";

export async function POST() {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const now = new Date();
  const dueSubscriptions = await db.subscription.findMany({
    where: { status: "ACTIVE", nextDueDate: { lte: now } },
    include: { pack: true },
  });

  const created: string[] = [];

  for (const sub of dueSubscriptions) {
    // Évite de recréer une commande si le cycle en cours n'est pas encore réglé
    const pending = await db.order.findFirst({
      where: { subscriptionId: sub.id, status: "PENDING" },
    });
    if (pending) continue;

    const order = await db.order.create({
      data: { subscriptionId: sub.id, amount: getEffectivePrice(sub.pack), status: "PENDING" },
    });

    const nextDate = new Date(sub.nextDueDate);
    nextDate.setDate(nextDate.getDate() + 7);
    await db.subscription.update({ where: { id: sub.id }, data: { nextDueDate: nextDate } });

    created.push(order.id);
  }

  await logActivity({
    userId: user!.id,
    userName: user!.fullName,
    role: user!.role,
    action: `Cycle de reconduction : ${created.length} commande(s) à régler générée(s)`,
  });

  return NextResponse.json({ generated: created.length });
}