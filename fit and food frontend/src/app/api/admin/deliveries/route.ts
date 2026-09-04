import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const deliveries = await db.delivery.findMany({
    include: { order: { include: { subscription: { include: { user: true } } } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({
    deliveries: deliveries.map((d) => ({ id: d.id, slot: d.slot, date: d.date, client: d.order.subscription.user.fullName, status: d.status })),
  });
}