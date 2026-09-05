import { NextResponse } from "next/server";
import { getCurrentUser } from "./session";

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { user: null, error: NextResponse.json({ error: "Accès refusé." }, { status: 403 }) };
  }
  return { user, error: null };
}