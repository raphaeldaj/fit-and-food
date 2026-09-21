export default function CGVPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 min-w-0 w-full">
      <h1 className="text-2xl font-heading text-primary mb-6">Conditions Générales de Vente</h1>

      <section className="mb-6">
        <h2 className="font-heading text-primary text-lg mb-2">1. Objet</h2>
        <p className="text-sm text-text-dark leading-relaxed">
          Les présentes CGV régissent la vente d&apos;abonnements de repas préparés (packs Découverte, Essentiel,
          Performance) par Fit &amp; Food, service de livraison de repas basé à Dakar, Sénégal.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-heading text-primary text-lg mb-2">2. Souscription et composition du pack</h2>
        <p className="text-sm text-text-dark leading-relaxed">
          Le client choisit un objectif (prise de masse ou perte de poids), une formule, puis compose son pack
          repas par repas dans la limite du quota associé à la formule choisie.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-heading text-primary text-lg mb-2">3. Prix et paiement</h2>
        <p className="text-sm text-text-dark leading-relaxed">
          Les prix sont indiqués en Francs CFA (XOF), toutes taxes comprises. Le paiement s&apos;effectue exclusivement
          via Wave ou Orange Money, par l&apos;intermédiaire du prestataire SenePay. Aucune donnée bancaire n&apos;est
          collectée ni stockée par Fit &amp; Food.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-heading text-primary text-lg mb-2">4. Reconduction et cycles de livraison</h2>
        <p className="text-sm text-text-dark leading-relaxed">
          L&apos;abonnement se reconduit selon un rythme hebdomadaire, avec livraison le lundi ou le jeudi. Toute
          souscription ou modification après le cutoff (vendredi 23h59 pour le lundi, mardi 23h59 pour le jeudi)
          est automatiquement reportée au créneau suivant.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-heading text-primary text-lg mb-2">5. Suspension et annulation</h2>
        <p className="text-sm text-text-dark leading-relaxed">
          Le client peut suspendre ou annuler son abonnement à tout moment depuis son espace client, avant le
          cutoff du prochain cycle. Un abonnement peut également être suspendu automatiquement après plusieurs
          échecs de paiement consécutifs.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-primary text-lg mb-2">6. Livraison</h2>
        <p className="text-sm text-text-dark leading-relaxed">
          Les repas de la semaine sont livrés en un seul passage groupé, à l&apos;adresse renseignée par le client,
          selon le créneau choisi (lundi ou jeudi). La livraison est incluse dans le prix du pack.
        </p>
      </section>
    </div>
  );
}