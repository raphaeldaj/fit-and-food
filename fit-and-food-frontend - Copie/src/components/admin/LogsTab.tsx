"use client";

import { useEffect, useState } from "react";

interface Log { id: string; adminName: string; action: string; createdAt: string; }

export default function LogsTab() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    fetch("/api/admin/logs").then((res) => res.json()).then((data) => setLogs(data.logs ?? []));
  }, []);

  return (
    <div>
      <h4 className="font-heading text-secondary text-sm mb-3">Historique des Modifications (Logs / Webhooks)</h4>
      <div className="overflow-x-auto scrollbar-hide touch-pan-x">
        <ul className="text-sm space-y-2 min-w-max">
          {logs.map((log) => (
            <li key={log.id} className="border-t border-border pt-2 whitespace-nowrap">
              <span className="text-text-muted text-xs">{new Date(log.createdAt).toLocaleString("fr-FR")}</span> — <strong>{log.adminName}</strong> : {log.action}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}