"use client";

import { useState } from "react";
import StepGoalPack from "./StepGoalPack";
import StepMeals from "./StepMeals";
import StepPayment from "./StepPayment";
import type { Pack } from "@/types";

export interface SelectedMeal {
  mealId: string;
  name: string;
  type: "Repas" | "Collation";
  quantity: number;
}

export default function SubscriptionWizard() {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<"PRISE_DE_MASSE" | "PERTE_DE_POIDS">("PRISE_DE_MASSE");
  const [mixedGoal, setMixedGoal] = useState(false);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [selectedMeals, setSelectedMeals] = useState<SelectedMeal[]>([]);

  return (
    <div>
      {step === 1 && (
        <StepGoalPack
          goal={goal}
          setGoal={setGoal}
          mixedGoal={mixedGoal}
          setMixedGoal={setMixedGoal}
          selectedPack={selectedPack}
          setSelectedPack={setSelectedPack}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && selectedPack && (
        <StepMeals
          pack={selectedPack}
          mixedGoal={mixedGoal}
          selectedMeals={selectedMeals}
          setSelectedMeals={setSelectedMeals}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && selectedPack && (
        <StepPayment
          pack={selectedPack}
          mixedGoal={mixedGoal}
          selectedMeals={selectedMeals}
          onBack={() => setStep(2)}
        />
      )}
    </div>
  );
}