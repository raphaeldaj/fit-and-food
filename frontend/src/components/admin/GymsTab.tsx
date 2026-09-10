"use client";

import { useEffect, useMemo, useState } from "react";
import GymForm from "./GymForm";
import SearchInput from "./SearchInput";

interface AdminGym { id: string; name: string; address: string; active: boolean; _count: { users: number }; }

export default function GymsTab() {
  const [gyms, setGyms] = useState<AdminGym[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = () => {
    fetch("/api/admin/gyms").then((res) => res.json()).then((data) => setGyms(data.gyms ?? []));
  };

  useEffect(load, []);

  const toggle = async (id: string) => {
    await fetch(`/api/admin/gyms/${id}/toggle`, { method: "POST" });
    load();
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Supprimer définitivement "${name}" ?`)) return;
    setError(null);
    const res = await fetch(`/api/admin/gyms/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Erreur lors de la suppression.");
      return;
    }
    load();
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return gyms.filter((g) => g.name.toLowerCase().includes(q) || g.address.toLowerCase().includes(q));
  }, [gyms, search]);

  const editingGym = gyms.find((g) => g.id === editingId);

  return (
    <div>
      <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
        <h4 className="font-heading text-secondary text-sm">Salles de Sport Partenaires</h4>
        <button
          onClick={() => { setShowAddForm((v) => !v); setEditingId(null); }}
          className="bg-primary text-white text-xs font-semibold px-3.5 py-2 rounded-md shrink-0"
        >
          {showAddForm ? "Fermer" : "+ Ajouter une Salle"}
        </button>
      </div>

      {error && <p className="bg-danger/10 text-danger text-sm rounded-md p-2 mb-3">{error}</p>}

      {showAddForm && (
        <GymForm onSaved={() => { setShowAddForm(false); load(); }} onCancel={() => setShowAddForm(false)} />
      )}

      {editingGym && (
        <GymForm
          initial={{ id: editingGym.id, name: editingGym.name, address: editingGym.address }}
          onSaved={() => { setEditingId(null); load(); }}
          onCancel={() => setEditingId(null)}
        />
      )}

      <SearchInput value={search} onChange={setSearch} placeholder="Rechercher une salle, une adresse..." />

      <div className="mt-3 max-h-[420px] overflow-auto scrollbar-hide touch-pan-x">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="sticky top-0 bg-white">
            <tr className="text-left text-text-muted text-xs">
              <th className="pb-2 pr-4">Nom</th><th className="pb-2 pr-4">Adresse</th><th className="pb-2 pr-4">Clients rattachés</th>
              <th className="pb-2 pr-4">Statut</th><th className="pb-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => (
              <tr key={g.id} className="border-t border-border">
                <td className="py-2 pr-4">{g.name}</td>
                <td className="py-2 pr-4">{g.address}</td>
                <td className="py-2 pr-4">{g._count.users}</td>
                <td className="py-2 pr-4">{g.active ? "Active" : "Inactive"}</td>
                <td className="py-2 pr-4">
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingId(g.id); setShowAddForm(false); }} className="text-xs font-semibold px-3 py-1.5 rounded-md border border-secondary text-secondary">
                      Modifier
                    </button>
                    <button onClick={() => toggle(g.id)} className="text-xs font-semibold px-3 py-1.5 rounded-md bg-secondary text-white">
                      Basculer
                    </button>
                    <button onClick={() => remove(g.id, g.name)} className="text-xs font-semibold px-3 py-1.5 rounded-md border border-danger text-danger">
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={5} className="text-text-muted py-3">Aucun résultat</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}