import Link from "next/link";

export default function PaiementAnnulePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 text-center min-w-0 w-full">
      <h1 className="text-2xl font-heading text-secondary mb-3">Paiement annulé</h1>
      <p className="text-text-muted text-sm mb-6">Tu peux réessayer depuis ton espace client.</p>
      <Link href="/mon-espace" className="bg-primary text-white font-semibold px-6 py-2.5 rounded-md inline-block">
        Retour à mon espace
      </Link>
    </div>
  );
}