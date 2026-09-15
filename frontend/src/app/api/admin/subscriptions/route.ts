import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { decryptField } from "@/lib/security/crypto";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const subs = await db.subscription.findMany({
    include: { user: true, pack: true, gym: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    subscriptions: subs.map((s) => ({
      id: s.id,
      client: decryptField(s.user.fullName),
      formule: `${s.pack.formule} (${s.pack.goal})`,
      slot: s.slot,
      gym: s.gym?.name ?? "-",
      status: s.status,
    })),
  });
}