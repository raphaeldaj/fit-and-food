import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ categories: categories.map((c) => c.name) });
}