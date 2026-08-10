"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const faqItems = [
  {
    q: "Comment Viralyz analyse-t-il une vidéo ?",
    a: "YouTube Data API + GPT-4o analysent le titre, les métriques réelles et la structure du contenu (hook, rétention, CTA) pour identifier les mécanismes viraux.",
  },
  {
    q: "Quelles plateformes sont supportées ?",
    a: "YouTube, TikTok et Instagram sont supportés. Collez simplement l'URL de votre vidéo.",
  },
  {
    q: "Puis-je personnaliser le script ?",
    a: "Oui. Utilisez le champ style personnel dans le dashboard pour que l'IA reproduise votre ton et votre structure habituelle.",
  },
  {
    q: "Comment fonctionnent les crédits ?",
    a: "1 analyse = 1 crédit. Vos crédits sont remis à zéro le 1er de chaque mois selon votre plan.",
  },
  {
    q: "Mes données sont sécurisées ?",
    a: "Oui. Vos données sont hébergées sur Supabase avec chiffrement en transit et au repos.",
  },
  {
    q: "Puis-je annuler à tout moment ?",
    a: "Oui, sans engagement. Vous pouvez annuler votre abonnement depuis votre espace de facturation.",
  },
];

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function handleHeroAnalyze(e: React.FormEvent) {
    e.preventDefault();
    router.push("/signup");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-premium text-sm font-bold text-white">
              V
            </span>
            <span className="text-lg font-semibold tracking-tight">Viralyz</span>
          </Link>
          <ul className="hidden items-center gap-8 md:flex">
            <li>
              <a href="#how-it-works" className="text-sm text-muted hover:text-foreground">
                Comment ça marche
              </a>
            </li>
            <li>
              <a href="#pricing" className="text-sm text-muted hover:text-foreground">
                Pricing
              </a>
            </li>
            <li>
              <a href="#faq" className="text-sm text-muted hover:text-foreground">
                FAQ
              </a>
            </li>
          </ul>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-foreground"
            >
              Se connecter
            </Link>
            <Link
              href="/signup"
              className="btn-animated rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white sm:px-4"
            >
              Commencer gratuitement
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32">
        <div className="hero-stars" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.15),transparent_50%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="badge-populaire mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-muted">
            ✨ Propulsé par GPT-4o
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-6xl">
            Décryptez pourquoi une vidéo devient virale.{" "}
            <span className="gradient-premium-text">Créez le script qui reproduit le résultat.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted sm:text-lg">
            Collez l&apos;URL d&apos;une vidéo YouTube, TikTok ou Instagram. Viralyz analyse les mécanismes viraux et génère votre script en 30 secondes.
          </p>
          <form onSubmit={handleHeroAnalyze} className="mx-auto mt-10 max-w-2xl">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 rounded-xl border border-border bg-surface px-4 py-3.5 text-sm outline-none transition-colors focus:border-accent-light"
              />
              <button
                type="submit"
                className="btn-analyze-hero w-full rounded-xl px-8 py-3.5 text-sm font-semibold text-white sm:w-auto"
              >
                Analyser gratuitement
              </button>
            </div>
          </form>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
  <span className="rounded-full border border-border bg-surface px-3 py-1">YouTube ✅</span>
  <span className="rounded-full border border-border bg-surface px-3 py-1">TikTok ✅</span>
  <span className="rounded-full border border-border bg-surface px-3 py-1">Instagram ✅</span>
