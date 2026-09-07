"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileForm({ initialFullName, initialPhone }: { initialFullName: string; initialPhone: string }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setError(null);
    setSuccess(false);
    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, phone }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error ?? "Erreur.");
      return;
    }
    setSuccess(true);
    router.refresh();
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm max-w-md mb-6">
      <h3 className="font-heading text-secondary mb-4">Informations personnelles</h3>

      {error && <p className="bg-danger/10 text-danger text-sm rounded-md p-2 mb-3">{error}</p>}
      {success && <p className="bg-success/10 text-success text-sm rounded-md p-2 mb-3">Profil mis à jour.</p>}

      <div className="mb-3">
        <label className="block text-xs font-semibold mb-1">Nom complet</label>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border border-border rounded-md p-2 text-sm" />
      </div>
      <div className="mb-4">
        <label className="block text-xs font-semibold mb-1">Téléphone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-border rounded-md p-2 text-sm" />
      </div>

      <button onClick={save} disabled={loading} className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-md disabled:opacity-50">
        {loading ? "Enregistrement..." : "Enregistrer"}
      </button>
    </div>
  );
}