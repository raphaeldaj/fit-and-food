import { cookies } from "next/headers";
import { verifyAccessToken } from "./jwt";
import { db } from "@/lib/db";
import { decryptField } from "@/lib/security/crypto";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;

  try {
    const payload = await verifyAccessToken(token);
    const user = await db.user.findUnique({ where: { id: payload.sub as string } });
    if (!user) return null;

    return {
      ...user,
      fullName: decryptField(user.fullName),
      email: decryptField(user.email),
      phone: decryptField(user.phone),
      address: user.address ? decryptField(user.address) : null,
    };
  } catch {
    return null;
  }
}