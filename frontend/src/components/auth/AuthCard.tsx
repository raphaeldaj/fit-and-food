"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { loginSchema, registerFormSchema } from "@/lib/validators/auth";
import { IconEyeShow, IconEyeHide } from "@/components/icons";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
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
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/gyms").then((res) => res.json()).then((data) => setGyms(data.gyms ?? []));
  }, []);

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterData>({ resolver: zodResolver(registerFormSchema) });
  const watchedPassword = registerForm.watch("password") ?? "";

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
    router.push(json.role === "ADMIN" ? "/admin" : "/mon-espace");
    router.refresh();
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
    <div className={styles.loginWrapper}>
      {/* <div className={styles.loginCard}> */}
            <div className={`${styles.loginCard} ${isSignup ? styles.signupMode : ""}`}>
        <div className={`${styles.glowBlob} ${styles.blob1}`} />
        <div className={`${styles.glowBlob} ${styles.blob2}`} />
        <div className={styles.darkOverlay} />

        <div className={styles.viewContainer}>
          {!isSignup ? (
            <div className={styles.formView}>
              <div className={styles.header}>
                
                <div className={styles.title}>Content de te revoir</div>
                <p className={styles.subtitle}>Connecte-toi pour gérer ton abonnement.</p>
              </div>

              {loginError && <div className={styles.formError}>{loginError}</div>}

              <form onSubmit={loginForm.handleSubmit(onLogin)}>
                <div className={styles.inputGroup}>
                  <input
                    type="email"
                    placeholder="Adresse email"
                    autoComplete="email"
                    className={styles.inputField}
                    {...loginForm.register("email")}
                  />
                  {loginForm.formState.errors.email && (
                    <span className={styles.fieldError}>{loginForm.formState.errors.email.message}</span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Mot de passe"
                    autoComplete="current-password"
                    className={styles.inputField}
                    style={{ paddingRight: 42 }}
                    {...loginForm.register("password")}
                  />
                  <button
                    type="button"
                    className={styles.eyeToggle}
                    onClick={() => setShowLoginPassword((v) => !v)}
                    aria-label="Afficher le mot de passe"
                  >
                    {showLoginPassword ? <IconEyeHide size={16} /> : <IconEyeShow size={16} />}
                  </button>
                  {loginForm.formState.errors.password && (
                    <span className={styles.fieldError}>{loginForm.formState.errors.password.message}</span>
                  )}
                </div>

                <button type="submit" className={styles.btnSubmit} disabled={loginForm.formState.isSubmitting}>
                  {loginForm.formState.isSubmitting ? "Connexion..." : "Se connecter"}
                </button>
              </form>

              <div className={styles.signupPrompt}>
                Pas encore de compte ?
                <button type="button" className={styles.toggleLink} onClick={() => setIsSignup(true)}>
                  Inscription
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.formView}>
              <div className={styles.header}>
                
                <div className={styles.title}>Créer un compte</div>
                <p className={styles.subtitle}>Rejoins Fit &amp; Food en quelques secondes.</p>
              </div>

              {registerError && <div className={styles.formError}>{registerError}</div>}

              <form onSubmit={registerForm.handleSubmit(onRegister)}>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    placeholder="Nom complet"
                    autoComplete="name"
                    className={styles.inputField}
                    {...registerForm.register("fullName")}
                  />
                  {registerForm.formState.errors.fullName && (
                    <span className={styles.fieldError}>{registerForm.formState.errors.fullName.message}</span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <input
                    type="email"
                    placeholder="Adresse email"
                    autoComplete="email"
                    className={styles.inputField}
                    {...registerForm.register("email")}
                  />
                  {registerForm.formState.errors.email && (
                    <span className={styles.fieldError}>{registerForm.formState.errors.email.message}</span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    placeholder="Téléphone (77 XXX XX XX)"
                    autoComplete="tel"
                    className={styles.inputField}
                    {...registerForm.register("phone")}
                  />
                  {registerForm.formState.errors.phone && (
                    <span className={styles.fieldError}>{registerForm.formState.errors.phone.message}</span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <select className={styles.inputField} defaultValue="" {...registerForm.register("gymId")}>
                    <option value="">Salle partenaire (optionnel)</option>
                    {gyms.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="Mot de passe"
                    autoComplete="new-password"
                    className={styles.inputField}
                    style={{ paddingRight: 42 }}
                    {...registerForm.register("password")}
                  />
                  <button
                    type="button"
                    className={styles.eyeToggle}
                    onClick={() => setShowSignupPassword((v) => !v)}
                    aria-label="Afficher le mot de passe"
                  >
                    {showSignupPassword ? <IconEyeHide size={16} /> : <IconEyeShow size={16} />}
                  </button>
                  <PasswordStrengthMeter password={watchedPassword} />
                  {registerForm.formState.errors.password && (
                    <span className={styles.fieldError}>{registerForm.formState.errors.password.message}</span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="Confirmer le mot de passe"
                    autoComplete="new-password"
                    className={styles.inputField}
                    {...registerForm.register("confirmPassword")}
                  />
                  {registerForm.formState.errors.confirmPassword && (
                    <span className={styles.fieldError}>{registerForm.formState.errors.confirmPassword.message}</span>
                  )}
                </div>

                <button type="submit" className={styles.btnSubmit} disabled={registerForm.formState.isSubmitting}>
                  {registerForm.formState.isSubmitting ? "Création..." : "S'inscrire"}
                </button>
              </form>

              <div className={styles.signupPrompt}>
                Déjà un compte ?
                <button type="button" className={styles.toggleLink} onClick={() => setIsSignup(false)}>
                  Connexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}