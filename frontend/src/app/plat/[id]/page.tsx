import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import MealCard from "@/components/meal/MealCard";

export default async function PlatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meal = await db.mealItem.findUnique({
    where: { id },
    include: { categories: true, reviews: true },
  });

  if (!meal) notFound();

  const avgRating = meal.reviews.length
    ? meal.reviews.reduce((sum, r) => sum + r.rating, 0) / meal.reviews.length
    : null;

  const tagline = [
    meal.type,
    ...meal.categories.map((c) => c.name),
    ...meal.allergenTags,
  ].join(" · ");

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 bg-bg-light min-w-0 w-full">
      <MealCard
        name={meal.name}
        photoUrl={meal.photoUrl}
        calories={meal.calories}
        proteins={meal.proteins}
        avgRating={avgRating}
        tagline={tagline}
      />
    </div>
  );
}