import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { price } = await req.json();

  if (typeof price !== "number" || price <= 0) {
    return NextResponse.json({ error: "Prix invalide." }, { status: 400 });
  }

  await db.pack.update({ where: { id }, data: { price } });
  return NextResponse.json({ success: true });
}