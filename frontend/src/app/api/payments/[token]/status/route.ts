import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getPaymentStatus } from "@/lib/payments/senepay";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const payment = await db.payment.findFirst({
    where: { token },
    include: { order: { include: { subscription: true } } },
  });

  if (!payment || payment.order.subscription.userId !== user.id) {
    return NextResponse.json({ error: "Paiement introuvable." }, { status: 404 });
  }

  try {
    const result = await getPaymentStatus(token);

    const mappedStatus =
      result.status === "Completed" ? "SUCCESS" : result.status === "Pending" ? "PENDING" : "FAILED";

    if (mappedStatus !== payment.status) {
      await db.payment.update({ where: { id: payment.id }, data: { status: mappedStatus } });

      if (result.status === "Completed") {
        await db.order.update({ where: { id: payment.orderId }, data: { status: "PAID" } });
        await db.subscription.update({
          where: { id: payment.order.subscriptionId },
          data: { status: "ACTIVE", failedCycles: 0 },
        });
        await db.delivery.upsert({
          where: { orderId: payment.orderId },
          update: {},
          create: {
            orderId: payment.orderId,
            slot: payment.order.subscription.slot,
            date: payment.order.subscription.nextDueDate,
            status: "scheduled",
          },
        });
      } else if (result.status === "Failed" || result.status === "Cancelled") {
        await db.order.update({ where: { id: payment.orderId }, data: { status: "FAILED" } });
      }
    }

    return NextResponse.json({ status: result.status });
  } catch (err) {
    console.error("Erreur statut paiement :", err);
    return NextResponse.json({ status: payment.status === "SUCCESS" ? "Completed" : "Pending" });
  }
}