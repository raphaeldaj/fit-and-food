import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import TwoFactorSetup from "@/components/auth/TwoFactorSetup";

export default async function ParametresPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  return (
    <div className="container max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-heading text-secondary mb-6">Paramètres du compte</h1>
      <TwoFactorSetup initiallyEnabled={user.twoFactorEnabled} />
    </div>
  );
}