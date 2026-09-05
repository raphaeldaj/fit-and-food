"use client";

import { useEffect, useMemo, useState } from "react";
import SearchInput from "./SearchInput";

interface Log { id: string; adminName: string; action: string; createdAt: string; }

export default function LogsTab() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/logs").then((res) => res.json()).then((data) => setLogs(data.logs ?? []));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return logs.filter((l) => l.adminName.toLowerCase().includes(q) || l.action.toLowerCase().includes(q));
  }, [logs, search]);

  return (
    <div>
      <h4 className="font-heading text-secondary text-sm mb-3">Historique des Modifications (Logs / Webhooks)</h4>

      <SearchInput value={search} onChange={setSearch} placeholder="Rechercher une action, un admin..." />

      <div className="mt-3 max-h-[420px] overflow-auto scrollbar-hide touch-pan-x">
        <ul className="text-sm space-y-2 min-w-max">
          {filtered.map((log) => (
            <li key={log.id} className="border-t border-border pt-2 whitespace-nowrap">
              <span className="text-text-muted text-xs">{new Date(log.createdAt).toLocaleString("fr-FR")}</span> — <strong>{log.adminName}</strong> : {log.action}
            </li>
          ))}
          {!filtered.length && <li className="text-text-muted py-3">Aucun résultat</li>}
        </ul>
      </div>
    </div>
  );
}