"use client";

import { useEffect, useMemo, useState } from "react";
import SearchInput from "./SearchInput";
import { IconStar } from "@/components/icons";

interface RankedMeal {
  id: string;
  name: string;
  type: string;
  reviewCount: number;
  average: number;
}

export default function ReviewsTab() {
  const [ranked, setRanked] = useState<RankedMeal[]>([]);
  const [unreviewedCount, setUnreviewedCount] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/reviews").then((res) => res.json()).then((data) => {
      setRanked(data.ranked ?? []);
      setUnreviewedCount(data.unreviewedCount ?? 0);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ranked.filter((m) => m.name.toLowerCase().includes(q));
  }, [ranked, search]);

  return (
    <div>
      <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
        <h4 className="font-heading text-secondary text-sm">Classement des Repas par Avis Clients</h4>
        {unreviewedCount > 0 && (
          <span className="text-xs text-text-muted">{unreviewedCount} plat(s) sans avis pour l&apos;instant</span>
        )}
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un plat..." />

      <div className="mt-3 max-h-[420px] overflow-auto scrollbar-hide touch-pan-x">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="sticky top-0 bg-white">
            <tr className="text-left text-text-muted text-xs">
              <th className="pb-2 pr-4">Rang</th>
              <th className="pb-2 pr-4">Plat</th>
              <th className="pb-2 pr-4">Type</th>
              <th className="pb-2 pr-4">Note Moyenne</th>
              <th className="pb-2 pr-4">Nombre d&apos;Avis</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, index) => (
              <tr key={m.id} className="border-t border-border">
                <td className="py-2 pr-4 font-semibold text-secondary">#{index + 1}</td>
                <td className="py-2 pr-4">{m.name}</td>
                <td className="py-2 pr-4">{m.type}</td>
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{m.average.toFixed(1)}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <IconStar
                          key={i}
                          size={13}
                          className={i < Math.round(m.average) ? "fill-primary text-primary" : "text-border"}
                        />
                      ))}
                    </div>
                  </div>
                </td>
                <td className="py-2 pr-4">{m.reviewCount}</td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={5} className="text-text-muted py-3">Aucun plat noté pour l&apos;instant</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}