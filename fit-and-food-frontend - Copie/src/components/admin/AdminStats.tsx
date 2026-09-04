"use client";

import { useEffect, useState } from "react";

interface Stats { activeSubs: number; revenue: number; renewalRate: number; }

export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((res) => res.json()).then(setStats);
  }, []);

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <StatBox label="Abonnements Actifs" value={stats?.activeSubs ?? 0} borderColor="border-l-primary" />
      <StatBox label="Revenus Estimés (cycle)" value={`${(stats?.revenue ?? 0).toLocaleString("fr-FR")} F`} borderColor="border-l-secondary" />
      <StatBox label="Taux de Reconduction" value={`${stats?.renewalRate ?? 0}%`} borderColor="border-l-success" />
    </div>
  );
}

function StatBox({ label, value, borderColor }: { label: string; value: string | number; borderColor: string }) {
  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${borderColor}`}>
      <small className="text-text-muted text-xs">{label}</small>
      <h2 className="text-2xl font-heading text-secondary mt-1">{value}</h2>
    </div>
  );
}