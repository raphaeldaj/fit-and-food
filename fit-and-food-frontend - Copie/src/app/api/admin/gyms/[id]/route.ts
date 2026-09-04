import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
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