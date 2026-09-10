import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type PackRecord = Prisma.PackGetPayload<Record<string, never>>;
type GymRecord = Prisma.GymGetPayload<Record<string, never>>;
type MealRecord = Prisma.MealItemGetPayload<Record<string, never>>;

async function main() {
  // 1. Packs (6 formules figées)
  const packsData = [
    { goal: "PRISE_DE_MASSE" as const, formule: "DECOUVERTE" as const, mealsQty: 5, snackQty: 0, price: 23000 },
    { goal: "PRISE_DE_MASSE" as const, formule: "ESSENTIEL" as const, mealsQty: 5, snackQty: 5, price: 32000 },
    { goal: "PRISE_DE_MASSE" as const, formule: "PERFORMANCE" as const, mealsQty: 10, snackQty: 5, price: 50000 },
    { goal: "PERTE_DE_POIDS" as const, formule: "DECOUVERTE" as const, mealsQty: 5, snackQty: 0, price: 21000 },
    { goal: "PERTE_DE_POIDS" as const, formule: "ESSENTIEL" as const, mealsQty: 5, snackQty: 5, price: 30000 },
    { goal: "PERTE_DE_POIDS" as const, formule: "PERFORMANCE" as const, mealsQty: 10, snackQty: 5, price: 46000 },
  ];

  const packs: PackRecord[] = [];
  for (const p of packsData) {
    const pack = await prisma.pack.upsert({
      where: { goal_formule: { goal: p.goal, formule: p.formule } },
      update: {},
      create: p,
    });
    packs.push(pack);
  }

  // 2. Salles partenaires
  const gymNames = [
    { name: "Dakar Fitness Club", address: "Mermoz, Dakar" },
    { name: "Iron Temple Gym", address: "Sacré-Coeur, Dakar" },
    { name: "Almadies Sport Center", address: "Almadies, Dakar" },
  ];
  const gyms: GymRecord[] = [];
  for (const g of gymNames) {
    let gym = await prisma.gym.findFirst({ where: { name: g.name } });
    if (!gym) gym = await prisma.gym.create({ data: { ...g, active: true } });
    gyms.push(gym);
  }

  // 3. Catégories
  const categoryNames = ["Volaille", "Boeuf", "Poisson", "Végétal", "Protéiné"];
  for (const name of categoryNames) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }

  // 4. Repas & collations
  const mealsData = [
    { name: "Poulet grillé & riz complet", calories: 520, proteins: 42, type: "Repas", goal: "PRISE_DE_MASSE" as const, allergenTags: [] as string[], category: "Volaille" },
    { name: "Boeuf sauté aux légumes", calories: 480, proteins: 38, type: "Repas", goal: "PRISE_DE_MASSE" as const, allergenTags: [] as string[], category: "Boeuf" },
    { name: "Thiéboudieune healthy (poisson & légumes)", calories: 450, proteins: 35, type: "Repas", goal: "PERTE_DE_POIDS" as const, allergenTags: ["Sans Lactose"], category: "Poisson" },
    { name: "Bol de quinoa & pois chiches", calories: 380, proteins: 18, type: "Repas", goal: "PERTE_DE_POIDS" as const, allergenTags: ["Sans Gluten", "Sans Lactose"], category: "Végétal" },
    { name: "Blanc de poulet & patate douce", calories: 500, proteins: 45, type: "Repas", goal: "PRISE_DE_MASSE" as const, allergenTags: ["Sans Gluten"], category: "Volaille" },
    { name: "Salade de thon protéinée", calories: 340, proteins: 30, type: "Repas", goal: "PERTE_DE_POIDS" as const, allergenTags: ["Sans Lactose"], category: "Poisson" },
    { name: "Wrap dinde & légumes", calories: 410, proteins: 32, type: "Repas", goal: "PRISE_DE_MASSE" as const, allergenTags: [] as string[], category: "Volaille" },
    { name: "Tofu sauté & riz complet", calories: 360, proteins: 22, type: "Repas", goal: "PERTE_DE_POIDS" as const, allergenTags: ["Sans Gluten", "Sans Lactose"], category: "Végétal" },
    { name: "Barre protéinée maison", calories: 180, proteins: 15, type: "Collation", goal: null, allergenTags: ["Sans Gluten"], category: "Protéiné" },
    { name: "Yaourt grec & fruits secs", calories: 150, proteins: 12, type: "Collation", goal: null, allergenTags: [] as string[], category: "Protéiné" },
    { name: "Mix de noix", calories: 200, proteins: 8, type: "Collation", goal: null, allergenTags: ["Sans Lactose", "Sans Gluten"], category: "Végétal" },
    { name: "Smoothie protéiné banane", calories: 220, proteins: 20, type: "Collation", goal: null, allergenTags: [] as string[], category: "Protéiné" },
  ];

  const meals: MealRecord[] = [];
  for (const m of mealsData) {
    let meal = await prisma.mealItem.findFirst({ where: { name: m.name } });
    if (!meal) {
      meal = await prisma.mealItem.create({
        data: {
          name: m.name,
          calories: m.calories,
          proteins: m.proteins,
          type: m.type,
          goal: m.goal,
          allergenTags: m.allergenTags,
          availability: "IN_STOCK",
          categories: { connect: [{ name: m.category }] },
        },
      });
    }
    meals.push(meal);
  }

  const repasList = meals.filter((m) => m.type === "Repas");
  const collationList = meals.filter((m) => m.type === "Collation");

  // 5. Comptes de test (clients + admin)
  const passwordHash = await bcrypt.hash("TestPass123!", 12);
  const adminPasswordHash = await bcrypt.hash("AdminPass123!", 12);

  const testUsersData = [
    { fullName: "Fatou Ndiaye", email: "fatou.test@fitandfood.sn", phone: "771234501", role: "CLIENT" as const, passwordHash, gymId: gyms[0].id },
    { fullName: "Moussa Diop", email: "moussa.test@fitandfood.sn", phone: "771234502", role: "CLIENT" as const, passwordHash, gymId: gyms[1].id },
    { fullName: "Aissatou Fall", email: "aissatou.test@fitandfood.sn", phone: "771234503", role: "CLIENT" as const, passwordHash, gymId: null },
    { fullName: "Fatima Ba", email: "admin.test@fitandfood.sn", phone: "771234504", role: "ADMIN" as const, passwordHash: adminPasswordHash, gymId: null },
  ];

  const users = [];
  for (const u of testUsersData) {
    let user = await prisma.user.findUnique({ where: { email: u.email } });
    if (!user) user = await prisma.user.create({ data: u });
    users.push(user);
  }

  const [fatou, moussa, aissatou] = users;

  // 6. Abonnements + commandes + paiements + livraisons + avis (une seule fois par client)
  async function seedSubscriptionFor(
    user: typeof fatou,
    pack: PackRecord,
    status: "ACTIVE" | "SUSPENDED",
    gymId: string | null
  ) {
    const existing = await prisma.subscription.findFirst({ where: { userId: user.id } });
    if (existing) return existing;

    const chosenRepas = repasList.slice(0, pack.mealsQty);
    const chosenSnacks = collationList.slice(0, pack.snackQty);

    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        packId: pack.id,
        slot: "LUNDI",
        paymentMethod: "WAVE",
        status,
        address: "Dakar, quartier test",
        phone: user.phone,
        gymId,
        nextDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        items: {
          create: [
            ...chosenRepas.map((m) => ({ mealId: m.id, quantity: 1 })),
            ...chosenSnacks.map((m) => ({ mealId: m.id, quantity: 1 })),
          ],
        },
      },
    });

    for (let i = 2; i >= 0; i--) {
      const cycleDate = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
      const isPast = i > 0;
      const order = await prisma.order.create({
        data: { subscriptionId: subscription.id, amount: pack.price, status: isPast ? "PAID" : "PENDING", cycleDate },
      });
      if (isPast) {
        await prisma.payment.create({ data: { orderId: order.id, method: "WAVE", status: "SUCCESS" } });
        await prisma.delivery.create({ data: { orderId: order.id, slot: "LUNDI", date: cycleDate, status: "delivered" } });
      }
    }

    for (const meal of chosenRepas.slice(0, 2)) {
      await prisma.review.create({
        data: { userId: user.id, mealId: meal.id, rating: 4 + Math.round(Math.random()), comment: "Très bon, à recommander." },
      });
    }

    return subscription;
  }

  await seedSubscriptionFor(fatou, packs.find((p) => p.goal === "PRISE_DE_MASSE" && p.formule === "ESSENTIEL")!, "ACTIVE", gyms[0].id);
  await seedSubscriptionFor(moussa, packs.find((p) => p.goal === "PERTE_DE_POIDS" && p.formule === "PERFORMANCE")!, "ACTIVE", gyms[1].id);
  await seedSubscriptionFor(aissatou, packs.find((p) => p.goal === "PERTE_DE_POIDS" && p.formule === "DECOUVERTE")!, "SUSPENDED", null);

  // 7. Une promo active pour tester l'affichage
  await prisma.pack.update({
    where: { id: packs.find((p) => p.goal === "PRISE_DE_MASSE" && p.formule === "PERFORMANCE")!.id },
    data: { promoActive: true, promoPercent: 15 },
  });

  // 8. Logs d'activité de test
  await prisma.activityLog.createMany({
    data: [
      { userName: "Fatima Ba", role: "ADMIN", action: "Compte de test initialisé via seed" },
      { userName: "Système (cron)", action: "Cycle de reconduction simulé (données de seed)" },
    ],
  });

  console.log("✅ Données de test générées.");
  console.log("");
  console.log("🔑 Comptes de test :");
  console.log("   Client 1 : fatou.test@fitandfood.sn / TestPass123!");
  console.log("   Client 2 : moussa.test@fitandfood.sn / TestPass123!");
  console.log("   Client 3 (suspendu) : aissatou.test@fitandfood.sn / TestPass123!");
  console.log("   Admin    : admin.test@fitandfood.sn / AdminPass123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });