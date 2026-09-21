export default function ConfidentialitePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 min-w-0 w-full">
      <h1 className="text-2xl font-heading text-primary mb-6">Politique de confidentialité</h1>

      <section className="mb-6">
        <h2 className="font-heading text-primary text-lg mb-2">1. Données collectées</h2>
        <p className="text-sm text-text-dark leading-relaxed">
          Fit &amp; Food collecte les données suivantes lors de l&apos;inscription et de l&apos;utilisation du service :
          nom complet, email, téléphone, adresse de livraison, et informations liées à l&apos;abonnement (formule,
          composition, historique de commandes).
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-heading text-primary text-lg mb-2">2. Protection des données</h2>
        <p className="text-sm text-text-dark leading-relaxed">
          Les données personnelles sensibles (nom, email, téléphone, adresse) sont chiffrées avant leur stockage
          en base de données. Les mots de passe sont hachés et ne sont jamais stockés en clair. L&apos;accès aux
          données est protégé par authentification, avec option de double authentification.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-heading text-primary text-lg mb-2">3. Utilisation des données</h2>
        <p className="text-sm text-text-dark leading-relaxed">
          Les données collectées servent exclusivement à la gestion des commandes, des livraisons, et de la
          relation client. Elles ne sont ni vendues, ni partagées avec des tiers à des fins commerciales.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-heading text-primary text-lg mb-2">4. Paiement</h2>
        <p className="text-sm text-text-dark leading-relaxed">
          Les paiements sont traités par SenePay. Fit &amp; Food ne collecte, ne transmet, ni ne stocke aucune
          donnée bancaire (numéro de carte, code, etc.).
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-heading text-primary text-lg mb-2">5. Cookies</h2>
        <p className="text-sm text-text-dark leading-relaxed">
          Le site utilise uniquement des cookies techniques strictement nécessaires au fonctionnement du compte
          (authentification, session sécurisée). Aucun cookie publicitaire ou de suivi tiers n&apos;est utilisé.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-primary text-lg mb-2">6. Droits de l&apos;utilisateur</h2>
        <p className="text-sm text-text-dark leading-relaxed">
          Conformément à la réglementation en vigueur, tout utilisateur peut demander l&apos;accès, la modification
          ou la suppression de ses données personnelles en nous contactant à contact@fit-and-food.onrender.com.
        </p>
      </section>
    </div>
  );
}