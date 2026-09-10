import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { logActivity } from "@/lib/security/activityLog";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const gyms = await db.gym.findMany({ include: { _count: { select: { users: true } } } });
  return NextResponse.json({ gyms });
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const { name, address } = await req.json();
  if (!name || !address) {
    return NextResponse.json({ error: "Nom et adresse obligatoires." }, { status: 400 });
  }

  const gym = await db.gym.create({ data: { name, address, active: true } });
  await logActivity({ userId: user!.id, userName: user!.fullName, role: user!.role, action: `Nouvelle salle partenaire ajoutée : ${gym.name}` });

  return NextResponse.json({ gym }, { status: 201 });
}