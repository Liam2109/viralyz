"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const FEATURES: Record<string, string[]> = {
  CREATOR: [
    "20 analyses par mois",
    "Tous les formats (court, moyen, long)",
    "TikTok, Instagram et X",
    "Variantes de hook et régénération",
    "Historique complet",
  ],
  PRO: [
    "50 analyses par mois",
    "Tout le plan Creator",
    "Support prioritaire",
    "Analyses ultra-détaillées",
    "Score de similarité avancé",
  ],
};

export default function UpgradeSuccessModal({ plan }: { plan: string }) {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("upgraded") === "true") setOpen(true);
  }, [searchParams]);

  if (!open) return null;

  const normalized = plan.toUpperCase();
  const label = normalized === "PRO" ? "Pro" : "Creator";
  const features = FEATURES[normalized] ?? FEATURES.CREATOR;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
        <h2 className="text-xl font-bold text-foreground">
          🎉 Bienvenue sur le plan {label} !
        </h2>
        <p className="mt-2 text-sm text-muted">Voici ce qui est débloqué :</p>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          {features.map((f) => (
            <li key={f} className="flex gap-2">
              <span className="text-accent">✓</span>
              {f}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            const url = new URL(window.location.href);
            url.searchParams.delete("upgraded");
            window.history.replaceState({}, "", url.pathname + url.search);
          }}
          className="btn-analyze-pulse btn-animated mt-6 w-full rounded-xl gradient-premium py-3 text-sm font-semibold text-white"
        >
          Commencer à analyser
        </button>
      </div>
    </div>
  );
}
