import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const subs = await db.subscription.findMany({
    include: { user: true, pack: true, gym: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    subscriptions: subs.map((s) => ({
      id: s.id,
      client: s.user.fullName,
      formule: `${s.pack.formule} (${s.pack.goal})`,
      slot: s.slot,
      gym: s.gym?.name ?? "-",
      status: s.status,
    })),
  });
}