import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { syncOrderPaymentStatus } from "@/lib/payments/syncOrder";

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

  const status = await syncOrderPaymentStatus(payment.orderId);
  return NextResponse.json({ status: status ?? payment.status });
}