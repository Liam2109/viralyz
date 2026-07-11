"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import PricingCard from "@/components/PricingCard";
import { PlatformSupportBadges } from "@/components/PlatformSupportBadges";
import { isNonYouTubeUrl } from "@/lib/platforms";

const faqItems = [
  {
    q: "Comment Viralyz analyse-t-il une vidéo ?",
    a: "Notre IA décortique la structure, le hook, la rétention et le CTA de la vidéo source pour identifier les mécanismes viraux, puis génère un script adapté à votre niche.",
  },
  {
    q: "Quelles plateformes sont supportées ?",
    a: "YouTube, TikTok, Instagram Reels et X. Pour TikTok et Instagram, le plan Creator est requis avec transcription manuelle.",
  },
  {
    q: "Puis-je personnaliser le style du script ?",
    a: "Oui. Choisissez le ton, le format, la langue et collez vos anciens scripts pour que l'IA reproduise votre style personnel.",
  },
  {
    q: "Que se passe-t-il si j'atteins ma limite mensuelle ?",
    a: "Vous pouvez upgrader vers Creator (50 crédits/mois) ou Pro (illimité) à tout moment depuis votre dashboard.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Vos analyses et scripts sont stockés de manière chiffrée. Nous ne partageons jamais vos contenus avec des tiers.",
  },
];

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const showNonYouTubeMessage = isNonYouTubeUrl(url);

  function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    const params = new URLSearchParams({ url: url.trim() });
    if (transcript.trim()) params.set("transcript", transcript.trim());
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-24 pt-16">
        <div className="hero-stars" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.15),transparent_50%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-muted">
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            Propulsé par GPT-4o
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Comprenez pourquoi une vidéo{" "}
            <span className="gradient-premium-text">
              devient virale
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            Collez l&apos;URL de votre vidéo. Viralyz analyse les mécanismes viraux et
            génère un script sur-mesure pour votre niche et votre style.
          </p>

          <form
            onSubmit={handleAnalyze}
            className="mx-auto mt-10 max-w-2xl space-y-4 text-left"
          >
            <div>
              <label className="text-sm font-medium">URL de votre vidéo</label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="flex-1 rounded-xl border border-border bg-surface px-4 py-3.5 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-accent-light"
                />
                <button
                  type="submit"
                  className="btn-analyze-hero rounded-xl px-8 py-3.5 text-sm font-semibold text-white"
                >
                  Analyze
                </button>
              </div>
              <div className="mt-3">
                <PlatformSupportBadges />
              </div>
            </div>

            {showNonYouTubeMessage && (
              <>
                <div className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-foreground">
                  TikTok, Instagram et X arrivent bientôt. En attendant, collez votre transcription ci-dessous.
                </div>
                <div>
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Collez votre transcription ici..."
                    rows={4}
                    className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-accent-light"
                  />
                </div>
              </>
            )}
          </form>

          <p className="mt-4 text-xs text-muted">
            2 crédits gratuits par mois — sans carte bancaire
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold">Comment ça marche</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted">
            Trois étapes pour transformer une vidéo virale en contenu à votre image.
          </p>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Collez l'URL",
                desc: "Entrez le lien d'une vidéo qui performe dans votre niche — YouTube, TikTok, Instagram ou X.",
              },
              {
                step: "02",
                title: "Analyse IA",
                desc: "Notre IA décortique le hook, la rétention, les tags viraux et le score global.",
              },
              {
                step: "03",
                title: "Script personnalisé",
                desc: "Recevez un script adapté à votre plateforme, ton et style personnel.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="pricing-card rounded-2xl border border-border bg-surface p-8"
              >
                <span className="text-sm font-mono text-accent">{item.step}</span>
                <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo */}
      <section id="demo" className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold">Exemple de résultat</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted">
            Voici ce que Viralyz génère pour une vidéo de productivité à 2M de vues.
          </p>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="pricing-card rounded-2xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Score viral</span>
                <span className="text-3xl font-bold gradient-premium-text">87/100</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-border">
                <div className="progress-bar-animated h-full w-[87%] rounded-full gradient-premium" />
              </div>
              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-secondary">Analyse</h4>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    Hook basé sur une promesse chiffrée (« 10 min/jour ») qui crée
                    une curiosité immédiate. Structure en 3 actes avec preuve
                    sociale à mi-parcours. CTA soft qui invite au commentaire sans
                    friction.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-secondary">
                    Tags viraux
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["#productivité", "#habitudes", "#mindset", "#routine", "#focus"].map(
                      (tag) => (
                        <span
                          key={tag}
                          className="tag-viral rounded-full border border-border px-3 py-1 text-xs text-muted"
                        >
                          {tag}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="pricing-card rounded-2xl border border-border bg-surface p-6">
              <h4 className="text-sm font-medium text-secondary">
                Script généré
              </h4>
              <pre className="mt-3 whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted">
{`[Hook — 0:00]
"Tu perds 2h par jour sans le savoir.
Voici la règle des 10 minutes."

[Acte 1 — 0:05]
"Avant, je scrollais 3h le matin.
Puis j'ai testé UNE seule habitude..."

[Acte 2 — 0:25]
"Résultat après 30 jours :
→ +40% de focus
→ Moins de procrastination
→ Plus d'énergie le soir"

[CTA — 0:45]
"Commente '10MIN' si tu veux
ma checklist complète 👇"`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold">Pricing</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted">
            Commencez gratuitement, scalez quand vous êtes prêt. 1 analyse = 1 crédit.
          </p>
          <div className="mt-12 grid items-center gap-6 md:grid-cols-3">
            <PricingCard
              name="Free"
              price="0€"
              description="Pour découvrir Viralyz"
              discrete
              features={[
                "2 crédits par mois",
                "YouTube uniquement",
                "Format court 30-60s uniquement",
                "Score viral complet",
                "Script basique",
              ]}
              cta="Commencer gratuitement"
              href="/signup"
            />
            <PricingCard
              name="Creator"
              price="19,99€"
              description="Pour les créateurs actifs"
              features={[
                "50 crédits par mois",
                "YouTube + TikTok/Instagram/X",
                "Tous les formats (court, moyen, long)",
                "Analyse ultra-détaillée",
                "Variantes de hook",
                "Régénération (1 crédit)",
                "Score de similarité",
                "Prévisualisation mobile",
                "Historique complet",
                "Support email",
              ]}
              highlighted
              cta="Choisir Creator"
              href="/signup?plan=creator"
            />
            <PricingCard
              name="Pro"
              price="39,99€"
              description="Pour les équipes & agences"
              features={[
                "Crédits illimités",
                "Tout le plan Creator",
                "Support prioritaire",
                "Accès API",
              ]}
              cta="Choisir Pro"
              href="/signup?plan=pro"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold">FAQ</h2>
          <div className="mt-12 space-y-3">
            {faqItems.map((item, i) => (
              <div
                key={item.q}
                className="pricing-card rounded-xl border border-border bg-surface overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="btn-animated flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium"
                >
                  {item.q}
                  <span className="text-accent">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <p className="border-t border-border px-6 py-4 text-sm leading-relaxed text-muted">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md gradient-premium text-xs font-bold text-white">
              V
            </span>
            <span className="font-semibold">Viralyz</span>
          </div>
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} Viralyz. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-sm text-muted">
            <a href="#" className="hover:text-accent-light">
              Mentions légales
            </a>
            <a href="#" className="hover:text-accent-light">
              Confidentialité
            </a>
            <a href="mailto:hello@viralyz.app" className="hover:text-accent-light">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
