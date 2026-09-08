import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { logActivity } from "@/lib/security/activityLog";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const promoPercent = Number(body.promoPercent);
  const promoActive = Boolean(body.promoActive);

  if (Number.isNaN(promoPercent) || promoPercent < 0 || promoPercent > 90) {
    return NextResponse.json({ error: "Pourcentage invalide (0 à 90)." }, { status: 400 });
  }

  await db.pack.update({ where: { id }, data: { promoPercent, promoActive } });

  await logActivity({
    userId: user!.id,
    userName: user!.fullName,
    role: user!.role,
    action: `Promo ${promoActive ? "activée" : "désactivée"} sur le pack #${id.slice(0, 6)} (${promoPercent}%)`,
  });

  return NextResponse.json({ success: true });
}