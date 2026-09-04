"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardActions({ subscriptionId, status }: { subscriptionId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const callAction = async (action: "suspend" | "cancel") => {
    setLoading(true);
    await fetch(`/api/subscriptions/${subscriptionId}/${action}`, { method: "POST" });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex gap-2 flex-wrap mt-4">
      <button disabled={loading} className="border border-border text-text-dark text-xs font-semibold px-3.5 py-2 rounded-md">
        Modifier composition
      </button>
      <button disabled={loading || status !== "ACTIVE"} onClick={() => callAction("suspend")} className="border border-border text-text-dark text-xs font-semibold px-3.5 py-2 rounded-md disabled:opacity-40">
        Suspendre
      </button>
      <button disabled={loading || status === "CANCELLED"} onClick={() => callAction("cancel")} className="border border-border text-danger text-xs font-semibold px-3.5 py-2 rounded-md disabled:opacity-40">
        Annuler
      </button>
    </div>
  );
}