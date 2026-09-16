import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import PaymentFlow from "@/components/payment/PaymentFlow";

export default async function PaiementPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { subscription: true },
  });

  if (!order || order.subscription.userId !== user.id) redirect("/mon-espace");

  if (order.status === "PAID") {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 min-w-0 w-full">
        <div className="bg-white rounded-xl p-6 shadow-sm max-w-md mx-auto">
          <p className="text-success text-sm">Cette commande est déjà réglée.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 min-w-0 w-full">
      <h1 className="text-2xl font-heading text-secondary mb-6 text-center">Règlement de ta commande</h1>
      <PaymentFlow orderId={order.id} method={order.subscription.paymentMethod} amount={order.amount} />
    </div>
  );
}