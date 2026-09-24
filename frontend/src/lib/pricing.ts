export function getEffectivePrice(pack: { price: number; promoActive: boolean; promoPercent: number }) {
  if (!pack.promoActive || pack.promoPercent <= 0) return pack.price;
  return Math.round(pack.price * (1 - pack.promoPercent / 100));
}

/**
 * Prix final d'un abonnement.
 * Le tarif salle (Gym.weeklyFee) n'intervient plus dans le calcul — il reste
 * disponible en base et dans le schéma pour une réactivation future éventuelle,
 * mais le prix facturé correspond uniquement au pack repas.
 */
export function getSubscriptionPrice(pack: { price: number; promoActive: boolean; promoPercent: number }) {
  return getEffectivePrice(pack);
}