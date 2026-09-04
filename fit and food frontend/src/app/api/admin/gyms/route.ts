import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const gyms = await db.gym.findMany({ include: { _count: { select: { users: true } } } });
  return NextResponse.json({ gyms });
}

export async function POST(req: NextRequest) {
  const { name, address } = await req.json();

  if (!name || !address) {
    return NextResponse.json({ error: "Nom et adresse obligatoires." }, { status: 400 });
  }

  const gym = await db.gym.create({ data: { name, address, active: true } });

  await db.adminLog.create({ data: { adminName: "Admin", action: `Nouvelle salle partenaire ajoutée : ${gym.name}` } });

  return NextResponse.json({ gym }, { status: 201 });
}