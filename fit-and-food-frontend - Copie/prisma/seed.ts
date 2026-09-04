import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // 6 packs figés (objectif × formule)
  await prisma.pack.createMany({
    data: [
      { goal: "PRISE_DE_MASSE", formule: "DECOUVERTE", mealsQty: 5, snackQty: 0, price: 23000 },
      { goal: "PRISE_DE_MASSE", formule: "ESSENTIEL", mealsQty: 5, snackQty: 5, price: 32000 },
      { goal: "PRISE_DE_MASSE", formule: "PERFORMANCE", mealsQty: 10, snackQty: 5, price: 50000 },
      { goal: "PERTE_DE_POIDS", formule: "DECOUVERTE", mealsQty: 5, snackQty: 0, price: 21000 },
      { goal: "PERTE_DE_POIDS", formule: "ESSENTIEL", mealsQty: 5, snackQty: 5, price: 30000 },
      { goal: "PERTE_DE_POIDS", formule: "PERFORMANCE", mealsQty: 10, snackQty: 5, price: 46000 },
    ],
    skipDuplicates: true,
  });

  // Salles partenaires
  await prisma.gym.createMany({
    data: [
      { name: "Dakar Fitness Club", address: "Mermoz, Dakar", active: true },
      { name: "Iron Temple Gym", address: "Sacré-Coeur, Dakar", active: true },
      { name: "Almadies Sport Center", address: "Almadies, Dakar", active: true },
    ],
    skipDuplicates: true,
  });

  // Catégories de plats
  const categoryNames = ["Volaille", "Boeuf", "Poisson", "Végétal", "Protéiné"];
  for (const name of categoryNames) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }

  // Repas & collations
  const meals: {
    name: string;
    calories: number;
    proteins: number;
    type: string;
    goal: "PRISE_DE_MASSE" | "PERTE_DE_POIDS" | null;
    allergenTags: string[];
    category: string;
  }[] = [
    { name: "Poulet grillé & riz complet", calories: 520, proteins: 42, type: "Repas", goal: "PRISE_DE_MASSE", allergenTags: [], category: "Volaille" },
    { name: "Boeuf sauté aux légumes", calories: 480, proteins: 38, type: "Repas", goal: "PRISE_DE_MASSE", allergenTags: [], category: "Boeuf" },
    { name: "Thiéboudieune healthy (poisson & légumes)", calories: 450, proteins: 35, type: "Repas", goal: "PERTE_DE_POIDS", allergenTags: ["Sans Lactose"], category: "Poisson" },
    { name: "Bol de quinoa & pois chiches", calories: 380, proteins: 18, type: "Repas", goal: "PERTE_DE_POIDS", allergenTags: ["Sans Gluten", "Sans Lactose"], category: "Végétal" },
    { name: "Blanc de poulet & patate douce", calories: 500, proteins: 45, type: "Repas", goal: "PRISE_DE_MASSE", allergenTags: ["Sans Gluten"], category: "Volaille" },
    { name: "Salade de thon protéinée", calories: 340, proteins: 30, type: "Repas", goal: "PERTE_DE_POIDS", allergenTags: ["Sans Lactose"], category: "Poisson" },
    { name: "Wrap dinde & légumes", calories: 410, proteins: 32, type: "Repas", goal: "PRISE_DE_MASSE", allergenTags: [], category: "Volaille" },
    { name: "Tofu sauté & riz complet", calories: 360, proteins: 22, type: "Repas", goal: "PERTE_DE_POIDS", allergenTags: ["Sans Gluten", "Sans Lactose"], category: "Végétal" },
    { name: "Barre protéinée maison", calories: 180, proteins: 15, type: "Collation", goal: null, allergenTags: ["Sans Gluten"], category: "Protéiné" },
    { name: "Yaourt grec & fruits secs", calories: 150, proteins: 12, type: "Collation", goal: null, allergenTags: [], category: "Protéiné" },
    { name: "Mix de noix", calories: 200, proteins: 8, type: "Collation", goal: null, allergenTags: ["Sans Lactose", "Sans Gluten"], category: "Végétal" },
    { name: "Smoothie protéiné banane", calories: 220, proteins: 20, type: "Collation", goal: null, allergenTags: [], category: "Protéiné" },
  ];

  for (const m of meals) {
    await prisma.mealItem.create({
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

  console.log("Seed terminé ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });