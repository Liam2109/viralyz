import Link from "next/link";

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold">Politique de confidentialité</h1>
        <p className="mt-3 text-sm text-muted">Conforme au RGPD — dernière mise à jour : 2025</p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
          <section>
            <h2 className="text-lg font-semibold text-foreground">Données collectées</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Adresse e-mail (création de compte)</li>
              <li>Historique d&apos;analyses et scripts générés</li>
              <li>Plan d&apos;abonnement et consommation de crédits</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">Durée de conservation</h2>
            <p className="mt-2">
              Vos données sont conservées pendant 3 ans à compter de votre dernière activité, sauf
              obligation légale contraire.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">Vos droits</h2>
            <p className="mt-2">
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, de
              suppression et de portabilité de vos données. Pour exercer ces droits, contactez notre
              DPO :
            </p>
            <p className="mt-2">
              <a href="mailto:hello@viralyz.io" className="text-accent-light hover:underline">
                hello@viralyz.io
              </a>
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">Sécurité</h2>
            <p className="mt-2">
              Les données sont hébergées sur une infrastructure sécurisée (Supabase) avec chiffrement
              en transit et au repos.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
