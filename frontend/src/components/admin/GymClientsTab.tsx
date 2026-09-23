"use client";

import { useEffect, useState } from "react";

interface Client { id: string; name: string; formule: string; slot: string; }
interface GymGroup { gymId: string; gymName: string; weeklyFee: number; clients: Client[]; }

export default function GymClientsTab() {
  const [groups, setGroups] = useState<GymGroup[]>([]);

  useEffect(() => {
    fetch("/api/admin/clients-by-gym").then((res) => res.json()).then((data) => setGroups(data.groups ?? []));
  }, []);

  return (
    <div>
      <h4 className="font-heading text-secondary text-sm mb-3">Clients Actifs par Salle Partenaire</h4>

      <div className="space-y-4 max-h-[500px] overflow-auto scrollbar-hide touch-pan-x">
        {groups.map((group) => (
          <div key={group.gymId} className="border border-border rounded-lg p-4 min-w-0">
            <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
              <h5 className="font-heading text-secondary text-sm">{group.gymName}</h5>
              {/* <span className="text-xs bg-bg-light px-2.5 py-1 rounded-full">
                {group.clients.length} client{group.clients.length > 1 ? "s" : ""} · {group.weeklyFee.toLocaleString("fr-FR")} F/sem.
              </span> */}
              <span className="text-xs bg-bg-light px-2.5 py-1 rounded-full">
                {group.clients.length} client{group.clients.length > 1 ? "s" : ""}
              </span>
            </div>

            {group.clients.length ? (
              <table className="w-full text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-left text-text-muted text-xs">
                    <th className="pb-1 pr-4">Client</th><th className="pb-1 pr-4">Formule</th><th className="pb-1 pr-4">Créneau</th>
                  </tr>
                </thead>
                <tbody>
                  {group.clients.map((c) => (
                    <tr key={c.id} className="border-t border-border">
                      <td className="py-1.5 pr-4">{c.name}</td>
                      <td className="py-1.5 pr-4">{c.formule}</td>
                      <td className="py-1.5 pr-4">{c.slot}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-text-muted text-xs">Aucun client actif sur cette salle pour l&apos;instant.</p>
            )}
          </div>
        ))}
        {!groups.length && <p className="text-text-muted text-sm">Aucune donnée.</p>}
      </div>
    </div>
  );
}