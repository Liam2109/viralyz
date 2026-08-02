import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <p className="text-6xl font-bold gradient-premium-text sm:text-7xl">404</p>
      <h1 className="mt-4 text-xl font-semibold sm:text-2xl">Page introuvable</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="btn-animated mt-8 w-full max-w-xs rounded-xl gradient-premium px-6 py-3 text-sm font-semibold text-white sm:w-auto"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
