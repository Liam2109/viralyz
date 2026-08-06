"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

type Plan = "FREE" | "CREATOR" | "PRO";

interface QuotaInfo {
  plan: string;
  used: number;
  limit: number | null;
  remaining: number | null;
}

const COMPARISON_ROWS: {
  feature: string;
  free: string | boolean;
  creator: string | boolean;
  pro: string | boolean;
}[] = [
  { feature: "Crédits par mois", free: "2", creator: "20", pro: "50" },
  { feature: "Score viral", free: true, creator: true, pro: true },
  { feature: "Analyse basique", free: true, creator: true, pro: true },
  { feature: "Hook + Rétention + CTA", free: false, creator: true, pro: true },
  { feature: "Script généré", free: true, creator: true, pro: true },
  { feature: "Hooks alternatifs", free: "—", creator: "5", pro: "10" },
  { feature: "Miniature + métriques YouTube", free: false, creator: true, pro: true },
  { feature: "Rapport markdown complet", free: false, creator: true, pro: true },
  { feature: "Plan de tournage", free: false, creator: false, pro: true },
  { feature: "Checklist production", free: false, creator: false, pro: true },
  { feature: "Prompt IA avancé", free: false, creator: false, pro: true },
  { feature: "Régénération de script", free: true, creator: true, pro: true },
  { feature: "Historique des analyses", free: true, creator: true, pro: true },
  { feature: "TikTok / Instagram", free: "Bientôt", creator: "Bientôt", pro: "Bientôt" },
  { feature: "Support", free: "—", creator: "Email", pro: "Prioritaire" },
];

const FAQ_ITEMS = [
  {
    q: "Comment fonctionnent les crédits ?",
    a: "1 analyse = 1 crédit. Vos crédits sont remis à zéro le 1er de chaque mois selon votre plan.",
  },
  {
    q: "Puis-je changer de plan ?",
    a: "Oui, à tout moment. Vous pouvez upgrader ou downgrader depuis cette page.",
  },
  {
    q: "TikTok et Instagram sont-ils supportés ?",
    a: "Pas encore — l'analyse YouTube est disponible dès maintenant. TikTok et Instagram arrivent bientôt.",
  },
  {
    q: "Puis-je annuler à tout moment ?",
    a: "Oui, sans engagement. Vous conservez l'accès jusqu'à la fin de la période en cours.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Oui. Vos données sont stockées sur Supabase avec chiffrement et ne sont jamais revendues.",
  },
] as const;

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return <CheckIcon className="mx-auto h-5 w-5 text-green-500" />;
  }
  if (value === false) {
    return <span className="text-muted">—</span>;
  }
  return <span className="text-sm text-muted">{value}</span>;
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-muted">
      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
      {children}
    </li>
  );
}

function CurrentPlanButton() {
  return (
    <button
      type="button"
      disabled
      className="mt-8 w-full cursor-not-allowed rounded-lg border border-border bg-background py-2.5 text-sm font-medium text-muted"
    >
      Plan actuel
    </button>
  );
}

