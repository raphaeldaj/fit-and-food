import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

const BASE_URL = "https://api.sene-pay.com";

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

  const res = await fetch(`${BASE_URL}/api/v1/checkout/sessions/${token}`, {
    headers: {
      "X-Api-Key": process.env.SENEPAY_API_KEY!,
      "X-Api-Secret": process.env.SENEPAY_API_SECRET!,
    },
  });
  const data = await res.json();

  const mappedStatus = data.status === "Complete" ? "SUCCESS" : data.status === "Failed" ? "FAILED" : "PENDING";

  if (mappedStatus !== payment.status) {
    await db.payment.update({ where: { id: payment.id }, data: { status: mappedStatus } });

    if (mappedStatus === "SUCCESS") {
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
    } else if (mappedStatus === "FAILED") {
      await db.order.update({ where: { id: payment.orderId }, data: { status: "FAILED" } });
    }
  }

  return NextResponse.json({ status: data.status });
}