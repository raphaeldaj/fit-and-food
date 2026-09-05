"use client";

import { useEffect, useMemo, useState } from "react";
import { IconPlay } from "@/components/icons";
import SearchInput from "./SearchInput";

interface AdminOrder { id: string; subscription: string; amount: number; status: string; }

export default function OrdersTab() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [running, setRunning] = useState(false);
  const [search, setSearch] = useState("");

  const load = () => {
    fetch("/api/admin/orders").then((res) => res.json()).then((data) => setOrders(data.orders ?? []));
  };

  useEffect(load, []);

  const runCycle = async () => {
    setRunning(true);
    await fetch("/api/admin/orders/run-cycle", { method: "POST" });
    setRunning(false);
    load();
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter((o) => o.subscription.toLowerCase().includes(q) || o.status.toLowerCase().includes(q));
  }, [orders, search]);

  return (
    <div>
      <div className="flex justify-between items-center flex-wrap gap-2 mb-1">
        <h4 className="font-heading text-secondary text-sm">Commandes générées par cycle</h4>
        <button onClick={runCycle} disabled={running} className="bg-primary text-white text-xs font-semibold px-3.5 py-2 rounded-md flex items-center gap-1.5 disabled:opacity-50 shrink-0">
          <IconPlay size={14} /> {running ? "En cours..." : "Lancer le cycle de reconduction"}
        </button>
      </div>
      <p className="text-xs text-text-muted mb-3">
        Simule le job planifié : génération de commande → tentative de paiement → notification → suspension après échecs répétés.
      </p>

      <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un client, un statut..." />

      <div className="mt-3 max-h-[420px] overflow-auto scrollbar-hide touch-pan-x">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="sticky top-0 bg-white">
            <tr className="text-left text-text-muted text-xs">
              <th className="pb-2 pr-4">Commande</th><th className="pb-2 pr-4">Abonnement</th><th className="pb-2 pr-4">Montant</th><th className="pb-2 pr-4">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="py-2 pr-4">#{o.id.slice(0, 6)}</td>
                <td className="py-2 pr-4">{o.subscription}</td>
                <td className="py-2 pr-4">{o.amount.toLocaleString("fr-FR")} F</td>
                <td className="py-2 pr-4">{o.status}</td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={4} className="text-text-muted py-3">Aucun résultat</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}