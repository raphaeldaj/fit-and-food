import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { decryptField } from "@/lib/security/crypto";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const gyms = await db.gym.findMany({
    orderBy: { name: "asc" },
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        include: { user: true, pack: true },
      },
    },
  });

  const withoutGym = await db.subscription.findMany({
    where: { status: "ACTIVE", gymId: null },
    include: { user: true, pack: true },
  });

  return NextResponse.json({
    groups: [
      ...gyms.map((g) => ({
        gymId: g.id,
        gymName: g.name,
        weeklyFee: g.weeklyFee,
        clients: g.subscriptions.map((s) => ({
          id: s.id,
          name: decryptField(s.user.fullName),
          formule: `${s.pack.formule} (${s.pack.goal})`,
          slot: s.slot,
        })),
      })),
      ...(withoutGym.length
        ? [{
            gymId: "none",
            gymName: "Sans salle (anciens abonnements)",
            weeklyFee: 0,
            clients: withoutGym.map((s) => ({
              id: s.id,
              name: decryptField(s.user.fullName),
              formule: `${s.pack.formule} (${s.pack.goal})`,
              slot: s.slot,
            })),
          }]
        : []),
    ],
  });
}