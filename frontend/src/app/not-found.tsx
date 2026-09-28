import Link from "next/link";
import NotFoundLoader from "@/components/ui/NotFoundLoader";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-white text-center min-w-0 w-full">
      <NotFoundLoader />
      <p className="text-text-muted text-sm mt-10 mb-5">
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-2.5 rounded-md"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}