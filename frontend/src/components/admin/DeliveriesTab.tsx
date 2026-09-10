"use client";

import { useEffect, useMemo, useState } from "react";
import SearchInput from "./SearchInput";

interface AdminDelivery { id: string; slot: string; date: string; client: string; status: string; }

export default function DeliveriesTab() {
  const [deliveries, setDeliveries] = useState<AdminDelivery[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/deliveries").then((res) => res.json()).then((data) => setDeliveries(data.deliveries ?? []));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return deliveries.filter((d) =>
      d.client.toLowerCase().includes(q) || d.slot.toLowerCase().includes(q) || d.status.toLowerCase().includes(q)
    );
  }, [deliveries, search]);

  return (
    <div>
      <h4 className="font-heading text-secondary text-sm mb-3">Livraisons par créneau</h4>

      <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un client, un créneau..." />

      <div className="mt-3 max-h-[420px] overflow-auto scrollbar-hide touch-pan-x">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="sticky top-0 bg-white">
            <tr className="text-left text-text-muted text-xs">
              <th className="pb-2 pr-4">Créneau</th><th className="pb-2 pr-4">Date</th><th className="pb-2 pr-4">Client</th><th className="pb-2 pr-4">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-t border-border">
                <td className="py-2 pr-4">{d.slot}</td>
                <td className="py-2 pr-4">{new Date(d.date).toLocaleDateString("fr-FR")}</td>
                <td className="py-2 pr-4">{d.client}</td>
                <td className="py-2 pr-4">{d.status}</td>
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