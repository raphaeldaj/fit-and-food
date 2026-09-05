import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const logs = await db.adminLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json({ logs });
}