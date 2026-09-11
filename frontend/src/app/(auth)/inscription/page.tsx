import AuthCard from "@/components/auth/AuthCard";

export default function InscriptionPage() {
  return (
    <div className="bg-secondary flex-1 flex flex-col items-center justify-start pt-16 pb-10 px-4">
      <AuthCard initialMode="signup" />
    </div>
  );
}