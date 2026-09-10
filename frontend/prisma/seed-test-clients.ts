import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type PackRecord = Prisma.PackGetPayload<Record<string, never>>;
type GymRecord = Prisma.GymGetPayload<Record<string, never>>;
type MealRecord = Prisma.MealItemGetPayload<Record<string, never>>;

const FIRST_NAMES = [
  "Fatou", "Moussa", "Aissatou", "Cheikh", "Awa", "Ibrahima", "Ndeye", "Ousmane",
  "Mariama", "Abdoulaye", "Khady", "Mamadou", "Sokhna", "Modou", "Bineta",
  "Alioune", "Coumba", "Babacar", "Rokhaya", "Serigne", "Aminata", "Lamine",
  "Adama", "Fama", "Souleymane",
];
const LAST_NAMES = [
  "Ndiaye", "Diop", "Fall", "Sow", "Diallo", "Gueye", "Sarr", "Ba", "Cisse",
  "Toure", "Kane", "Diagne", "Faye", "Mbaye", "Sy", "Camara", "Thiam",
  "Ndour", "Seck", "Wade", "Niang", "Sane", "Diatta", "Coly", "Badiane",
];

async function ensureBaseData() {
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

  const categoryNames = ["Volaille", "Boeuf", "Poisson", "Végétal", "Protéiné"];
  for (const name of categoryNames) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }

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

  return { packs, gyms, meals };
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone(index: number) {
  return `77${(3000000 + index).toString().padStart(7, "0")}`;
}

async function main() {
  const { packs, gyms, meals } = await ensureBaseData();
  const repasList = meals.filter((m) => m.type === "Repas");
  const collationList = meals.filter((m) => m.type === "Collation");

  const passwordHash = await bcrypt.hash("TestPass123!", 12);

  // Répartition des statuts sur 25 clients : 17 actifs, 5 suspendus, 3 annulés
  const statusPlan: ("ACTIVE" | "SUSPENDED" | "CANCELLED")[] = [
    ...Array(17).fill("ACTIVE"),
    ...Array(5).fill("SUSPENDED"),
    ...Array(3).fill("CANCELLED"),
  ];

  let created = 0;

  for (let i = 0; i < 25; i++) {
    const fullName = `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`;
    const email = `client${i + 1}.test@fitandfood.sn`;
    const phone = randomPhone(i);

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          fullName,
          email,
          phone,
          passwordHash,
          role: "CLIENT",
          gymId: Math.random() > 0.3 ? randomFrom(gyms).id : null,
        },
      });
      created++;

      await prisma.activityLog.create({
        data: { userId: user.id, userName: user.fullName, role: "CLIENT", action: "Inscription (donnée de test)" },
      });
    }

    // Un seul abonnement par client de test, cohérent avec les règles métier
    const existingSub = await prisma.subscription.findFirst({ where: { userId: user.id } });
    if (existingSub) continue;

    const pack = randomFrom(packs);
    const status = statusPlan[i];
    const slot = randomFrom<"LUNDI" | "JEUDI">(["LUNDI", "JEUDI"]);
    const paymentMethod = randomFrom<"WAVE" | "ORANGE_MONEY">(["WAVE", "ORANGE_MONEY"]);

    // Composition respectant exactement le quota du pack
    const chosenRepas = Array.from({ length: pack.mealsQty }, () => randomFrom(repasList));
    const chosenSnacks = Array.from({ length: pack.snackQty }, () => randomFrom(collationList));

    const itemCounts = new Map<string, { meal: MealRecord; quantity: number }>();
    for (const meal of [...chosenRepas, ...chosenSnacks]) {
      const entry = itemCounts.get(meal.id);
      if (entry) entry.quantity += 1;
      else itemCounts.set(meal.id, { meal, quantity: 1 });
    }

    const nextDueDate = new Date(Date.now() + Math.floor(Math.random() * 7 + 1) * 24 * 60 * 60 * 1000);

    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        packId: pack.id,
        slot,
        paymentMethod,
        status,
        address: `Quartier test ${i + 1}, Dakar`,
        phone,
        gymId: user.gymId,
        nextDueDate,
        failedCycles: status === "SUSPENDED" ? 3 : 0,
        items: {
          create: Array.from(itemCounts.values()).map(({ meal, quantity }) => ({ mealId: meal.id, quantity })),
        },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        userName: user.fullName,
        role: "CLIENT",
        action: `Nouvelle souscription (donnée de test) — ${pack.formule} (${pack.goal})`,
      },
    });

    // Historique de cycles : 1 à 4 commandes passées, cohérent avec le statut
    const cycleCount = status === "CANCELLED" ? 1 : Math.floor(Math.random() * 4) + 1;

    for (let c = cycleCount; c >= 1; c--) {
      const cycleDate = new Date(Date.now() - c * 7 * 24 * 60 * 60 * 1000);
      // Le dernier cycle d'un abonnement suspendu doit être en échec (cohérent avec failedCycles=3)
      const isLastCycleOfSuspended = status === "SUSPENDED" && c === 1;
      const success = isLastCycleOfSuspended ? false : Math.random() > 0.1;

      const order = await prisma.order.create({
        data: { subscriptionId: subscription.id, amount: pack.price, status: success ? "PAID" : "FAILED", cycleDate },
      });

      await prisma.payment.create({
        data: { orderId: order.id, method: paymentMethod, status: success ? "SUCCESS" : "FAILED" },
      });

      if (success) {
        await prisma.delivery.create({
          data: { orderId: order.id, slot, date: cycleDate, status: "delivered" },
        });
      }
    }

    // Avis sur 0 à 2 repas reçus, uniquement si au moins une commande payée
    const paidOrder = await prisma.order.findFirst({ where: { subscriptionId: subscription.id, status: "PAID" } });
    if (paidOrder) {
      const reviewCount = Math.floor(Math.random() * 3);
      const reviewedMeals = Array.from(itemCounts.values()).slice(0, reviewCount);
      for (const { meal } of reviewedMeals) {
        await prisma.review.create({
          data: {
            userId: user.id,
            mealId: meal.id,
            rating: Math.floor(Math.random() * 3) + 3, // note entre 3 et 5
            comment: randomFrom([
              "Très bon, à recommander.",
              "Correct, portions un peu justes.",
              "Excellent rapport qualité/prix.",
              "Bien assaisonné, je recommande.",
              null,
            ]),
          },
        });
      }
    }
  }

  await prisma.activityLog.create({
    data: { userName: "Système (seed)", action: `Génération de 25 clients de test (${created} nouveaux comptes créés)` },
  });

  console.log(`✅ ${created} nouveaux clients de test créés (25 traités au total, doublons ignorés).`);
  console.log("🔑 Mot de passe commun : TestPass123!");
  console.log("📧 Emails : client1.test@fitandfood.sn ... client25.test@fitandfood.sn");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });