"use client";

import { useEffect, useMemo, useState } from "react";
import MealForm from "./MealForm";
import SearchInput from "./SearchInput";

interface AdminMeal {
  id: string; name: string; type: string; calories: number; proteins: number;
  goal: "PRISE_DE_MASSE" | "PERTE_DE_POIDS" | null;
  photoUrl: string | null;
  availability: "IN_STOCK" | "OUT_OF_STOCK";
  categories: string[];
  allergenTags: string[];
}

export default function CatalogTab() {
  const [meals, setMeals] = useState<AdminMeal[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = () => {
    fetch("/api/admin/catalog").then((res) => res.json()).then((data) => setMeals(data.meals ?? []));
  };

  useEffect(load, []);

  const toggleStock = async (id: string) => {
    await fetch(`/api/admin/catalog/${id}/toggle-stock`, { method: "POST" });
    load();
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Supprimer définitivement "${name}" ?`)) return;
    setError(null);
    const res = await fetch(`/api/admin/catalog/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Erreur lors de la suppression.");
      return;
    }
    load();
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return meals.filter((m) =>
      m.name.toLowerCase().includes(q) || m.type.toLowerCase().includes(q) || m.categories.some((c) => c.toLowerCase().includes(q))
    );
  }, [meals, search]);

  const editingMeal = meals.find((m) => m.id === editingId);

  return (
    <div>
      <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
        <h4 className="font-heading text-secondary text-sm">Gestion du Catalogue Repas</h4>
        <button
          onClick={() => { setShowAddForm((v) => !v); setEditingId(null); }}
          className="bg-primary text-white text-xs font-semibold px-3.5 py-2 rounded-md shrink-0"
        >
          {showAddForm ? "Fermer" : "+ Ajouter un Plat"}
        </button>
      </div>

      {error && <p className="bg-danger/10 text-danger text-sm rounded-md p-2 mb-3">{error}</p>}

      {showAddForm && (
        <MealForm onSaved={() => { setShowAddForm(false); load(); }} onCancel={() => setShowAddForm(false)} />
      )}

      {editingMeal && (
        <MealForm
          initial={{
            id: editingMeal.id,
            name: editingMeal.name,
            type: editingMeal.type,
            calories: editingMeal.calories,
            proteins: editingMeal.proteins,
            goal: editingMeal.goal ?? "",
            photoUrl: editingMeal.photoUrl ?? "",
            categories: editingMeal.categories,
            allergenTags: editingMeal.allergenTags,
          }}
          onSaved={() => { setEditingId(null); load(); }}
          onCancel={() => setEditingId(null)}
        />
      )}

      <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un plat, une catégorie..." />

      <div className="mt-3 max-h-[420px] overflow-auto scrollbar-hide touch-pan-x">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="sticky top-0 bg-white">
            <tr className="text-left text-text-muted text-xs">
              <th className="pb-2 pr-4">Nom</th><th className="pb-2 pr-4">Type</th><th className="pb-2 pr-4">Kcal</th>
              <th className="pb-2 pr-4">Protéines</th><th className="pb-2 pr-4">Catégories</th><th className="pb-2 pr-4">Statut</th><th className="pb-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-t border-border">
                <td className="py-2 pr-4">{m.name}</td>
                <td className="py-2 pr-4">{m.type}</td>
                <td className="py-2 pr-4">{m.calories}</td>
                <td className="py-2 pr-4">{m.proteins}g</td>
                <td className="py-2 pr-4">{m.categories.join(", ")}</td>
                <td className="py-2 pr-4">{m.availability === "IN_STOCK" ? "En stock" : "Rupture"}</td>
                <td className="py-2 pr-4">
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingId(m.id); setShowAddForm(false); }} className="text-xs font-semibold px-3 py-1.5 rounded-md border border-secondary text-secondary">
                      Modifier
                    </button>
                    <button onClick={() => toggleStock(m.id)} className="text-xs font-semibold px-3 py-1.5 rounded-md bg-secondary text-white">
                      Basculer
                    </button>
                    <button onClick={() => remove(m.id, m.name)} className="text-xs font-semibold px-3 py-1.5 rounded-md border border-danger text-danger">
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={7} className="text-text-muted py-3">Aucun résultat</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}