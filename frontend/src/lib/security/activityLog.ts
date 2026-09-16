import { db } from "@/lib/db";
import { encryptField, encryptFieldDeterministic } from "@/lib/security/crypto";

export async function logActivity(params: {
  userId?: string | null;
  userName: string;
  role?: string | null;
  action: string;
}) {
  try {
    await db.activityLog.create({
      data: {
        userIdEnc: params.userId ? encryptFieldDeterministic(params.userId) : null,
        userName: encryptField(params.userName),
        role: params.role ?? null,
        action: params.action,
      },
    });
  } catch (err) {
    console.error("Erreur journalisation activité :", err);
  }
}