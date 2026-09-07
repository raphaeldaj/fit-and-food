import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const { name, address } = await req.json();
  if (!name || !address) {
    return NextResponse.json({ error: "Nom et adresse obligatoires." }, { status: 400 });
  }

  const gym = await db.gym.update({ where: { id }, data: { name, address } });
  await db.adminLog.create({ data: { adminName: "Admin", action: `Salle modifiée : ${gym.name}` } });

  return NextResponse.json({ gym });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const gym = await db.gym.findUnique({ where: { id } });
  if (!gym) return NextResponse.json({ error: "Salle introuvable." }, { status: 404 });

  try {
    await db.gym.delete({ where: { id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return NextResponse.json(
        { error: "Cette salle est rattachée à des clients ou abonnements existants. Désactive-la plutôt." },
        { status: 409 }
      );
    }
    throw err;
  }

  await db.adminLog.create({ data: { adminName: "Admin", action: `Salle supprimée : ${gym.name}` } });
  return NextResponse.json({ success: true });
}