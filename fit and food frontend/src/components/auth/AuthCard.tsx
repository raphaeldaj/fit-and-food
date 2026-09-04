"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { loginSchema, registerFormSchema } from "@/lib/validators/auth";
import styles from "./AuthCard.module.css";

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerFormSchema>;

interface Gym {
  id: string;
  name: string;
}

export default function AuthCard({ initialMode = "login" }: { initialMode?: "login" | "signup" }) {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(initialMode === "signup");
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/gyms").then((res) => res.json()).then((data) => setGyms(data.gyms ?? []));
  }, []);

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterData>({ resolver: zodResolver(registerFormSchema) });

  const onLogin = async (data: LoginData) => {
    setLoginError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();

    if (!res.ok) {
      setLoginError(json.error ?? "Erreur de connexion.");
      return;
    }
    if (json.requires2FA) {
      router.push(`/verification-2fa?userId=${json.userId}`);
      return;
    }
    router.push("/mon-espace");
  };

  const onRegister = async (data: RegisterData) => {
    setRegisterError(null);
    const { confirmPassword, ...payload } = data;

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    if (!res.ok) {
      setRegisterError(json.error?._errors?.[0] ?? json.error ?? "Erreur lors de l'inscription.");
      return;
    }
    setIsSignup(false);
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.form} ${isSignup ? styles.flipped : ""}`}>
        <form className={styles.form_front} onSubmit={loginForm.handleSubmit(onLogin)}>
          <div className={styles.form_details}>Connexion</div>

          {loginError && <p className={styles.error}>{loginError}</p>}

          <input type="email" placeholder="Email" className={styles.input} {...loginForm.register("email")} />
          {loginForm.formState.errors.email && <span className={styles.fieldError}>{loginForm.formState.errors.email.message}</span>}

          <input type="password" placeholder="Mot de passe" className={styles.input} {...loginForm.register("password")} />
          {loginForm.formState.errors.password && <span className={styles.fieldError}>{loginForm.formState.errors.password.message}</span>}

          <button type="submit" disabled={loginForm.formState.isSubmitting} className={styles.btn}>
            {loginForm.formState.isSubmitting ? "Connexion..." : "Se connecter"}
          </button>

          <span className={styles.switch}>
            Pas encore de compte ?{" "}
            <button type="button" className={styles.signup_tog} onClick={() => setIsSignup(true)}>
              Inscription
            </button>
          </span>
        </form>

        <form className={styles.form_back} onSubmit={registerForm.handleSubmit(onRegister)}>
          <div className={styles.form_details}>Inscription</div>

          {registerError && <p className={styles.error}>{registerError}</p>}

          <input type="text" placeholder="Nom complet" className={styles.input} {...registerForm.register("fullName")} />
          {registerForm.formState.errors.fullName && <span className={styles.fieldError}>{registerForm.formState.errors.fullName.message}</span>}

          <input type="email" placeholder="Email" className={styles.input} {...registerForm.register("email")} />
          {registerForm.formState.errors.email && <span className={styles.fieldError}>{registerForm.formState.errors.email.message}</span>}

          <input type="text" placeholder="Téléphone (77 XXX XX XX)" className={styles.input} {...registerForm.register("phone")} />
          {registerForm.formState.errors.phone && <span className={styles.fieldError}>{registerForm.formState.errors.phone.message}</span>}

          <select className={styles.input} {...registerForm.register("gymId")}>
            <option value="">Salle partenaire (optionnel)</option>
            {gyms.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          <input type="password" placeholder="Mot de passe" className={styles.input} {...registerForm.register("password")} />
          {registerForm.formState.errors.password && <span className={styles.fieldError}>{registerForm.formState.errors.password.message}</span>}

          <input type="password" placeholder="Confirmer le mot de passe" className={styles.input} {...registerForm.register("confirmPassword")} />
          {registerForm.formState.errors.confirmPassword && <span className={styles.fieldError}>{registerForm.formState.errors.confirmPassword.message}</span>}

          <button type="submit" disabled={registerForm.formState.isSubmitting} className={styles.btn}>
            {registerForm.formState.isSubmitting ? "Création..." : "S'inscrire"}
          </button>

          <span className={styles.switch}>
            Déjà un compte ?{" "}
            <button type="button" className={styles.signup_tog} onClick={() => setIsSignup(false)}>
              Connexion
            </button>
          </span>
        </form>
      </div>
    </div>
  );
}