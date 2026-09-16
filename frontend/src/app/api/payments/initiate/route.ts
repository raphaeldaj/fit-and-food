import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { initiatePayment, normalizePhone, toOperator } from "@/lib/payments/senepay";
import { decryptField } from "@/lib/security/crypto";
import { logActivity } from "@/lib/security/activityLog";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed } = rateLimit(`pay:${ip}`, 20, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Trop de tentatives. Réessaie dans une minute." }, { status: 429 });
    }

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

    const { orderId, otpCode } = await req.json();
    if (!orderId) return NextResponse.json({ error: "Commande manquante." }, { status: 400 });

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { subscription: true },
    });

    if (!order || order.subscription.userId !== user.id) {
      return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
    }
    if (order.status === "PAID") {
      return NextResponse.json({ error: "Cette commande est déjà payée." }, { status: 409 });
    }

    const phone = decryptField(order.subscription.phone);
    const operator = toOperator(order.subscription.paymentMethod);

    const result = await initiatePayment({
      amount: order.amount,
      operator,
      customerPhone: normalizePhone(phone),
      customerName: user.fullName,
      orderId: order.id,
      otpCode: otpCode || undefined,
    });

    const mappedStatus =
      result.status === "Completed" ? "SUCCESS" : result.status === "Pending" ? "PENDING" : "FAILED";

    await db.payment.upsert({
      where: { orderId: order.id },
      update: {
        method: order.subscription.paymentMethod,
        status: mappedStatus,
        token: result.token,
        internalId: result.internalId,
        operator,
        failedReason: result.failedReason,
      },
      create: {
        orderId: order.id,
        method: order.subscription.paymentMethod,
        status: mappedStatus,
        token: result.token,
        internalId: result.internalId,
        operator,
        failedReason: result.failedReason,
      },
    });

    if (result.status === "Completed") {
      await db.order.update({ where: { id: order.id }, data: { status: "PAID" } });
      await db.subscription.update({
        where: { id: order.subscriptionId },
        data: { status: "ACTIVE", failedCycles: 0 },
      });
    } else if (result.status === "Failed" || result.status === "Cancelled") {
      await db.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
    }

    await logActivity({
      userId: user.id,
      userName: user.fullName,
      role: user.role,
      action: `Paiement initié (${operator}) — commande #${order.id.slice(0, 6)} — ${result.status}`,
    });

    return NextResponse.json({
      token: result.token,
      status: result.status,
      nextAction: result.nextAction,
      redirectUrl: result.redirectUrl,
      otpRequired: result.otpRequired,
      failedReason: result.failedReason,
      message: result.message,
    });
  } catch (err) {
    console.error("Erreur /api/payments/initiate :", err);
    const message = err instanceof Error ? err.message : "Erreur serveur.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}