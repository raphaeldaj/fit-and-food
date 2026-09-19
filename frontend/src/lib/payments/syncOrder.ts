import { db } from "@/lib/db";
import { getCheckoutSessionStatus } from "./senepay";

/**
 * Vérifie activement le statut réel d'une commande auprès de SenePay
 * et met à jour la base si nécessaire — filet de sécurité si le webhook
 * n'est jamais arrivé (mauvaise clé, service endormi, etc.).
 */
export async function syncOrderPaymentStatus(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { subscription: true, payment: true },
  });

  if (!order) return null;
  if (order.status === "PAID" || order.status === "FAILED") return order.status;
  if (!order.payment?.token) return order.status; // rien à vérifier côté SenePay

  try {
    const result = await getCheckoutSessionStatus(order.payment.token);

    if (result.status === "Complete") {
      await db.payment.update({ where: { orderId: order.id }, data: { status: "SUCCESS" } });
      await db.order.update({ where: { id: order.id }, data: { status: "PAID" } });
      await db.subscription.update({
        where: { id: order.subscriptionId },
        data: { status: "ACTIVE", failedCycles: 0 },
      });
      await db.delivery.upsert({
        where: { orderId: order.id },
        update: {},
        create: {
          orderId: order.id,
          slot: order.subscription.slot,
          date: order.subscription.nextDueDate,
          status: "scheduled",
        },
      });
      return "PAID";
    }

    if (result.status === "Failed" || result.status === "Cancelled" || result.status === "Expired") {
      await db.payment.update({ where: { orderId: order.id }, data: { status: "FAILED" } });
      await db.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
      return "FAILED";
    }

    return order.status; // toujours en attente
  } catch (err) {
    console.error("Erreur synchronisation statut SenePay :", err);
    return order.status;
  }
}