</div>
          <p className="mt-4 text-xs text-muted">2 analyses gratuites — sans carte bancaire</p>
          <div className="mt-10 grid gap-4 text-sm text-muted sm:grid-cols-3 sm:gap-6">
            <div>
              <p className="text-lg font-bold text-foreground">12 400+</p>
              <p>scripts générés</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">87%</p>
              <p>score viral moyen</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">4 200+</p>
              <p>créateurs</p>
            </div>
          </div>
        </div>
      </section>

      <section id="demo" className="border-t border-border px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Voici ce que Viralyz génère en 30 secondes
          </h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="pricing-card rounded-2xl border border-border bg-surface p-4 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="h-28 w-full shrink-0 rounded-lg gradient-premium sm:h-24 sm:w-40" aria-hidden />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">Comment j&apos;ai fait 1M de vues en 30 jours</h3>
                  <p className="mt-2 text-3xl font-bold text-[#22c55e]">87/100</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Pattern interrupt", "Hook émotionnel", "Preuve sociale"].map((tag) => (
                      <span key={tag} className="tag-viral rounded-full border border-border px-3 py-1 text-xs text-muted">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-6 text-sm leading-relaxed text-muted">
                Cette vidéo explose grâce à un hook de 2 secondes qui déclenche immédiatement la
                curiosité. La promesse chiffrée (« 1M en 30 jours ») crée un gap de connaissance
                impossible à ignorer.
              </p>
            </div>
            <div className="pricing-card rounded-2xl border border-border bg-surface p-4 sm:p-6">
              <h4 className="text-sm font-medium text-secondary">Extrait de script</h4>
              <pre className="mt-3 whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted">
{`[Hook]
"1 million de vues en 30 jours — sans budget pub.
Voici la règle que personne ne vous dit."

[Acte 1]
"Semaine 1 : j'ai copié les 3 premières secondes
des vidéos à 10x ma taille d'audience..."`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-border px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Comment ça marche</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3 md:gap-8">
            {[
              {
                icon: "🔗",
                title: "Collez l'URL",
                desc: "Une vidéo YouTube virale dans votre niche",
              },
              {
                icon: "🤖",
                title: "L'IA analyse tout",
                desc: "Hook, rétention, CTA, techniques virales, métriques réelles",
              },
              {
                icon: "✍️",
                title: "Recevez votre script",
                desc: "Adapté à votre style, prêt à filmer immédiatement",
              },
            ].map((step, i) => (
              <div key={step.title} className="pricing-card rounded-2xl border border-border bg-surface p-6 sm:p-8">
                <span className="text-2xl">{step.icon}</span>
                <p className="mt-3 text-sm font-mono text-accent">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-t border-border px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Pricing</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted sm:text-base">
            1 analyse = 1 crédit. Commencez gratuitement.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="pricing-card pricing-card-discrete rounded-2xl border border-border bg-surface p-6">
              <h3 className="text-lg font-semibold">Free</h3>
              <p className="mt-2 text-3xl font-bold">0€</p>
              <p className="mt-1 text-sm text-muted">2 crédits / mois</p>
              <ul className="mt-6 space-y-2 text-sm text-muted">
                <li>• YouTube</li>
                <li>• Format court</li>
                <li>• Score viral complet</li>
              </ul>
              <Link
                href="/signup"
                className="btn-animated mt-8 block w-full rounded-xl border border-border py-3 text-center text-sm font-semibold hover:border-accent-light"
              >
                Commencer
              </Link>
            </div>
            <div className="pricing-card pricing-card-highlighted relative rounded-2xl border-2 border-accent bg-surface p-6">
              <span className="badge-populaire absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
                ⭐ Populaire
              </span>
              <h3 className="text-lg font-semibold">Creator</h3>
              <p className="mt-2 text-3xl font-bold">9.99€</p>
              <p className="mt-1 text-sm text-muted">20 crédits / mois</p>
              <ul className="mt-6 space-y-2 text-sm text-muted">
                <li>• Toutes plateformes</li>
                <li>• Tous formats</li>
                <li>• Hooks alternatifs</li>
                <li>• Régénération</li>
              </ul>
              <Link
                href="/signup?plan=creator"
                className="btn-animated mt-8 block w-full rounded-xl gradient-premium py-3 text-center text-sm font-semibold text-white"
              >
                Choisir Creator
              </Link>
            </div>
            <div className="pricing-card rounded-2xl border border-border bg-surface p-6">
              <h3 className="text-lg font-semibold">Pro</h3>
              <p className="mt-2 text-3xl font-bold">24.99€</p>
              <p className="mt-1 text-sm text-muted">infini crédits / mois</p>
              <ul className="mt-6 space-y-2 text-sm text-muted">
                <li>• Tout Creator</li>
                <li>• Support prioritaire</li>
                <li>• Analyses avancées</li>
              </ul>
              <Link
                href="/signup?plan=pro"
                className="btn-animated mt-8 block w-full rounded-xl border border-accent/50 bg-accent/10 py-3 text-center text-sm font-semibold text-accent-light"
              >
                Choisir Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-border px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">FAQ</h2>
          <div className="mt-10 space-y-3">
            {faqItems.map((item, i) => (
              <div key={item.q} className="pricing-card overflow-hidden rounded-xl border border-border bg-surface">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="btn-animated flex w-full items-center justify-between px-4 py-4 text-left text-sm font-medium sm:px-6"
                >
                  {item.q}
                  <span className="text-accent">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <p className="border-t border-border px-4 py-4 text-sm leading-relaxed text-muted sm:px-6">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-4 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <span className="flex h-7 w-7 items-center justify-center rounded-md gradient-premium text-xs font-bold text-white">
                V
              </span>
              <span className="font-semibold">Viralyz</span>
            </div>
            <p className="mt-2 text-sm text-muted">Décryptez le viral. Créez l&apos;irrésistible.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted md:gap-6">
            <Link href="/legal" className="hover:text-accent-light">
              Mentions légales
            </Link>
            <Link href="/privacy" className="hover:text-accent-light">
              Confidentialité
            </Link>
            <a href="mailto:hello@viralyz.io" className="hover:text-accent-light">
              Contact
            </a>
          </div>
          <p className="text-sm text-muted">© 2025 Viralyz</p>
        </div>
      </footer>
    </div>
  );
}
