"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TwoFactorForm from "@/components/auth/TwoFactorForm";

function TwoFactorContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") ?? "";

  if (!userId) {
    return <p className="text-center text-text-muted">Session invalide, reconnecte-toi.</p>;
  }

  return <TwoFactorForm userId={userId} />;
}

export default function Verification2FAPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<p className="text-center">Chargement...</p>}>
        <TwoFactorContent />
      </Suspense>
    </div>
  );
}