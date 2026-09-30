"use client";

import { useState } from "react";
import { IconShield, IconSuccess } from "@/components/icons";

export default function TwoFactorSetup({ initiallyEnabled }: { initiallyEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initiallyEnabled);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const startSetup = async () => {
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) { setError(json.error ?? "Erreur."); return; }
    setQrCode(json.qrCodeDataUrl);
  };

  const confirmSetup = async () => {
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/2fa/enable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: code }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) { setError(json.error ?? "Code incorrect."); return; }
    setEnabled(true);
    setQrCode(null);
  };

  const disable = async () => {
    setLoading(true);
    await fetch("/api/auth/2fa/disable", { method: "POST" });
    setLoading(false);
    setEnabled(false);
  };

  if (enabled) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm max-w-md">
        <div className="flex items-center gap-2 mb-3">
          <IconSuccess size={20} className="text-success" />
          <h3 className="font-heading text-secondary">Double authentification activée</h3>
        </div>
        <p className="text-sm text-text-muted mb-4">
          Un code de ton application d'authentification est requis à chaque connexion.
        </p>
        <button
          onClick={disable}
          disabled={loading}
          className="text-danger text-sm font-semibold hover:underline"
        >
          Désactiver la 2FA
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm max-w-md">
      <div className="flex items-center gap-2 mb-3">
        <IconShield size={20} className="text-secondary" />
        <h3 className="font-heading text-secondary">Double authentification</h3>
      </div>

      {error && <p className="bg-danger/10 text-danger text-sm rounded-md p-2 mb-3">{error}</p>}

      {!qrCode ? (
        <>
          <p className="text-sm text-text-muted mb-4">
            Ajoute une couche de sécurité supplémentaire avec une app comme Google Authenticator.
          </p>
          <button
            onClick={startSetup}
            disabled={loading}
            className="bg-primary hover:bg-primary-hover text-white font-semibold px-5 py-2.5 rounded-md text-sm"
          >
            {loading ? "Génération..." : "Activer la 2FA"}
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-text-muted mb-3">
            Scanne ce QR code avec ton application d'authentification, puis entre le code généré.
          </p>

          <div className="bg-bg-light rounded-md p-3 mb-4">
            <p className="text-xs font-semibold text-text-dark mb-1.5">Exemples d'applications compatibles :</p>
            <ul className="text-xs text-text-muted grid grid-cols-2 gap-x-3 gap-y-1">
              <li>• Google Authenticator</li>
              <li>• Microsoft Authenticator</li>
              <li>• Authy</li>
              <li>• Duo Mobile</li>
              <li>• 2FAS Authenticator</li>
            </ul>
          </div>

          <div className="flex justify-center mb-4">
            <img src={qrCode} alt="QR code 2FA" width={180} height={180} />
          </div>

          <p className="text-xs text-text-muted mb-4">
            Une fois le QR code scanné, ouvre l'application choisie : elle affiche un code à 6 chiffres qui se
            renouvelle automatiquement toutes les 30 secondes. Saisis ce code ci-dessous pour confirmer l'activation.
          </p>

          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            className="w-full border border-border rounded-md p-3 text-center text-xl tracking-[0.5em] font-heading mb-4"
          />
          <button
            onClick={confirmSetup}
            disabled={loading || code.length !== 6}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-md text-sm disabled:opacity-50"
          >
            {loading ? "Vérification..." : "Confirmer et activer"}
          </button>
        </>
      )}
    </div>
  );
}