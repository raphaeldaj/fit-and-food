export default function CGUPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 min-w-0 w-full">
      <h1 className="text-2xl font-heading text-secondary mb-6">Conditions Générales d&apos;Utilisation</h1>

      <section className="mb-6">
        <h2 className="font-heading text-secondary text-lg mb-2">1. Accès au site</h2>
        <p className="text-sm text-text-dark leading-relaxed">
          L&apos;accès au site Fit &amp; Food et à ses fonctionnalités (catalogue, souscription, espace client) est
          gratuit. La création d&apos;un compte est nécessaire pour souscrire à un abonnement.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-heading text-secondary text-lg mb-2">2. Compte utilisateur</h2>
        <p className="text-sm text-text-dark leading-relaxed">
          Chaque utilisateur est responsable de la confidentialité de ses identifiants de connexion. Fit &amp; Food
          propose une authentification renforcée (double authentification) que l&apos;utilisateur peut activer
          depuis les paramètres de son compte.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-heading text-secondary text-lg mb-2">3. Utilisation autorisée</h2>
        <p className="text-sm text-text-dark leading-relaxed">
          L&apos;utilisateur s&apos;engage à fournir des informations exactes lors de son inscription et à ne pas
          utiliser le site à des fins frauduleuses ou contraires à son objet.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-secondary text-lg mb-2">4. Responsabilité</h2>
        <p className="text-sm text-text-dark leading-relaxed">
          Fit &amp; Food met tout en œuvre pour assurer la disponibilité du site, sans garantie d&apos;accès continu
          et ininterrompu. Fit &amp; Food ne saurait être tenu responsable des interruptions liées à des causes
          extérieures (maintenance, panne d&apos;un prestataire tiers).
        </p>
      </section>
    </div>
  );
}