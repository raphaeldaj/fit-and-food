import Link from "next/link";
import { IconDelivery, IconPayment } from "@/components/icons";

export default function Footer() {
  return (
    <footer className="bg-secondary text-white/70 text-sm pt-10 pb-6 mt-10">
      <div className="max-w-6xl mx-auto px-4 grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        {/* Colonne 1 — À propos */}
        <div>
          <h4 className="text-white font-heading text-xs uppercase tracking-wide mb-3">Fit &amp; Food</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/" className="hover:text-primary transition-colors">S&apos;abonner</Link></li>
            <li><Link href="/connexion" className="hover:text-primary transition-colors">Connexion</Link></li>
            <li><Link href="/inscription" className="hover:text-primary transition-colors">Inscription</Link></li>
            <li><Link href="/mon-espace" className="hover:text-primary transition-colors">Mon espace client</Link></li>
          </ul>
        </div>

        {/* Colonne 2 — Nos packs */}
        <div>
          <h4 className="text-white font-heading text-xs uppercase tracking-wide mb-3">Nos Formules</h4>
          <ul className="space-y-2 text-xs">
            <li className="text-white/50">Découverte</li>
            <li className="text-white/50">Essentiel</li>
            <li className="text-white/50">Performance</li>
            <li className="text-white/50">Prise de masse &amp; Perte de poids</li>
          </ul>
        </div>

        {/* Colonne 3 — Contact */}
        <div>
          <h4 className="text-white font-heading text-xs uppercase tracking-wide mb-3">Contact</h4>
          <ul className="space-y-2.5 text-xs">
            <li className="flex items-center gap-2">
              <IconDelivery size={14} className="shrink-0" />
              Sangalkam, Kounoune, Dakar
            </li>
            <li>
              <a href="mailto:contact@fit-and-food.onrender.com" className="hover:text-primary transition-colors">
                contact@fit-and-food.onrender.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <IconPayment size={14} className="shrink-0" />
              Paiement sécurisé Wave / Orange Money
            </li>
          </ul>
        </div>

        {/* Colonne 4 — Légal */}
        <div>
          <h4 className="text-white font-heading text-xs uppercase tracking-wide mb-3">Informations Légales</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/mentions-legales" className="hover:text-primary transition-colors">Mentions légales</Link></li>
            <li><Link href="/cgv" className="hover:text-primary transition-colors">Conditions Générales de Vente</Link></li>
            <li><Link href="/cgu" className="hover:text-primary transition-colors">Conditions Générales d&apos;Utilisation</Link></li>
            <li><Link href="/confidentialite" className="hover:text-primary transition-colors">Confidentialité &amp; Cookies</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 pt-5">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Fit and Food — Entreprise individuelle — Dakar, Sénégal</p>
          <p>RCCM : SN DKR 2026 A 14723 · NINEA : 012995702</p>
        </div>
      </div>
    </footer>
  );
}