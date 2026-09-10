import SubscriptionWizard from "@/components/wizard/SubscriptionWizard";
import CutoffBadge from "@/components/home/CutoffBadge";
import { IconDelivery, IconPayment, IconMeal } from "@/components/icons";

export default function HomePage() {
  return (
    <>
      <section
        className="text-white text-center px-4 py-16"
        style={{
          background:
            "linear-gradient(rgba(17,27,58,.85),rgba(17,27,58,.85)), url('https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=1350&q=80') center/cover",
        }}
      >
        <CutoffBadge />
        <h1 className="text-3xl md:text-5xl font-heading font-extrabold uppercase mb-3">
          Eat Clean, Live Lean
        </h1>
        <p className="max-w-xl mx-auto text-gray-300 mb-6">
          Abonnements de repas sains préparés à Dakar. Sélections sur-mesure pour vos objectifs sportifs.
        </p>
        <div className="flex justify-center gap-6 flex-wrap text-xs text-gray-300">
          <span className="flex items-center gap-1.5"><IconDelivery size={14} /> Livraison Lundi &amp; Jeudi</span>
          <span className="flex items-center gap-1.5"><IconPayment size={14} /> Paiement Wave / Orange Money</span>
          <span className="flex items-center gap-1.5"><IconMeal size={14} /> Repas macro-équilibrés</span>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-center text-2xl md:text-3xl font-heading text-secondary mt-8 mb-2">
          Composez Votre Pack Repas
        </h2>
        <p className="text-center text-text-muted text-sm mb-8">
          Abonnement récurrent — reconduction et paiement automatiques à chaque cycle
        </p>
        <SubscriptionWizard />
      </div>
    </>
  );
}