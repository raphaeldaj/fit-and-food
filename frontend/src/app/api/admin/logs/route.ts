import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { decryptField } from "@/lib/security/crypto";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const logs = await db.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return NextResponse.json({
    logs: logs.map((l) => ({
      id: l.id,
      userName: decryptField(l.userName),
      role: l.role,
      action: l.action,
      createdAt: l.createdAt,
    })),
  });
}