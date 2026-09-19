import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { syncOrderPaymentStatus } from "@/lib/payments/syncOrder";

export async function GET(_req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const order = await db.order.findUnique({ where: { id: orderId }, include: { subscription: true } });
  if (!order || order.subscription.userId !== user.id) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  const status = await syncOrderPaymentStatus(orderId);
  return NextResponse.json({ status: status ?? order.status });
}