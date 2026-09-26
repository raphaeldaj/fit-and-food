import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { IconStar } from "@/components/icons";

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 min-w-0 w-full">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {meal.photoUrl && (
          <img src={meal.photoUrl} alt={meal.name} className="w-full h-56 object-cover" />
        )}
        <div className="p-6">
          <h1 className="text-2xl font-heading text-secondary mb-2">{meal.name}</h1>
          <p className="text-sm text-text-muted mb-4">
            {meal.type}
            {meal.goal ? ` · ${meal.goal.replace("_", " ")}` : ""}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-bg-light rounded-md p-3 text-center">
              <p className="text-xl font-heading text-primary">{meal.calories}</p>
              <p className="text-xs text-text-muted">kcal</p>
            </div>
            <div className="bg-bg-light rounded-md p-3 text-center">
              <p className="text-xl font-heading text-primary">{meal.proteins}g</p>
              <p className="text-xs text-text-muted">protéines</p>
            </div>
          </div>

          {(meal.categories.length > 0 || meal.allergenTags.length > 0) && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {meal.categories.map((c) => (
                <span key={c.id} className="text-xs bg-teal-50 text-teal-800 px-2 py-1 rounded font-medium">
                  {c.name}
                </span>
              ))}
              {meal.allergenTags.map((a) => (
                <span key={a} className="text-xs bg-slate-100 text-text-dark px-2 py-1 rounded font-medium">
                  {a}
                </span>
              ))}
            </div>
          )}

          {avgRating !== null && (
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <IconStar
                  key={i}
                  size={16}
                  className={i < Math.round(avgRating) ? "fill-primary text-primary" : "text-border"}
                />
              ))}
              <span className="text-xs text-text-muted">({meal.reviews.length} avis)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}