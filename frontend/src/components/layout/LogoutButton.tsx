"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/connexion");
    router.refresh();
  };

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="text-white text-sm font-medium hover:text-primary disabled:opacity-50"
    >
      {loading ? "..." : "Déconnexion"}
    </button>
  );
}