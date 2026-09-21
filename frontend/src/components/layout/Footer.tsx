import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-secondary text-white/70 text-sm py-8 mt-10">
      <div className="max-w-6xl mx-auto px-4 flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs">
          <Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link>
          <Link href="/cgv" className="hover:text-white">CGV</Link>
          <Link href="/cgu" className="hover:text-white">CGU</Link>
          <Link href="/confidentialite" className="hover:text-white">Confidentialité &amp; Cookies</Link>
        </div>
        <p className="text-xs text-white/50">© {new Date().getFullYear()} Fit &amp; Food — Dakar, Sénégal</p>
      </div>
    </footer>
  );
}