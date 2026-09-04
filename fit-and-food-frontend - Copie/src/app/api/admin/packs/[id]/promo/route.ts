import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { promoPercent, promoActive } = await req.json();

  if (typeof promoPercent !== "number" || promoPercent < 0 || promoPercent > 90) {
    return NextResponse.json({ error: "Pourcentage invalide (0 à 90)." }, { status: 400 });
  }

  await db.pack.update({
    where: { id },
    data: { promoPercent, promoActive: !!promoActive },
  });

  await db.adminLog.create({
    data: {
      adminName: "Admin",
      action: `Promo ${promoActive ? "activée" : "désactivée"} sur le pack #${id.slice(0, 6)} (${promoPercent}%)`,
    },
  });

  return NextResponse.json({ success: true });
}