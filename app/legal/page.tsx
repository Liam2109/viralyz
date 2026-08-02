import Link from "next/link";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-premium text-sm font-bold text-white">
              V
            </span>
            <span className="text-lg font-semibold">Viralyz</span>
          </Link>
          <Link href="/" className="text-sm text-muted hover:text-accent-light">
            ← Accueil
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl font-bold">Mentions légales</h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
          <section>
            <h2 className="text-lg font-semibold text-foreground">Éditeur du site</h2>
            <p className="mt-2">
              Viralyz
              <br />
              Contact :{" "}
              <a href="mailto:hello@viralyz.io" className="text-accent-light hover:underline">
                hello@viralyz.io
              </a>
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">Hébergement</h2>
            <p className="mt-2">
              Vercel Inc.
              <br />
              440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">Propriété intellectuelle</h2>
            <p className="mt-2">
              L&apos;ensemble du contenu du site Viralyz (textes, graphismes, logo) est protégé par le
              droit d&apos;auteur. Toute reproduction non autorisée est interdite.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
