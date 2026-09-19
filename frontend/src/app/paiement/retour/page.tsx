"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { IconSuccess, IconWarning } from "@/components/icons";

function RetourContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const [status, setStatus] = useState<"checking" | "paid" | "pending" | "failed">("checking");

  useEffect(() => {
    if (!orderId) {
      setStatus("pending");
      return;
    }

    let attempts = 0;
    const maxAttempts = 15; // ~45s de vérification (3s d'intervalle)

    const check = async () => {
      attempts++;
      try {
        const res = await fetch(`/api/orders/${orderId}/status`);
        const json = await res.json();

        if (json.status === "PAID") {
          setStatus("paid");
          return;
        }
        if (json.status === "FAILED") {
          setStatus("failed");
          return;
        }
      } catch {
        // on continue à réessayer
      }

      if (attempts < maxAttempts) {
        setTimeout(check, 3000);
      } else {
        setStatus("pending");
      }
    };

    check();
  }, [orderId]);

  if (status === "checking") {
    return (
      <>
        <h1 className="text-2xl font-heading text-secondary mb-3">Vérification du paiement...</h1>
        <p className="text-text-muted text-sm mb-6">
          Nous confirmons ta transaction auprès de l&apos;opérateur, un instant.
        </p>
      </>
    );
  }

  if (status === "paid") {
    return (
      <>
        <IconSuccess size={48} className="text-success mx-auto mb-4" />
        <h1 className="text-2xl font-heading text-secondary mb-3">Paiement confirmé</h1>
        <p className="text-text-muted text-sm mb-6">Ton abonnement est maintenant actif.</p>
      </>
    );
  }

  if (status === "failed") {
    return (
      <>
        <IconWarning size={48} className="text-danger mx-auto mb-4" />
        <h1 className="text-2xl font-heading text-secondary mb-3">Paiement refusé</h1>
        <p className="text-text-muted text-sm mb-6">Le paiement n&apos;a pas abouti. Réessaie depuis ton espace.</p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-heading text-secondary mb-3">Confirmation en cours</h1>
      <p className="text-text-muted text-sm mb-6">
        La confirmation prend un peu plus de temps que prévu — vérifie le statut dans quelques instants
        depuis ton espace client.
      </p>
    </>
  );
}

export default function RetourPaiementPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 text-center min-w-0 w-full">
      <Suspense fallback={<p className="text-text-muted">Chargement...</p>}>
        <RetourContent />
      </Suspense>
      <Link href="/mon-espace" className="bg-primary text-white font-semibold px-6 py-2.5 rounded-md inline-block">
        Voir mon espace
      </Link>
    </div>
  );
}