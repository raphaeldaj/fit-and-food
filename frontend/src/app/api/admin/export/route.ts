import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const type = req.nextUrl.searchParams.get("type") ?? "subscriptions";

  let rows: Record<string, unknown>[] = [];
  if (type === "subscriptions") {
    const subs = await db.subscription.findMany({ include: { user: true, pack: true } });
    rows = subs.map((s) => ({ id: s.id, client: s.user.fullName, formule: s.pack.formule, statut: s.status }));
  }

  const header = rows.length ? Object.keys(rows[0]).join(",") : "";
  const csv = [header, ...rows.map((r) => Object.values(r).join(","))].join("\n");

  return new NextResponse(csv, {
    headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="${type}.csv"` },
  });
}