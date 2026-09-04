import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import DashboardActions from "@/components/dashboard/DashboardActions";
import { IconStar } from "@/components/icons";

const STATUS_LABELS: Record<string, string> = { ACTIVE: "Actif", SUSPENDED: "Suspendu", CANCELLED: "Annulé" };

export default async function MonEspacePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const subscription = await db.subscription.findFirst({
    where: { userId: user.id, status: { not: "CANCELLED" } },
    include: { pack: true, orders: { include: { payment: true }, orderBy: { cycleDate: "desc" } } },
    orderBy: { createdAt: "desc" },
  });

  const gym = subscription?.gymId ? await db.gym.findUnique({ where: { id: subscription.gymId } }) : null;

  const reviews = await db.review.findMany({
    where: { userId: user.id },
    include: { meal: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-heading text-secondary mb-1">Mon Espace Abonné</h1>
      <p className="text-text-muted text-sm mb-8">Gérez votre abonnement, vos livraisons, paiements et avis</p>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-heading text-secondary mb-4">Abonnement Actif</h3>
          {subscription ? (
            <>
              <dl className="space-y-1.5 text-sm">
                <Row label="Formule" value={`${subscription.pack.formule} — ${subscription.pack.goal.replace("_", " ")}`} />
                <Row label="Statut" value={STATUS_LABELS[subscription.status]} />
                <Row label="Créneau Livraison" value={subscription.slot} />
                <Row label="Salle Partenaire" value={gym?.name ?? "-"} />
                <Row label="Prochaine Échéance" value={subscription.nextDueDate.toLocaleDateString("fr-FR")} />
              </dl>
              <DashboardActions subscriptionId={subscription.id} status={subscription.status} />
            </>
          ) : (
            <p className="text-text-muted text-sm">Aucun abonnement actif</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm overflow-x-auto">
          <h3 className="font-heading text-secondary mb-4">Historique des Commandes</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-muted text-xs">
                <th className="pb-2">Commande</th><th className="pb-2">Cycle</th><th className="pb-2">Montant</th><th className="pb-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {subscription?.orders.length ? subscription.orders.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="py-2">#{o.id.slice(0, 6)}</td>
                  <td className="py-2">{o.cycleDate.toLocaleDateString("fr-FR")}</td>
                  <td className="py-2">{o.amount.toLocaleString("fr-FR")} F</td>
                  <td className="py-2">{o.status}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="text-text-muted py-3">Aucune commande</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6 overflow-x-auto">
        <h3 className="font-heading text-secondary mb-4">Historique des Paiements</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-text-muted text-xs">
              <th className="pb-2">Paiement</th><th className="pb-2">Méthode</th><th className="pb-2">Commande liée</th><th className="pb-2">Statut</th>
            </tr>
          </thead>
          <tbody>
            {subscription?.orders.filter((o) => o.payment).length ? subscription.orders.filter((o) => o.payment).map((o) => (
              <tr key={o.payment!.id} className="border-t border-border">
                <td className="py-2">#{o.payment!.id.slice(0, 6)}</td>
                <td className="py-2">{o.payment!.method}</td>
                <td className="py-2">#{o.id.slice(0, 6)}</td>
                <td className="py-2">{o.payment!.status}</td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="text-text-muted py-3">Aucun paiement</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm overflow-x-auto">
        <h3 className="font-heading text-secondary mb-4">Repas Reçus &amp; Avis</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-text-muted text-xs">
              <th className="pb-2">Repas</th><th className="pb-2">Date</th><th className="pb-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length ? reviews.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="py-2">{r.meal.name}</td>
                <td className="py-2">{r.createdAt.toLocaleDateString("fr-FR")}</td>
                <td className="py-2 flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <IconStar key={i} size={14} className={i < r.rating ? "fill-primary text-primary" : "text-border"} />
                  ))}
                </td>
              </tr>
            )) : (
              <tr><td colSpan={3} className="text-text-muted py-3">Aucun avis</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="font-semibold">{label} :</dt>
      <dd className="text-text-muted text-right">{value}</dd>
    </div>
  );
}