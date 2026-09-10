"use client";

import { useEffect, useMemo, useState } from "react";
import { IconDownload } from "@/components/icons";
import SearchInput from "./SearchInput";

interface Sub { id: string; client: string; formule: string; slot: string; gym: string; status: string; }

export default function SubscriptionsTab() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/subscriptions").then((res) => res.json()).then((data) => setSubs(data.subscriptions ?? []));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return subs.filter((s) =>
      s.client.toLowerCase().includes(q) ||
      s.formule.toLowerCase().includes(q) ||
      s.status.toLowerCase().includes(q) ||
      s.gym.toLowerCase().includes(q)
    );
  }, [subs, search]);

  return (
    <div>
      <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
        <h4 className="font-heading text-secondary text-sm">Abonnements Clients</h4>
        <a href="/api/admin/export?type=subscriptions" className="border border-border text-text-dark text-xs font-semibold px-3.5 py-2 rounded-md flex items-center gap-1.5 shrink-0">
          <IconDownload size={14} /> Export CSV
        </a>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un client, une formule, un statut..." />

      <div className="mt-3 max-h-[420px] overflow-auto scrollbar-hide touch-pan-x">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="sticky top-0 bg-white">
            <tr className="text-left text-text-muted text-xs">
              <th className="pb-2 pr-4">ID</th><th className="pb-2 pr-4">Client</th><th className="pb-2 pr-4">Formule</th>
              <th className="pb-2 pr-4">Créneau</th><th className="pb-2 pr-4">Salle</th><th className="pb-2 pr-4">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="py-2 pr-4">#{s.id.slice(0, 6)}</td>
                <td className="py-2 pr-4">{s.client}</td>
                <td className="py-2 pr-4">{s.formule}</td>
                <td className="py-2 pr-4">{s.slot}</td>
                <td className="py-2 pr-4">{s.gym}</td>
                <td className="py-2 pr-4">{s.status}</td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={6} className="text-text-muted py-3">Aucun résultat</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}