export function getEffectivePrice(pack: { price: number; promoActive: boolean; promoPercent: number }) {
  if (!pack.promoActive || pack.promoPercent <= 0) return pack.price;
  return Math.round(pack.price * (1 - pack.promoPercent / 100));
}


export function getSubscriptionPrice(pack: { price: number; promoActive: boolean; promoPercent: number }) {
  return getEffectivePrice(pack);
}