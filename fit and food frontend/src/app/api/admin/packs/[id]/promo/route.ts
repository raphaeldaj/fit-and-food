import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const promoPercent = Number(body.promoPercent);
  const promoActive = Boolean(body.promoActive);

  if (Number.isNaN(promoPercent) || promoPercent < 0 || promoPercent > 90) {
    return NextResponse.json({ error: "Pourcentage invalide (0 à 90)." }, { status: 400 });
  }

  await db.pack.update({ where: { id }, data: { promoPercent, promoActive } });

  await db.adminLog.create({
    data: {
      adminName: "Admin",
      action: `Promo ${promoActive ? "activée" : "désactivée"} sur le pack #${id.slice(0, 6)} (${promoPercent}%)`,
    },
  });

  return NextResponse.json({ success: true });
}