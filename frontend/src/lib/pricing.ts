export function getEffectivePrice(pack: { price: number; promoActive: boolean; promoPercent: number }) {
  if (!pack.promoActive || pack.promoPercent <= 0) return pack.price;
  return Math.round(pack.price * (1 - pack.promoPercent / 100));
}

/** Prix final d'un abonnement : pack + accès à la salle choisie (3 séances/semaine incluses). */
export function getSubscriptionPrice(
  pack: { price: number; promoActive: boolean; promoPercent: number },
  gym: { weeklyFee: number }
) {
  return getEffectivePrice(pack) + gym.weeklyFee;
}