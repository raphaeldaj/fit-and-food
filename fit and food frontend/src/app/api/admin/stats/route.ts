import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const activeSubs = await db.subscription.count({ where: { status: "ACTIVE" } });
  const paidOrders = await db.order.findMany({ where: { status: "PAID" } });
  const revenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);
  const totalOrders = await db.order.count();
  const renewalRate = totalOrders > 0 ? Math.round((paidOrders.length / totalOrders) * 100) : 0;

  return NextResponse.json({ activeSubs, revenue, renewalRate });
}