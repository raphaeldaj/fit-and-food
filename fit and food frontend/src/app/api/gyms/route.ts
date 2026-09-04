import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const gyms = await db.gym.findMany({
    where: { active: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ gyms });
}