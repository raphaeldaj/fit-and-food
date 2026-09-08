import { db } from "@/lib/db";

export async function logActivity(params: {
  userId?: string | null;
  userName: string;
  role?: string | null;
  action: string;
}) {
  try {
    await db.activityLog.create({
      data: {
        userId: params.userId ?? null,
        userName: params.userName,
        role: params.role ?? null,
        action: params.action,
      },
    });
  } catch (err) {
    console.error("Erreur journalisation activité :", err);
  }
}