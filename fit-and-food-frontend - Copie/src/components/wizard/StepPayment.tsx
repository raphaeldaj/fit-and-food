"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Pack } from "@/types";
import type { SelectedMeal } from "./SubscriptionWizard";

interface Gym { id: string; name: string; }

interface Props {
  pack: Pack;
  mixedGoal: boolean;
  selectedMeals: SelectedMeal[];
  onBack: () => void;
}

export default function StepPayment({ pack, mixedGoal, selectedMeals, onBack }: Props) {
  const router = useRouter();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [gymId, setGymId] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [slot, setSlot] = useState<"LUNDI" | "JEUDI">("LUNDI");
  const [paymentMethod, setPaymentMethod] = useState<"WAVE" | "ORANGE_MONEY">("WAVE");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/gyms").then((res) => res.json()).then((data) => setGyms(data.gyms ?? []));
  }, []);

  const cutoffWarning =
    slot === "LUNDI"
      ? "Cutoff : vendredi 23h59. Après ce délai, la souscription est reportée au lundi suivant."
      : "Cutoff : mardi 23h59. Après ce délai, la souscription est reportée au jeudi suivant.";

  const submit = async () => {
    setError(null);
    if (!address || !phone) {
      setError("Merci de renseigner l'adresse et le téléphone.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        packId: pack.id,
        mixedGoal,
        slot,
        paymentMethod,
        address,
        phone,
        gymId: gymId || null,
        items: selectedMeals.map((m) => ({ mealId: m.mealId, quantity: m.quantity })),
      }),
    });
    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error ?? "Erreur lors de la souscription.");
      return;
    }
    router.push("/mon-espace");
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
      <div className="border-b-2 border-bg-light pb-3 mb-5">
        <h3 className="font-heading text-secondary">3. Finalisation &amp; Paiement Récurrent</h3>
      </div>

      {error && <p className="bg-danger/10 text-danger text-sm rounded-md p-3 mb-4">{error}</p>}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <FormField label="Salle de Sport Partenaire">
            <select value={gymId} onChange={(e) => setGymId(e.target.value)} className="w-full border border-border rounded-md p-2.5 text-sm">
              <option value="">Aucune / à préciser plus tard</option>
              {gyms.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </FormField>
          <FormField label="Adresse de Livraison à Dakar">
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="ex: Mermoz, Rue MZ 12, Appt B3" className="w-full border border-border rounded-md p-2.5 text-sm" />
          </FormField>
          <FormField label="Numéro Téléphone (Wave / Orange Money)">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="77 XXX XX XX" className="w-full border border-border rounded-md p-2.5 text-sm" />
          </FormField>
        </div>

        <div>
          <FormField label="Créneau de Livraison Récurrent">
            <select value={slot} onChange={(e) => setSlot(e.target.value as "LUNDI" | "JEUDI")} className="w-full border border-border rounded-md p-2.5 text-sm">
              <option value="LUNDI">Lundi (cutoff : vendredi 23h59)</option>
              <option value="JEUDI">Jeudi (cutoff : mardi 23h59)</option>
            </select>
            <small className="block mt-1.5 text-xs text-warning">{cutoffWarning}</small>
          </FormField>

          <FormField label="Moyen de Paiement Automatisé">
            <div className="flex gap-3">
              {(["WAVE", "ORANGE_MONEY"] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`flex-1 border-2 rounded-md py-2.5 text-sm font-semibold ${paymentMethod === method ? "border-primary bg-primary/5 text-primary" : "border-border text-text-dark"}`}
                >
                  {method === "WAVE" ? "Wave" : "Orange Money"}
                </button>
              ))}
            </div>
          </FormField>

          <div className="bg-bg-light rounded-md p-3.5 mt-4">
            <div className="flex justify-between font-bold flex-wrap gap-1.5">
              <span>Total Abonnement :</span>
              <span className="text-primary">{pack.effectivePrice.toLocaleString("fr-FR")} FCFA</span>
            </div>
            <small className="text-text-muted">
              Livraison incluse • Prélèvement automatique par cycle • Aucune donnée bancaire stockée
            </small>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={onBack} className="border border-border text-text-dark px-5 py-2.5 rounded-md text-sm font-semibold">
          ← Retour aux plats
        </button>
        <button onClick={submit} disabled={loading} className="bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-2.5 rounded-md">
          {loading ? "Traitement..." : "Confirmer & Payer l'Abonnement"}
        </button>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold mb-1">{label}</label>
      {children}
    </div>
  );
}