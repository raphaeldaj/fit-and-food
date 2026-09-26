"use client";

import { useEffect, useState } from "react";
import { IconMeal, IconCalories, IconProteins, IconStar } from "@/components/icons";
import styles from "./MealCard.module.css";

interface MealCardProps {
  name: string;
  photoUrl: string | null;
  calories: number;
  proteins: number;
  avgRating: number | null;
  tagline: string;
}

export default function MealCard({ name, photoUrl, calories, proteins, avgRating, tagline }: MealCardProps) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`${styles.card} ${revealed ? styles.revealed : ""}`}>
      <div className={styles.profilePic}>
        {photoUrl ? (
          <img src={photoUrl} alt={name} />
        ) : (
          <div className={styles.placeholderIcon}>
            <IconMeal size={48} />
          </div>
        )}
      </div>

      <div className={styles.bottom}>
        <div className={styles.content}>
          <span className={styles.name}>{name}</span>
          <span className={styles.aboutMe}>{tagline}</span>
        </div>

        <div className={styles.bottomBottom}>
          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <IconCalories size={18} />
              <span className={styles.statValue}>{calories} kcal</span>
            </div>
            <div className={styles.statItem}>
              <IconProteins size={18} />
              <span className={styles.statValue}>{proteins}g</span>
            </div>
            {avgRating !== null && (
              <div className={styles.statItem}>
                <IconStar size={18} className="fill-white" />
                <span className={styles.statValue}>{avgRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <a href="/" className={styles.button}>Fit &amp; Food</a>
        </div>
      </div>
    </div>
  );
}