"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconStar } from "@/components/icons";

interface MealOption { id: string; name: string; }

export default function ReviewForm() {
  const router = useRouter();
  const [meals, setMeals] = useState<MealOption[]>([]);
  const [mealId, setMealId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/reviews/eligible-meals").then((res) => res.json()).then((data) => setMeals(data.meals ?? []));
  }, []);

  const submit = async () => {
    setError(null);
    setSuccess(false);
    if (!mealId) {
      setError("Choisis un plat.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mealId, rating, comment }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error ?? "Erreur lors de l'envoi de l'avis.");
      return;
    }
    setSuccess(true);
    setComment("");
    router.refresh();
  };

  if (!meals.length) return null;

  return (
    <div className="bg-bg-light rounded-lg p-4 mb-4">
      <h5 className="font-heading text-secondary text-sm mb-3">Laisser un avis</h5>

      {error && <p className="bg-danger/10 text-danger text-sm rounded-md p-2 mb-3">{error}</p>}
      {success && <p className="bg-success/10 text-success text-sm rounded-md p-2 mb-3">Avis enregistré, merci !</p>}

      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <select value={mealId} onChange={(e) => setMealId(e.target.value)} className="border border-border rounded-md p-2 text-sm">
          <option value="">Choisir un plat</option>
          {meals.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)}>
              <IconStar size={18} className={n <= rating ? "fill-primary text-primary" : "text-border"} />
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Commentaire (optionnel)"
        className="w-full border border-border rounded-md p-2 text-sm mb-3"
        rows={2}
      />

      <button onClick={submit} disabled={loading} className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-md disabled:opacity-50">
        {loading ? "Envoi..." : "Envoyer l'avis"}
      </button>
    </div>
  );
}