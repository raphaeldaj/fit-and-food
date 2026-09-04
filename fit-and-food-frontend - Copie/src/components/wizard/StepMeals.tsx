"use client";

import { useEffect, useState } from "react";
import { IconMinus, IconPlus, IconMixed } from "@/components/icons";
import type { Pack } from "@/types";
import type { SelectedMeal } from "./SubscriptionWizard";

interface MealItem {
  id: string;
  name: string;
  photoUrl: string | null;
  calories: number;
  proteins: number;
  type: "Repas" | "Collation";
  allergenTags: string[];
  categories: string[];
  availability: "IN_STOCK" | "OUT_OF_STOCK";
}

interface Props {
  pack: Pack;
  mixedGoal: boolean;
  selectedMeals: SelectedMeal[];
  setSelectedMeals: (m: SelectedMeal[]) => void;
  onBack: () => void;
  onNext: () => void;
}

const CATEGORIES = ["Volaille", "Boeuf", "Poisson", "Végétal", "Protéiné"];

export default function StepMeals({ pack, mixedGoal, selectedMeals, setSelectedMeals, onBack, onNext }: Props) {
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [allergenFilter, setAllergenFilter] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams();
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    if (allergenFilter !== "all") params.set("allergen", allergenFilter);

    fetch(`/api/meals?${params.toString()}`).then((res) => res.json()).then((data) => setMeals(data.meals ?? []));
  }, [typeFilter, categoryFilter, allergenFilter]);

  const repasCount = selectedMeals.filter((m) => m.type === "Repas").reduce((s, m) => s + m.quantity, 0);
  const snackCount = selectedMeals.filter((m) => m.type === "Collation").reduce((s, m) => s + m.quantity, 0);
  const quotaFull = repasCount >= pack.mealsQty && snackCount >= pack.snackQty;

  const getQty = (mealId: string) => selectedMeals.find((m) => m.mealId === mealId)?.quantity ?? 0;

  const updateQty = (meal: MealItem, delta: number) => {
    const current = getQty(meal.id);
    const isRepas = meal.type === "Repas";
    const currentTotal = isRepas ? repasCount : snackCount;
    const max = isRepas ? pack.mealsQty : pack.snackQty;

    if (delta > 0 && currentTotal >= max) return;

    const newQty = Math.max(0, current + delta);
    const rest = selectedMeals.filter((m) => m.mealId !== meal.id);
    setSelectedMeals(newQty > 0 ? [...rest, { mealId: meal.id, name: meal.name, type: meal.type, quantity: newQty }] : rest);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
      <div className="border-b-2 border-bg-light pb-3 mb-5 flex justify-between items-center flex-wrap gap-2">
        <h3 className="font-heading text-secondary">2. Personnalisez votre Menu</h3>
        <span className="text-primary font-bold text-sm">{pack.formule}</span>
      </div>

      <FilterRow label="Type" value={typeFilter} onChange={setTypeFilter} options={[["all", "Tous"], ["Repas", "Repas"], ["Collation", "Collations"]]} />
      <FilterRow label="Catégorie" value={categoryFilter} onChange={setCategoryFilter} options={[["all", "Toutes"], ...CATEGORIES.map((c) => [c, c] as [string, string])]} />
      <FilterRow label="Allergènes" value={allergenFilter} onChange={setAllergenFilter} options={[["all", "Aucun filtre"], ["Sans Lactose", "Sans Lactose"], ["Sans Gluten", "Sans Gluten"]]} />

      <div className="grid gap-4 sm:grid-cols-3 my-5">
        {meals.map((meal) => (
          <div key={meal.id} className="border border-border rounded-lg overflow-hidden bg-white flex flex-col">
            {meal.photoUrl && <img src={meal.photoUrl} alt={meal.name} className="h-32 w-full object-cover" />}
            <div className="p-3.5 flex flex-col flex-1">
              <strong className="text-sm">{meal.name}</strong>
              <p className="text-xs text-text-muted my-1.5">{meal.calories} kcal · {meal.proteins}g protéines</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {meal.categories.map((c) => (
                  <span key={c} className="text-[0.63rem] bg-teal-50 text-teal-800 px-1.5 py-0.5 rounded font-medium">{c}</span>
                ))}
                {meal.allergenTags.map((a) => (
                  <span key={a} className="text-[0.63rem] bg-slate-100 text-text-dark px-1.5 py-0.5 rounded font-medium">{a}</span>
                ))}
              </div>

              {meal.availability === "OUT_OF_STOCK" ? (
                <p className="mt-auto text-xs text-danger font-semibold">Rupture de stock</p>
              ) : (
                <div className="mt-auto flex items-center justify-between bg-bg-light rounded p-1">
                  <button onClick={() => updateQty(meal, -1)} disabled={getQty(meal.id) === 0} className="w-8 h-8 bg-white border border-border rounded text-secondary disabled:text-text-muted disabled:cursor-not-allowed">
                    <IconMinus size={14} className="mx-auto" />
                  </button>
                  <span className="font-semibold text-sm">{getQty(meal.id)}</span>
                  <button onClick={() => updateQty(meal, 1)} disabled={quotaFull} className="w-8 h-8 bg-white border border-border rounded text-secondary disabled:text-text-muted disabled:cursor-not-allowed">
                    <IconPlus size={14} className="mx-auto" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 bg-secondary text-white p-3.5 rounded-lg shadow-lg flex justify-between items-center flex-wrap gap-3">
        <div className="flex gap-3.5 flex-wrap">
          <span className="text-xs bg-white/10 px-3 py-1 rounded-full">Repas : {repasCount} / {pack.mealsQty}</span>
          <span className="text-xs bg-white/10 px-3 py-1 rounded-full">Collations : {snackCount} / {pack.snackQty}</span>
          {mixedGoal && (
            <span className="text-xs bg-white/10 px-3 py-1 rounded-full flex items-center gap-1">
              <IconMixed size={12} /> Choix mixte activé
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={onBack} className="text-white text-sm px-4 py-2 rounded-md border border-white/30">← Retour</button>
          <button onClick={onNext} disabled={!quotaFull} className="bg-primary disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-md">
            Validation &amp; Info →
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterRow({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div className="flex gap-2 flex-wrap items-center mb-3">
      <span className="text-[0.72rem] uppercase text-text-muted font-semibold mr-1">{label}</span>
      {options.map(([val, text]) => (
        <button
          key={val}
          onClick={() => onChange(val)}
          className={`text-xs px-3 py-1.5 rounded-full border ${value === val ? "bg-secondary text-white border-secondary" : "bg-bg-light border-border text-text-dark"}`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}