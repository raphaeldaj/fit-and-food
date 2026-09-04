import { cookies } from "next/headers";
import { verifyAccessToken } from "./jwt";
import { db } from "@/lib/db";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;

  try {
    const payload = await verifyAccessToken(token);
    const user = await db.user.findUnique({ where: { id: payload.sub as string } });
    return user;
  } catch {
    return null;
  }
}