"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerFormSchema } from "@/lib/validators/auth";
import { IconEyeShow, IconEyeHide, IconShield } from "@/components/icons";
import { z } from "zod";

type RegisterData = z.infer<typeof registerFormSchema>;

interface Gym {
  id: string;
  name: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gyms, setGyms] = useState<Gym[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({ resolver: zodResolver(registerFormSchema) });

  useEffect(() => {
    fetch("/api/gyms")
      .then((res) => res.json())
      .then((data) => setGyms(data.gyms ?? []))
      .catch(() => setGyms([]));
  }, []);

  const onSubmit = async (data: RegisterData) => {
    setError(null);
    const { confirmPassword, ...payload } = data;

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error?._errors?.[0] ?? json.error ?? "Erreur lors de l'inscription.");
      return;
    }

    router.push("/connexion?inscription=reussie");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <IconShield size={20} className="text-secondary" />
        <h2 className="text-xl font-heading text-secondary">Créer un compte</h2>
      </div>

      {error && (
        <p className="bg-danger/10 text-danger text-sm rounded-md p-3 mb-4">{error}</p>
      )}

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">Nom complet</label>
        <input {...register("fullName")} className="w-full border border-border rounded-md p-2.5 text-sm" />
        {errors.fullName && <p className="text-danger text-xs mt-1">{errors.fullName.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">Email</label>
        <input type="email" {...register("email")} className="w-full border border-border rounded-md p-2.5 text-sm" />
        {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">Téléphone (Wave / Orange Money)</label>
        <input {...register("phone")} placeholder="77 123 45 67" className="w-full border border-border rounded-md p-2.5 text-sm" />
        {errors.phone && <p className="text-danger text-xs mt-1">{errors.phone.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">Salle de sport partenaire</label>
        <select {...register("gymId")} className="w-full border border-border rounded-md p-2.5 text-sm">
          <option value="">Aucune / à préciser plus tard</option>
          {gyms.map((gym) => (
            <option key={gym.id} value={gym.id}>{gym.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-4 relative">
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
        <p className="text-xs text-text-muted mt-1">10 caractères min., avec majuscule, chiffre et caractère spécial.</p>
      </div>

      <div className="mb-5">
        <label className="block text-sm font-semibold mb-1">Confirmer le mot de passe</label>
        <input
          type={showPassword ? "text" : "password"}
          {...register("confirmPassword")}
          className="w-full border border-border rounded-md p-2.5 text-sm"
        />
        {errors.confirmPassword && <p className="text-danger text-xs mt-1">{errors.confirmPassword.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-md transition"
      >
        {isSubmitting ? "Création..." : "Créer mon compte"}
      </button>

      <p className="text-xs text-text-muted mt-4 text-center">
        Tu pourras activer la double authentification (2FA) juste après, dans ton espace client.
      </p>
    </form>
  );
}