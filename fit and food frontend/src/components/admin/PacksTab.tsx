"use client";

import { useEffect, useMemo, useState } from "react";
import type { Pack } from "@/types";
import SearchInput from "./SearchInput";

export default function PacksTab() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [editingPrice, setEditingPrice] = useState<Record<string, string>>({});
  const [editingPromo, setEditingPromo] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");

  const load = () => {
    fetch("/api/packs").then((res) => res.json()).then((data) => setPacks(data.packs ?? []));
  };

  useEffect(load, []);

  const resolvePercent = (pack: Pack): number => {
    const raw = editingPromo[pack.id];
    const value = raw !== undefined && raw !== "" ? Number(raw) : pack.promoPercent;
    return Number.isNaN(value) ? 0 : value;
  };

  const savePrice = async (id: string) => {
    const price = Number(editingPrice[id]);
    if (!price) return;
    await fetch(`/api/admin/packs/${id}/price`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price }),
    });
    load();
  };

  const togglePromo = async (pack: Pack) => {
    await fetch(`/api/admin/packs/${pack.id}/promo`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promoPercent: resolvePercent(pack), promoActive: !pack.promoActive }),
    });
    load();
  };

  const savePromoPercent = async (pack: Pack) => {
    await fetch(`/api/admin/packs/${pack.id}/promo`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promoPercent: resolvePercent(pack), promoActive: pack.promoActive }),
    });
    load();
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return packs.filter((p) => p.goal.toLowerCase().includes(q) || p.formule.toLowerCase().includes(q));
  }, [packs, search]);

  return (
    <div>
      <h4 className="font-heading text-secondary text-sm mb-3">Tarifs &amp; Promotions</h4>

      <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un objectif, une formule..." />

      <div className="mt-3 max-h-[420px] overflow-auto scrollbar-hide touch-pan-x">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="sticky top-0 bg-white">
            <tr className="text-left text-text-muted text-xs">
              <th className="pb-2 pr-4">Objectif</th><th className="pb-2 pr-4">Formule</th><th className="pb-2 pr-4">Prix</th>
              <th className="pb-2 pr-4">Promo (%)</th><th className="pb-2 pr-4">Prix final</th><th className="pb-2 pr-4">Statut</th><th className="pb-2 pr-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="py-2 pr-4">{p.goal}</td>
                <td className="py-2 pr-4">{p.formule}</td>
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      defaultValue={p.price}
                      onChange={(e) => setEditingPrice((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      className="w-20 border border-border rounded p-1.5 text-sm"
                    />
                    <button onClick={() => savePrice(p.id)} className="text-xs text-secondary underline">OK</button>
                  </div>
                </td>
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={90}
                      defaultValue={p.promoPercent}
                      onChange={(e) => setEditingPromo((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      className="w-16 border border-border rounded p-1.5 text-sm"
                    />
                    <button onClick={() => savePromoPercent(p)} className="text-xs text-secondary underline">OK</button>
                  </div>
                </td>
                <td className="py-2 pr-4 font-semibold">
                  {p.promoActive && p.promoPercent > 0 ? (
                    <span className="text-primary">{p.effectivePrice.toLocaleString("fr-FR")} F</span>
                  ) : (
                    <span className="text-text-muted">{p.price.toLocaleString("fr-FR")} F</span>
                  )}
                </td>
                <td className="py-2 pr-4">{p.promoActive ? "Active" : "Inactive"}</td>
                <td className="py-2 pr-4">
                  <button
                    onClick={() => togglePromo(p)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-md ${p.promoActive ? "border border-danger text-danger" : "bg-primary text-white"}`}
                  >
                    {p.promoActive ? "Désactiver" : "Activer"}
                  </button>
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