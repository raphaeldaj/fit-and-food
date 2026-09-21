export default function MentionsLegalesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 min-w-0 w-full">
      <h1 className="text-2xl font-heading text-primary mb-6">Mentions légales</h1>

      <section className="mb-6">
        <h2 className="font-heading text-primary text-lg mb-2">Éditeur du site</h2>
        <p className="text-sm text-text-dark leading-relaxed">
          Le site Fit &amp; Food (accessible à l&apos;adresse fit-and-food.onrender.com) est édité par :
        </p>
        <ul className="text-sm text-text-dark leading-relaxed mt-2 space-y-1">
          <li><strong>Raison sociale :</strong> Fit and Food</li>
          <li><strong>Forme juridique :</strong> Entreprise individuelle</li>
          <li><strong>Représentant légal :</strong> Cheikh Abdalah Ndiaye</li>
          <li><strong>RCCM :</strong> SN DKR 2026 A 14723</li>
          <li><strong>NINEA :</strong> 012995702</li>
          <li><strong>Siège :</strong> Sangalkam, Quartier Kounoune, Dakar, Sénégal</li>
          <li><strong>Email :</strong> contact@fit-and-food.onrender.com</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-heading text-primary text-lg mb-2">Hébergement</h2>
        <p className="text-sm text-text-dark leading-relaxed">
          Le site est hébergé par Render Services, Inc. — 525 Brannan St Suite 300, San Francisco, CA 94107, États-Unis.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-heading text-primary text-lg mb-2">Paiement</h2>
        <p className="text-sm text-text-dark leading-relaxed">
          Les paiements en ligne (Wave, Orange Money) sont traités par SenePay, prestataire de services de paiement.
          Fit &amp; Food ne stocke aucune donnée bancaire.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-primary text-lg mb-2">Propriété intellectuelle</h2>
        <p className="text-sm text-text-dark leading-relaxed">
          L&apos;ensemble des contenus présents sur ce site (textes, logo, visuels) est la propriété de Fit &amp; Food,
          sauf mention contraire, et ne peut être reproduit sans autorisation préalable.
        </p>
      </section>
    </div>
  );
}