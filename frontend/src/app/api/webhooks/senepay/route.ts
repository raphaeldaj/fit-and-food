import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/security/activityLog";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-senepay-signature");

  console.log("Webhook SenePay reçu :", { hasSignature: !!signature, bodyLength: rawBody.length });

  const expected = crypto
    .createHmac("sha256", process.env.SENEPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");

  if (!signature || signature !== expected) {
    console.error("Webhook SenePay : signature invalide.", { received: signature, expected });
    return NextResponse.json({ error: "Signature invalide." }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const orderId: string | undefined = payload.orderReference ?? payload.metadata?.orderId;

  if (!orderId) {
    return NextResponse.json({ received: true });
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { subscription: true, payment: true },
  });

  if (!order) {
    return NextResponse.json({ received: true });
  }

  // Idempotence : si déjà traité, on ne refait rien
  if (order.status === "PAID" && payload.status === "Complete") {
    return NextResponse.json({ received: true });
  }

  const success = payload.event === "checkout.session.completed" || payload.status === "Complete";

  await db.payment.upsert({
    where: { orderId: order.id },
    update: {
      status: success ? "SUCCESS" : "FAILED",
      internalId: payload.transactionId ?? order.payment?.internalId,
      failedReason: success ? null : (payload.failedReason ?? "Paiement refusé"),
    },
    create: {
      orderId: order.id,
      method: order.subscription.paymentMethod,
      status: success ? "SUCCESS" : "FAILED",
      internalId: payload.transactionId,
      failedReason: success ? null : "Paiement refusé",
    },
  });

  await db.order.update({
    where: { id: order.id },
    data: { status: success ? "PAID" : "FAILED" },
  });

  if (success) {
    await db.subscription.update({
      where: { id: order.subscriptionId },
      data: { status: "ACTIVE", failedCycles: 0 },
    });
    await db.delivery.upsert({
      where: { orderId: order.id },
      update: {},
      create: {
        orderId: order.id,
        slot: order.subscription.slot,
        date: order.subscription.nextDueDate,
        status: "scheduled",
      },
    });
  } else {
    const failed = order.subscription.failedCycles + 1;
    await db.subscription.update({
      where: { id: order.subscriptionId },
      data: {
        failedCycles: failed,
        status: failed >= 3 ? "SUSPENDED" : order.subscription.status,
      },
    });
  }

  await logActivity({
    userName: "SenePay (webhook)",
    action: `Paiement ${success ? "confirmé" : "échoué"} — commande #${order.id.slice(0, 6)}`,
  });

  return NextResponse.json({ received: true });
}