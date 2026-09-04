import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getEffectivePrice } from "@/lib/pricing";

export async function POST() {
  const now = new Date();
  const dueSubscriptions = await db.subscription.findMany({
    where: { status: "ACTIVE", nextDueDate: { lte: now } },
    include: { pack: true },
  });

  const created: string[] = [];

  for (const sub of dueSubscriptions) {
    const order = await db.order.create({ data: { subscriptionId: sub.id, amount: getEffectivePrice(sub.pack), status: "PENDING" } });

    // Simulation du paiement — en production, ceci vient du webhook Wave/Orange Money
    const success = Math.random() > 0.15;
    await db.payment.create({ data: { orderId: order.id, method: sub.paymentMethod, status: success ? "SUCCESS" : "FAILED" } });
    await db.order.update({ where: { id: order.id }, data: { status: success ? "PAID" : "FAILED" } });

    const nextDate = new Date(sub.nextDueDate);
    nextDate.setDate(nextDate.getDate() + 7);
    const newFailedCycles = success ? 0 : sub.failedCycles + 1;

    await db.subscription.update({
      where: { id: sub.id },
      data: {
        nextDueDate: nextDate,
        failedCycles: newFailedCycles,
        status: !success && newFailedCycles >= 3 ? "SUSPENDED" : "ACTIVE",
      },
    });

    created.push(order.id);
  }

  await db.adminLog.create({
    data: { adminName: "Système (cron)", action: `Cycle de reconduction : ${created.length} commande(s) générée(s)` },
  });

  return NextResponse.json({ generated: created.length });
}