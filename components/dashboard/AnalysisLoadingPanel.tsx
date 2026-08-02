"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "🔍 Récupération des données YouTube...",
  "🪝 Analyse du hook...",
  "📊 Détection des techniques virales...",
  "🎯 Calcul du score viral...",
  "✍️ Génération du script...",
  "✨ Finalisation de l'analyse...",
] as const;

const DURATION_MS = 45_000;

export default function AnalysisLoadingPanel() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(msgInterval);
  }, []);

  useEffect(() => {
    const start = performance.now();
    let frame: number;
    function tick(now: number) {
      const elapsed = now - start;
      const pct = Math.min(95, (elapsed / DURATION_MS) * 95);
      setProgress(pct);
      if (pct < 95) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-surface p-8 sm:p-12">
      <div className="flex flex-col items-center text-center">
        <div
          className="h-14 w-14 animate-spin rounded-full border-4 border-border border-t-accent"
          role="status"
          aria-label="Analyse en cours"
        />
        <p className="mt-6 min-h-[1.5rem] text-sm font-medium text-foreground sm:text-base">
          {MESSAGES[messageIndex]}
        </p>
        <div className="mt-8 w-full max-w-md">
          <div className="flex justify-between text-xs text-muted">
            <span>Progression</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full gradient-premium transition-[width] duration-300 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
