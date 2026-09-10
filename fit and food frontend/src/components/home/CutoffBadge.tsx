"use client";

import { useEffect, useState } from "react";

export default function CutoffBadge() {
  const [text, setText] = useState("Calcul du prochain cutoff...");

  useEffect(() => {
    const day = new Date().getDay();
    setText(
      day <= 5
        ? "Cutoff vendredi 23h59 pour la livraison de lundi"
        : "Cutoff mardi 23h59 pour la livraison de jeudi"
    );
  }, []);

  return (
    <div className="inline-block bg-primary/20 border border-primary text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
      {text}
    </div>
  );
}