export default function PricingClient() {
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutPlan, setCheckoutPlan] = useState<"creator" | "pro" | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isFirstSub, setIsFirstSub] = useState(false);

  const fetchPlan = useCallback(async () => {
    const {
      data: { session },
    } = await getSupabase().auth.getSession();

    if (!session) {
      window.location.href = "/login?redirect=/dashboard/pricing";
      return;
    }

    const res = await fetch("/api/analyze", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (!res.ok) {
      setError("Impossible de récupérer votre plan.");
      setLoading(false);
      return;
    }

    const text = await res.text();
    if (!text) {
      setError("Réponse serveur vide.");
      setLoading(false);
      return;
    }

    const data = JSON.parse(text) as { quota?: QuotaInfo };
    const plan = (data.quota?.plan?.toUpperCase() ?? "FREE") as Plan;
    setCurrentPlan(plan);
setIsFirstSub(plan === "FREE");
setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  async function handleCheckout(plan: "creator" | "pro") {
    setError("");
    setCheckoutPlan(plan);
    try {
      const {
        data: { session },
      } = await getSupabase().auth.getSession();

      if (!session) {
        window.location.href = "/login?redirect=/dashboard/pricing";
        return;
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Erreur lors de la redirection vers le paiement.");
      }
    } catch {
      setError("Impossible de contacter le serveur de paiement.");
    } finally {
      setCheckoutPlan(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted">
        Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg gradient-premium text-sm font-bold text-white">
              V
            </span>
            <span className="text-lg font-semibold">Viralyz</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-muted transition-colors hover:text-accent-light"
          >
            ← Retour au dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">Choisissez votre plan</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Analysez les vidéos virales et créez des scripts qui convertissent
          </p>
        </div>

        {error && (
          <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
          {/* FREE */}
          <div className="pricing-card flex flex-col rounded-2xl border border-border bg-surface p-6">
            <h3 className="text-lg font-semibold">Free</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold">0€</span>
            </div>
            <p className="mt-1 text-sm text-muted">2 crédits/mois</p>
            <ul className="mt-6 flex flex-1 flex-col gap-3">
              <FeatureItem>Score viral</FeatureItem>
              <FeatureItem>Analyse basique</FeatureItem>
              <FeatureItem>1 script</FeatureItem>
            </ul>
            {currentPlan === "FREE" ? (
              <CurrentPlanButton />
            ) : (
              <div className="mt-8 h-[42px]" />
            )}
          </div>

          {/* CREATOR */}
          <div className="pricing-card relative flex flex-col rounded-2xl border-2 border-violet-500 bg-surface p-6 lg:z-10 lg:scale-[1.02]">
            <span className="badge-populaire absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-accent bg-accent px-4 py-1 text-xs font-semibold text-white">
              ⭐ Populaire
            </span>
            <h3 className="text-lg font-semibold">Creator</h3>
            <div className="mt-4 flex items-baseline gap-1">
  <span className="text-4xl font-bold">
    {isFirstSub ? "4.99€" : "14.99€"}
  </span>
  <span className="text-sm text-muted">/mois</span>
</div>
{isFirstSub && (
  <p className="mt-1 text-xs font-medium text-violet-400">
    🎉 Premier mois à 4.99€, puis 14.99€/mois
  </p>
)}
<p className="mt-1 text-sm text-muted">20 crédits/mois</p>
            <ul className="mt-6 flex flex-1 flex-col gap-3">
              <FeatureItem>20 analyses</FeatureItem>
              <FeatureItem>Hook + Rétention + CTA</FeatureItem>
              <FeatureItem>5 hooks alternatifs</FeatureItem>
              <FeatureItem>Miniature + métriques</FeatureItem>
              <FeatureItem>Rapport markdown</FeatureItem>
              <FeatureItem>Support email</FeatureItem>
            </ul>
            {currentPlan === "CREATOR" ? (
              <CurrentPlanButton />
            ) : (
              <button
                type="button"
                onClick={() => handleCheckout("creator")}
                disabled={checkoutPlan !== null}
                className="btn-animated mt-8 w-full rounded-lg gradient-premium py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {checkoutPlan === "creator" ? "Redirection..." : "Choisir Creator"}
              </button>
            )}
          </div>

          {/* PRO */}
          <div className="pricing-card relative flex flex-col rounded-2xl border border-border bg-surface p-6">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-secondary/40 bg-secondary/10 px-4 py-1 text-xs font-semibold text-secondary">
              🚀 Pro
            </span>
            <h3 className="text-lg font-semibold">Pro</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold">34.99€</span>
              <span className="text-sm text-muted">/mois</span>
            </div>
            <p className="mt-1 text-sm text-muted">50 crédits/mois</p>
            <ul className="mt-6 flex flex-1 flex-col gap-3">
              <FeatureItem>Tout Creator</FeatureItem>
              <FeatureItem>50 analyses</FeatureItem>
              <FeatureItem>10 hooks alternatifs</FeatureItem>
              <FeatureItem>Plan de tournage</FeatureItem>
              <FeatureItem>Checklist</FeatureItem>
              <FeatureItem>Prompt IA</FeatureItem>
              <FeatureItem>Support prioritaire</FeatureItem>
            </ul>
            {currentPlan === "PRO" ? (
              <CurrentPlanButton />
            ) : (
              <button
                type="button"
                onClick={() => handleCheckout("pro")}
                disabled={checkoutPlan !== null}
                className="btn-animated mt-8 w-full rounded-lg border border-secondary/40 bg-secondary/10 py-2.5 text-sm font-semibold text-secondary transition-colors hover:bg-secondary/20 disabled:opacity-50"
              >
                {checkoutPlan === "pro" ? "Redirection..." : "Choisir Pro"}
              </button>
            )}
          </div>
        </div>

        {/* Comparison table */}
        <section className="mt-20">
          <h2 className="text-center text-2xl font-bold">Comparatif complet</h2>
          <p className="mt-2 text-center text-sm text-muted">Toutes les fonctionnalités en un coup d&apos;œil</p>

          <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-4 font-semibold sm:px-6">Fonctionnalité</th>
                  <th className="px-4 py-4 text-center font-semibold sm:px-6">Free</th>
                  <th className="px-4 py-4 text-center font-semibold text-accent-light sm:px-6">Creator</th>
                  <th className="px-4 py-4 text-center font-semibold text-secondary sm:px-6">Pro</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={i % 2 === 0 ? "bg-background/30" : ""}
                  >
                    <td className="px-4 py-3 font-medium sm:px-6">{row.feature}</td>
                    <td className="px-4 py-3 text-center sm:px-6">
                      <CellValue value={row.free} />
                    </td>
                    <td className="px-4 py-3 text-center sm:px-6">
                      <CellValue value={row.creator} />
                    </td>
                    <td className="px-4 py-3 text-center sm:px-6">
                      <CellValue value={row.pro} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-center text-2xl font-bold">Questions fréquentes</h2>
          <div className="mt-8 space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={item.q}
                className="pricing-card overflow-hidden rounded-xl border border-border bg-surface"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="btn-animated flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium"
                >
                  {item.q}
                  <span className="ml-4 shrink-0 text-accent">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <p className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
