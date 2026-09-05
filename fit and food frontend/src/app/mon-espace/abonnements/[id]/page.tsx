import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import EditSubscriptionComposition from "@/components/dashboard/EditSubscriptionComposition";

export default async function EditSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const subscription = await db.subscription.findUnique({
    where: { id },
    include: { pack: true, items: { include: { meal: true } } },
  });

  if (!subscription || subscription.userId !== user.id) redirect("/mon-espace");

  const initialItems = subscription.items.map((it) => ({
    mealId: it.mealId,
    name: it.meal.name,
    type: it.meal.type as "Repas" | "Collation",
    quantity: it.quantity,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-heading text-secondary mb-1">
        Modifier la composition — {subscription.pack.formule}
      </h1>
      <p className="text-text-muted text-sm mb-6">
        Change librement tes repas et collations dans la limite du quota du pack.
      </p>

      {subscription.status !== "ACTIVE" ? (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-text-muted text-sm">
            Cet abonnement n&apos;est pas actif ({subscription.status.toLowerCase()}), sa composition ne peut pas être modifiée.
          </p>
        </div>
      ) : (
        <EditSubscriptionComposition
          subscriptionId={subscription.id}
          mealsQty={subscription.pack.mealsQty}
          snackQty={subscription.pack.snackQty}
          initialItems={initialItems}
        />
      )}
    </div>
  );
}