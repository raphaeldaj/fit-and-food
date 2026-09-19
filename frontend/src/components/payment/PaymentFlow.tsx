"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { IconWarning, IconSuccess } from "@/components/icons";

type Phase = "idle" | "initiating" | "otp" | "waiting" | "success" | "failed";

export default function PaymentFlow({
  orderId,
  method,
  amount,
}: {
  orderId: string;
  method: "WAVE" | "ORANGE_MONEY";
  amount: number;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [token, setToken] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);

  const callInitiate = useCallback(async (otpCode?: string) => {
    setError(null);
    setPhase("initiating");

    const res = await fetch("/api/payments/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, otpCode }),
    });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Erreur lors du paiement.");
      setPhase("failed");
      return;
    }

    setToken(json.token);

    switch (json.nextAction) {
      case "REDIRECT_TO_PROVIDER_LINK":
        if (json.redirectUrl) {
          window.location.href = json.redirectUrl;
        } else {
          setError("Lien de paiement Wave indisponible.");
          setPhase("failed");
        }
        break;
      case "OTP_REQUIRED":
        setPhase("otp");
        break;
      case "USSD_PUSH":
        setPhase("waiting");
        break;
      case "NONE":
      default:
        if (json.status === "Completed") setPhase("success");
        else {
          setError(json.failedReason ?? json.message ?? "Paiement refusé.");
          setPhase("failed");
        }
    }
  }, [orderId]);

  // Polling du statut pendant l'attente USSD
  useEffect(() => {
    if (phase !== "waiting" || !token) return;

    const started = Date.now();
    const interval = setInterval(async () => {
      if (Date.now() - started > 90_000) {
        clearInterval(interval);
        setError("Délai dépassé. Vérifie ton téléphone ou réessaie.");
        setPhase("failed");
        return;
      }

      const res = await fetch(`/api/payments/${token}/status`);
      const json = await res.json();

      if (json.status === "Completed") {
        clearInterval(interval);
        setPhase("success");
        setTimeout(() => router.push("/mon-espace"), 1500);
      } else if (json.status === "Failed" || json.status === "Cancelled") {
        clearInterval(interval);
        setError("Paiement refusé par l'opérateur.");
        setPhase("failed");
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [phase, token, router]);

  const label = method === "WAVE" ? "Wave" : "Orange Money";

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm max-w-md mx-auto">
      <h3 className="font-heading text-secondary mb-1">Paiement {label}</h3>
      <p className="text-text-muted text-sm mb-5">
        Montant : <strong className="text-primary">{amount.toLocaleString("fr-FR")} FCFA</strong>
      </p>

      {error && (
        <p className="bg-danger/10 text-danger text-sm rounded-md p-3 mb-4 flex items-start gap-2">
          <IconWarning size={16} className="mt-0.5 shrink-0" /> {error}
        </p>
      )}

      {phase === "idle" && (
        <div className="space-y-2">
          <button
            onClick={() => callInitiate()}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-md"
          >
            Payer avec {label}
          </button>
          <button
            onClick={async () => {
              setError(null);
              setPhase("initiating");
              const res = await fetch("/api/payments/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId }),
              });
              const json = await res.json();
              if (!res.ok) {
                setError(json.error ?? "Erreur lors de la création de la session.");
                setPhase("failed");
                return;
              }
              window.location.href = json.checkoutUrl;
            }}
            className="w-full border border-border text-text-dark font-semibold py-2.5 rounded-md"
          >
            Payer via la page sécurisée SenePay
          </button>
        </div>
      )}

      

      {phase === "initiating" && <p className="text-sm text-text-muted">Initialisation du paiement...</p>}

      {phase === "otp" && (
        <div>
          <p className="text-sm mb-3">
            Compose <strong>#144#391#</strong> sur ton téléphone Orange pour recevoir un code OTP par SMS,
            puis saisis-le ci-dessous.
          </p>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputMode="numeric"
            placeholder="Code OTP"
            className="w-full border border-border rounded-md p-3 text-center tracking-widest mb-3"
          />
          <button
            onClick={() => callInitiate(otp)}
            disabled={otp.length < 4}
            className="w-full bg-primary hover:bg-primary-hover disabled:opacity-40 text-white font-semibold py-2.5 rounded-md"
          >
            Valider le paiement
          </button>
        </div>
      )}

      {phase === "waiting" && (
        <div className="text-center py-4">
          <p className="text-sm font-semibold mb-1">Confirme la transaction sur ton téléphone</p>
          <p className="text-xs text-text-muted">En attente de la confirmation de l&apos;opérateur...</p>
        </div>
      )}

      {phase === "success" && (
        <p className="bg-success/10 text-success text-sm rounded-md p-3 flex items-center gap-2">
          <IconSuccess size={16} /> Paiement confirmé — ton abonnement est actif.
        </p>
      )}

      {phase === "failed" && (
        <button
          onClick={() => { setPhase("idle"); setError(null); }}
          className="w-full border border-border text-text-dark font-semibold py-2.5 rounded-md"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}