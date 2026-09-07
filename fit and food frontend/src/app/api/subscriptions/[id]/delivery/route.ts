import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const subscription = await db.subscription.findUnique({ where: { id } });
  if (!subscription || subscription.userId !== user.id) {
    return NextResponse.json({ error: "Abonnement introuvable." }, { status: 404 });
  }

  const { address, phone } = await req.json();
  if (!address || !phone) {
    return NextResponse.json({ error: "Adresse et téléphone obligatoires." }, { status: 400 });
  }

  await db.subscription.update({ where: { id }, data: { address, phone } });
  return NextResponse.json({ success: true });
}