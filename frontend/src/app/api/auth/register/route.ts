import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validators/auth";
import { hashPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { logActivity } from "@/lib/security/activityLog";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed } = rateLimit(`register:${ip}`, 5, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Trop de tentatives. Réessaie dans une minute." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { fullName, email, phone, password, gymId } = parsed.data;

    const existing = await db.user.findFirst({ where: { OR: [{ email }, { phone }] } });
    if (existing) {
      return NextResponse.json({ error: "Email ou téléphone déjà utilisé." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await db.user.create({
      data: { fullName, email, phone, passwordHash, gymId: gymId || null },
    });

    await logActivity({ userId: user.id, userName: user.fullName, role: "CLIENT", action: "Inscription" });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (err) {
    console.error("Erreur /api/auth/register :", err);
    return NextResponse.json({ error: "Erreur serveur, réessaie." }, { status: 500 });
  }
}