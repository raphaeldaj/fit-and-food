"use client";

import { useEffect, useState } from "react";

const ALLERGENS = ["Sans Lactose", "Sans Gluten"];

export interface MealFormData {
  id?: string;
  name: string;
  type: string;
  calories: number;
  proteins: number;
  goal: string;
  photoUrl: string;
  categories: string[];
  allergenTags: string[];
}

interface Props {
  initial?: MealFormData;
  onSaved: () => void;
  onCancel: () => void;
}

export default function MealForm({ initial, onSaved, onCancel }: Props) {
  const isEdit = !!initial?.id;
  const [categories, setCategories] = useState<string[]>([]);
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState(initial?.type ?? "Repas");
  const [calories, setCalories] = useState(initial ? String(initial.calories) : "");
  const [proteins, setProteins] = useState(initial ? String(initial.proteins) : "");
  const [goal, setGoal] = useState(initial?.goal ?? "");
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl ?? "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initial?.categories ?? []);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(initial?.allergenTags ?? []);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories").then((res) => res.json()).then((data) => setCategories(data.categories ?? []));
  }, []);

  const toggleValue = (value: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const submit = async () => {
    setError(null);
    if (!name || !calories || !proteins) {
      setError("Nom, calories et protéines sont obligatoires.");
      return;
    }
    setLoading(true);
    const url = isEdit ? `/api/admin/catalog/${initial!.id}` : "/api/admin/catalog";
    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        type,
        calories: Number(calories),
        proteins: Number(proteins),
        goal: goal || null,
        categories: selectedCategories,
        allergenTags: selectedAllergens,
        photoUrl: photoUrl || null,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Erreur.");
      return;
    }
    onSaved();
  };

  return (
    <div className="bg-bg-light rounded-lg p-4 mb-4">
      <h5 className="font-heading text-secondary text-sm mb-3">{isEdit ? "Modifier le plat" : "Nouveau plat"}</h5>
      {error && <p className="bg-danger/10 text-danger text-sm rounded-md p-2 mb-3">{error}</p>}

      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-semibold mb-1">Nom</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-border rounded-md p-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border border-border rounded-md p-2 text-sm">
            <option value="Repas">Repas</option>
            <option value="Collation">Collation</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Calories (kcal)</label>
          <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} className="w-full border border-border rounded-md p-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Protéines (g)</label>
          <input type="number" value={proteins} onChange={(e) => setProteins(e.target.value)} className="w-full border border-border rounded-md p-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Objectif (optionnel)</label>
          <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full border border-border rounded-md p-2 text-sm">
            <option value="">Les deux / non spécifié</option>
            <option value="PRISE_DE_MASSE">Prise de masse</option>
            <option value="PERTE_DE_POIDS">Perte de poids</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Photo (URL, optionnel)</label>
          <input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." className="w-full border border-border rounded-md p-2 text-sm" />
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-semibold mb-1.5">Catégories</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleValue(c, selectedCategories, setSelectedCategories)}
              className={`text-xs px-3 py-1 rounded-full border ${selectedCategories.includes(c) ? "bg-secondary text-white border-secondary" : "bg-white border-border text-text-dark"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold mb-1.5">Allergènes / restrictions</label>
        <div className="flex flex-wrap gap-2">
          {ALLERGENS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => toggleValue(a, selectedAllergens, setSelectedAllergens)}
              className={`text-xs px-3 py-1 rounded-full border ${selectedAllergens.includes(a) ? "bg-secondary text-white border-secondary" : "bg-white border-border text-text-dark"}`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={submit} disabled={loading} className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-md disabled:opacity-50">
          {loading ? "Enregistrement..." : isEdit ? "Enregistrer" : "Ajouter le plat"}
        </button>
        <button onClick={onCancel} className="border border-border text-text-dark text-xs font-semibold px-4 py-2 rounded-md">
          Annuler
        </button>
      </div>
    </div>
  );
}