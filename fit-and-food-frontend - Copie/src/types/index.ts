export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gymId: string | null;
  twoFactorEnabled: boolean;
  role: "CLIENT" | "ADMIN";
}

export interface Pack {
  id: string;
  goal: "PRISE_DE_MASSE" | "PERTE_DE_POIDS";
  formule: "DECOUVERTE" | "ESSENTIEL" | "PERFORMANCE";
  mealsQty: number;
  snackQty: number;
  price: number;
  promoActive: boolean;
  promoPercent: number;
  effectivePrice: number;
}