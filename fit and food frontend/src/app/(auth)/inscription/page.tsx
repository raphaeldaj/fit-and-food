import AuthCard from "@/components/auth/AuthCard";

export default function InscriptionPage() {
  return (
    <div className="bg-secondary flex-1 flex flex-col">
      <AuthCard initialMode="signup" />
    </div>
  );
}