import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const orders = await db.order.findMany({
    include: { subscription: { include: { user: true } } },
    orderBy: { cycleDate: "desc" },
  });

  return NextResponse.json({
    orders: orders.map((o) => ({ id: o.id, subscription: o.subscription.user.fullName, amount: o.amount, status: o.status })),
  });
}