import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getEffectivePrice } from "@/lib/pricing";

export async function GET() {
  const packs = await db.pack.findMany({ orderBy: [{ goal: "asc" }, { price: "asc" }] });
  return NextResponse.json({
    packs: packs.map((p) => ({ ...p, effectivePrice: getEffectivePrice(p) })),
  });
}