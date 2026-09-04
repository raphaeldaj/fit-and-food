import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { id } = await params;

  const sub = await db.subscription.findUnique({ where: { id } });
  if (!sub || sub.userId !== user.id) {
    return NextResponse.json({ error: "Abonnement introuvable." }, { status: 404 });
  }

  await db.subscription.update({ where: { id }, data: { status: "SUSPENDED" } });
  return NextResponse.json({ success: true });
}