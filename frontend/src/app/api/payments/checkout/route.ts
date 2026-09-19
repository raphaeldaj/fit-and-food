import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { createCheckoutSession } from "@/lib/payments/senepay";
import { logActivity } from "@/lib/security/activityLog";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed } = rateLimit(`checkout:${ip}`, 20, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Trop de tentatives. Réessaie dans une minute." }, { status: 429 });
    }

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

    const { orderId } = await req.json();
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

    const session = await createCheckoutSession({
      amount: order.amount,
      orderReference: order.id,
    });

    await db.payment.upsert({
      where: { orderId: order.id },
      update: { method: order.subscription.paymentMethod, status: "PENDING", token: session.sessionToken },
      create: {
        orderId: order.id,
        method: order.subscription.paymentMethod,
        status: "PENDING",
        token: session.sessionToken,
      },
    });

    await logActivity({
      userId: user.id,
      userName: user.fullName,
      role: user.role,
      action: `Session Checkout créée — commande #${order.id.slice(0, 6)}`,
    });

    return NextResponse.json({ checkoutUrl: session.checkoutUrl });
  } catch (err) {
    console.error("Erreur /api/payments/checkout :", err);
    const message = err instanceof Error ? err.message : "Erreur serveur.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}