"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validators/auth";
import { IconEyeShow, IconEyeHide, IconLock } from "@/components/icons";
import { z } from "zod";

type LoginData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginData) => {
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Erreur de connexion.");
      return;
    }
    if (json.requires2FA) {
      router.push(`/verification-2fa?userId=${json.userId}`);
      return;
    }
    router.push("/mon-espace");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm mx-auto bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <IconLock size={20} className="text-secondary" />
        <h2 className="text-xl font-heading text-secondary">Connexion</h2>
      </div>

      {error && (
        <p className="bg-danger/10 text-danger text-sm rounded-md p-3 mb-4">{error}</p>
      )}

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">Email</label>
        <input
          type="email"
          {...register("email")}
          className="w-full border border-border rounded-md p-2.5 text-sm"
        />
        {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div className="mb-5 relative">
        <label className="block text-sm font-semibold mb-1">Mot de passe</label>
        <input
          type={showPassword ? "text" : "password"}
          {...register("password")}
          className="w-full border border-border rounded-md p-2.5 text-sm pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-9 text-text-muted"
          aria-label="Afficher le mot de passe"
        >
          {showPassword ? <IconEyeHide size={18} /> : <IconEyeShow size={18} />}
        </button>
        {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-md transition"
      >
        {isSubmitting ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}