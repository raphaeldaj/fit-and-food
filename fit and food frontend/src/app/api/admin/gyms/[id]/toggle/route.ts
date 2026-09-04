import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const gym = await db.gym.findUnique({ where: { id } });
  if (!gym) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  await db.gym.update({ where: { id }, data: { active: !gym.active } });
  return NextResponse.json({ success: true });
}