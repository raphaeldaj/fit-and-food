"use client";

import { useState } from "react";

export interface GymFormData { id?: string; name: string; address: string; }

export default function GymForm({ initial, onSaved, onCancel }: { initial?: GymFormData; onSaved: () => void; onCancel: () => void }) {
  const isEdit = !!initial?.id;
  const [name, setName] = useState(initial?.name ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    if (!name || !address) {
      setError("Nom et adresse obligatoires.");
      return;
    }
    setLoading(true);
    const url = isEdit ? `/api/admin/gyms/${initial!.id}` : "/api/admin/gyms";
    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, address }),
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
      <h5 className="font-heading text-secondary text-sm mb-3">{isEdit ? "Modifier la salle" : "Nouvelle salle partenaire"}</h5>
      {error && <p className="bg-danger/10 text-danger text-sm rounded-md p-2 mb-3">{error}</p>}

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Nom</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-border rounded-md p-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Adresse</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border border-border rounded-md p-2 text-sm" />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={submit} disabled={loading} className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-md disabled:opacity-50">
          {loading ? "Enregistrement..." : isEdit ? "Enregistrer" : "Ajouter la salle"}
        </button>
        <button onClick={onCancel} className="border border-border text-text-dark text-xs font-semibold px-4 py-2 rounded-md">
          Annuler
        </button>
      </div>
    </div>
  );
}