"use client";

import { useEffect, useState } from "react";

interface AdminDelivery { id: string; slot: string; date: string; client: string; status: string; }

export default function DeliveriesTab() {
  const [deliveries, setDeliveries] = useState<AdminDelivery[]>([]);

  useEffect(() => {
    fetch("/api/admin/deliveries").then((res) => res.json()).then((data) => setDeliveries(data.deliveries ?? []));
  }, []);

  return (
    <div>
      <h4 className="font-heading text-secondary text-sm mb-3">Livraisons par créneau</h4>
      <div className="overflow-x-auto scrollbar-hide touch-pan-x">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="text-left text-text-muted text-xs">
              <th className="pb-2 pr-4">Créneau</th><th className="pb-2 pr-4">Date</th><th className="pb-2 pr-4">Client</th><th className="pb-2 pr-4">Statut</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((d) => (
              <tr key={d.id} className="border-t border-border">
                <td className="py-2 pr-4">{d.slot}</td>
                <td className="py-2 pr-4">{new Date(d.date).toLocaleDateString("fr-FR")}</td>
                <td className="py-2 pr-4">{d.client}</td>
                <td className="py-2 pr-4">{d.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}