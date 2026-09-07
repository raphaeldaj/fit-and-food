import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import DashboardActions from "@/components/dashboard/DashboardActions";
import EditDeliveryInfo from "@/components/dashboard/EditDeliveryInfo";
import ReviewForm from "@/components/dashboard/ReviewForm";
import { IconStar } from "@/components/icons";
import { decryptField } from "@/lib/security/crypto";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = { ACTIVE: "Actif", SUSPENDED: "Suspendu", CANCELLED: "Annulé" };

export default async function MonEspacePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const subscriptions = await db.subscription.findMany({
    where: { userId: user.id },
    include: { pack: true, orders: { include: { payment: true }, orderBy: { cycleDate: "desc" } } },
    orderBy: { createdAt: "desc" },
  });

  const gymIds = [...new Set(subscriptions.map((s) => s.gymId).filter((id): id is string => !!id))];
  const gyms = gymIds.length ? await db.gym.findMany({ where: { id: { in: gymIds } } }) : [];
  const gymMap = new Map(gyms.map((g) => [g.id, g.name]));

  const allOrders = subscriptions.flatMap((s) => s.orders.map((o) => ({ ...o, formule: s.pack.formule })));

  const reviews = await db.review.findMany({
    where: { userId: user.id },
    include: { meal: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex justify-between items-start flex-wrap gap-2 mb-1">
        <h1 className="text-2xl font-heading text-secondary">Mon Espace Abonné</h1>
        <Link href="/mon-espace/parametres" className="text-sm text-secondary underline">Paramètres du compte</Link>
      </div>
      <p className="text-text-muted text-sm mb-8">Gérez vos abonnements, vos livraisons, paiements et avis</p>

      <h3 className="font-heading text-secondary mb-3">Mes Abonnements</h3>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {subscriptions.length ? subscriptions.map((sub) => {
          const address = decryptField(sub.address);
          const phone = decryptField(sub.phone);
          return (
            <div key={sub.id} className="bg-white rounded-xl p-6 shadow-sm">
              <dl className="space-y-1.5 text-sm">
                <Row label="Formule" value={`${sub.pack.formule} — ${sub.pack.goal.replace("_", " ")}`} />
                <Row label="Statut" value={STATUS_LABELS[sub.status]} />
                <Row label="Créneau Livraison" value={sub.slot} />
                <Row label="Salle Partenaire" value={sub.gymId ? gymMap.get(sub.gymId) ?? "-" : "-"} />
                <Row label="Adresse" value={address} />
                <Row label="Téléphone" value={phone} />
                <Row label="Prochaine Échéance" value={sub.nextDueDate.toLocaleDateString("fr-FR")} />
              </dl>
              <EditDeliveryInfo subscriptionId={sub.id} initialAddress={address} initialPhone={phone} />
              <DashboardActions subscriptionId={sub.id} status={sub.status} />
            </div>
          );
        }) : (
          <p className="text-text-muted text-sm">Aucun abonnement pour l&apos;instant.</p>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6 overflow-x-auto">
        <h3 className="font-heading text-secondary mb-4">Historique des Commandes</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-text-muted text-xs">
              <th className="pb-2">Commande</th><th className="pb-2">Abonnement</th><th className="pb-2">Cycle</th><th className="pb-2">Montant</th><th className="pb-2">Statut</th>
            </tr>
          </thead>
          <tbody>
            {allOrders.length ? allOrders.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="py-2">#{o.id.slice(0, 6)}</td>
                <td className="py-2">{o.formule}</td>
                <td className="py-2">{o.cycleDate.toLocaleDateString("fr-FR")}</td>
                <td className="py-2">{o.amount.toLocaleString("fr-FR")} F</td>
                <td className="py-2">{o.status}</td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="text-text-muted py-3">Aucune commande</td></tr>
            )}
          </tbody>
        </table>
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
            {allOrders.filter((o) => o.payment).length ? allOrders.filter((o) => o.payment).map((o) => (
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

        <ReviewForm />

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