export interface PasswordStrength {
  score: number; // 0 à 5
  label: string;
  color: string;
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: "", color: "transparent" };

  let score = 0;
  if (password.length >= 10) score++;
  if (password.length >= 14) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Très faible", color: "#e53e3e" };
  if (score === 2) return { score, label: "Faible", color: "#dd6b20" };
  if (score === 3) return { score, label: "Moyen", color: "#d69e2e" };
  if (score === 4) return { score, label: "Fort", color: "#38a169" };
  return { score, label: "Très fort", color: "#2f855a" };
}