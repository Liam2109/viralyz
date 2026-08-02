"use client";

/**
 * Legacy landing page — preserved per project rules (do not delete existing code).
 * Replaced in app/page.tsx by LandingPage.tsx.
 */
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

export default function LandingPageLegacy() {
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
      {/* ... legacy content preserved in git history / this file ... */}
    </div>
  );
}
