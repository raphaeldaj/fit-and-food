import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validators/auth";
import { hashPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
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
    data: { fullName, email, phone, passwordHash, gymId },
  });

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}