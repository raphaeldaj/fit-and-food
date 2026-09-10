"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditDeliveryInfo({ subscriptionId, initialAddress, initialPhone }: { subscriptionId: string; initialAddress: string; initialPhone: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [address, setAddress] = useState(initialAddress);
  const [phone, setPhone] = useState(initialPhone);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setError(null);
    setLoading(true);
    const res = await fetch(`/api/subscriptions/${subscriptionId}/delivery`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, phone }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error ?? "Erreur.");
      return;
    }
    setEditing(false);
    router.refresh();
  };


    if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="border border-border text-text-dark text-xs font-semibold px-3.5 py-2 rounded-md mt-2">
        Modifier adresse / téléphone
      </button>
    );
  }

  return (
    <div className="mt-2 bg-bg-light rounded-md p-3">
      {error && <p className="text-danger text-xs mb-2">{error}</p>}
      <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adresse" className="w-full border border-border rounded p-1.5 text-xs mb-2" />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Téléphone" className="w-full border border-border rounded p-1.5 text-xs mb-2" />
      <div className="flex gap-2">
        <button onClick={save} disabled={loading} className="text-xs bg-primary text-white px-3 py-1 rounded-md">{loading ? "..." : "Enregistrer"}</button>
        <button onClick={() => setEditing(false)} className="text-xs border border-border px-3 py-1 rounded-md">Annuler</button>
      </div>
    </div>
  );
}