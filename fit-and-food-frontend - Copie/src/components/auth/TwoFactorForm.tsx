"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { twoFactorSchema } from "@/lib/validators/auth";
import { IconShield } from "@/components/icons";
import { z } from "zod";

type TwoFactorData = z.infer<typeof twoFactorSchema>;

export default function TwoFactorForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TwoFactorData>({ resolver: zodResolver(twoFactorSchema) });

  const onSubmit = async (data: TwoFactorData) => {
    setError(null);
    const res = await fetch("/api/auth/2fa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, token: data.token }),
    });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Code invalide.");
      return;
    }
    router.push("/mon-espace");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm mx-auto bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <IconShield size={20} className="text-secondary" />
        <h2 className="text-xl font-heading text-secondary">Vérification en deux étapes</h2>
      </div>

      <p className="text-sm text-text-muted mb-4">
        Entre le code à 6 chiffres généré par ton application d'authentification.
      </p>

      {error && (
        <p className="bg-danger/10 text-danger text-sm rounded-md p-3 mb-4">{error}</p>
      )}

      <div className="mb-5">
        <input
          {...register("token")}
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          className="w-full border border-border rounded-md p-3 text-center text-xl tracking-[0.5em] font-heading"
        />
        {errors.token && <p className="text-danger text-xs mt-1">{errors.token.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-md transition"
      >
        {isSubmitting ? "Vérification..." : "Valider"}
      </button>
    </form>
  );
}