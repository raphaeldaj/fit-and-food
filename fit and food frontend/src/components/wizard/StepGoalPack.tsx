"use client";

import { useEffect, useState } from "react";
import type { Pack } from "@/types";

const FORMULE_LABELS: Record<string, string> = {
  DECOUVERTE: "Découverte",
  ESSENTIEL: "Essentiel",
  PERFORMANCE: "Performance",
};

interface Props {
  goal: "PRISE_DE_MASSE" | "PERTE_DE_POIDS";
  setGoal: (g: "PRISE_DE_MASSE" | "PERTE_DE_POIDS") => void;
  mixedGoal: boolean;
  setMixedGoal: (v: boolean) => void;
  selectedPack: Pack | null;
  setSelectedPack: (p: Pack) => void;
  onNext: () => void;
}

export default function StepGoalPack({
  goal, setGoal, mixedGoal, setMixedGoal, selectedPack, setSelectedPack, onNext,
}: Props) {
  const [packs, setPacks] = useState<Pack[]>([]);

  useEffect(() => {
    fetch("/api/packs").then((res) => res.json()).then((data) => setPacks(data.packs ?? []));
  }, []);

  const packsForGoal = packs.filter((p) => p.goal === goal);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
      <div className="border-b-2 border-bg-light pb-3 mb-5">
        <h3 className="font-heading text-secondary">1. Choisissez votre Objectif &amp; Formule</h3>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Sélectionnez votre Objectif Santé :</label>
        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setGoal("PRISE_DE_MASSE")}
            className={`px-4 py-2 rounded-md text-sm font-semibold border ${goal === "PRISE_DE_MASSE" ? "bg-secondary text-white border-secondary" : "border-border text-text-dark"}`}
          >
            Prise de Masse
          </button>
          <button
            type="button"
            onClick={() => setGoal("PERTE_DE_POIDS")}
            className={`px-4 py-2 rounded-md text-sm font-semibold border ${goal === "PERTE_DE_POIDS" ? "bg-secondary text-white border-secondary" : "border-border text-text-dark"}`}
          >
            Perte de Poids
          </button>
        </div>
      </div>

      <label className="block text-sm font-semibold mb-2">Sélectionnez votre Pack Repas :</label>
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        {packsForGoal.map((pack) => (
          <button
            key={pack.id}
            type="button"
            onClick={() => setSelectedPack(pack)}
            className={`border-2 rounded-lg p-4 text-center transition hover:-translate-y-0.5 ${selectedPack?.id === pack.id ? "border-primary bg-primary/5" : "border-border"}`}
          >
            <h4 className="text-secondary font-heading mb-1">{FORMULE_LABELS[pack.formule]}</h4>
            <p className="text-xs text-text-muted mb-2">
              {pack.mealsQty} repas{pack.snackQty > 0 ? ` + ${pack.snackQty} collations` : ""}
            </p>
            {/* <p className="text-primary text-xl font-bold">{pack.price.toLocaleString("fr-FR")} F</p> */}
            <p className="text-primary text-xl font-bold">
                {pack.promoActive && pack.promoPercent > 0 ? (
                    <>
                    <span className="line-through text-text-muted text-sm mr-2">
                        {pack.price.toLocaleString("fr-FR")} F
                    </span>
                    {pack.effectivePrice.toLocaleString("fr-FR")} F
                    </>
                ) : (
                    `${pack.price.toLocaleString("fr-FR")} F`
                )}
                </p>
                {pack.promoActive && pack.promoPercent > 0 && (
                <span className="inline-block bg-danger text-white text-[0.65rem] font-bold px-2 py-0.5 rounded-full mt-1">
                    -{pack.promoPercent}%
                </span>
                )}
          </button>
        ))}
      </div>

      <div className="flex items-start gap-2.5 bg-bg-light rounded-md p-3.5 text-sm mb-6">
        <input type="checkbox" id="mixed-goal" checked={mixedGoal} onChange={(e) => setMixedGoal(e.target.checked)} className="mt-1" />
        <label htmlFor="mixed-goal">
          <strong>Choix mixte (objectifs combinés)</strong> — autorise à composer le pack avec des plats des deux objectifs.
          Ce cas sera tracé sur l'abonnement (<code>mixed_goal: true</code>).
        </label>
      </div>

      <div className="text-right">
        <button
          onClick={onNext}
          disabled={!selectedPack}
          className="bg-primary hover:bg-primary-hover disabled:opacity-40 text-white font-semibold px-6 py-2.5 rounded-md"
        >
          Étape Suivante : Sélection des plats →
        </button>
      </div>
    </div>
  );
}