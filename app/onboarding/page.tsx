"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

interface OnboardingData {
  experience: string;
  platform: string;
  videosPerWeek: number;
  averageViews: number;
  objective: string;
  niche: string;
  hoursPerWeek: number;
}

const STEPS = 8;

const STEP1_OPTIONS = [
  { label: "Je débute (< 3 mois)", value: "debutant" },
  { label: "Quelques mois (3-12 mois)", value: "intermediaire" },
  { label: "Plus d'un an", value: "confirme" },
  { label: "Plus de 3 ans", value: "avance" },
];

const STEP2_OPTIONS = [
  { label: "📱 TikTok", value: "tiktok" },
  { label: "📸 Instagram", value: "instagram" },
  { label: "▶️ YouTube", value: "youtube" },
  { label: "🌐 Plusieurs", value: "plusieurs" },
];

const STEP3_OPTIONS = [
  { label: "1 ou moins", value: 1 },
  { label: "2-3 vidéos", value: 2 },
  { label: "4-5 vidéos", value: 4 },
  { label: "6+ vidéos", value: 6 },
];

const STEP4_OPTIONS = [
  { label: "Moins de 500", value: 100 },
  { label: "500 à 5 000", value: 1000 },
  { label: "5 000 à 50 000", value: 10000 },
  { label: "Plus de 50 000", value: 100000 },
];

const STEP5_OPTIONS = [
  { label: "🔍 Trouver des idées", value: "idees" },
  { label: "📊 Comprendre le viral", value: "comprendre" },
  { label: "👁 Faire plus de vues", value: "vues" },
  { label: "💰 Vivre de la création", value: "monetisation" },
];

const STEP6_OPTIONS = [
  "Business", "Finance", "Lifestyle", "Motivation", "Tech", "Gaming",
  "Cuisine", "Sport", "Mode", "Voyage", "Santé", "Humour",
];

const STEP7_OPTIONS = [
  { label: "Moins d'1h", value: 1 },
  { label: "1 à 3h", value: 2 },
  { label: "3 à 7h", value: 5 },
  { label: "7h+", value: 10 },
];

function calculateStartScore(data: OnboardingData): number {
  let startScore = 0;
  if (data.experience === "avance") startScore += 30;
  else if (data.experience === "confirme") startScore += 20;
  else startScore += 10;
  if (data.averageViews > 10000) startScore += 25;
  else if (data.averageViews > 1000) startScore += 15;
  else startScore += 5;
  if (data.videosPerWeek >= 5) startScore += 20;
  else if (data.videosPerWeek >= 2) startScore += 10;
  else startScore += 5;
  if (data.hoursPerWeek >= 10) startScore += 15;
  else if (data.hoursPerWeek >= 5) startScore += 10;
  else startScore += 5;
  return Math.min(startScore, 100);
}

function getLevelInfo(score: number, experience: string): { title: string; message: string } {
  if (experience === "avance" || score >= 75) {
    return {
      title: "Créateur avancé",
      message: "Tu as déjà une solide base. Viralyz va t'aider à optimiser chaque détail pour maximiser ton impact viral.",
    };
  }
  if (experience === "confirme" || score >= 50) {
    return {
      title: "Créateur confirmé",
      message: "Tu es sur la bonne voie ! Avec les bonnes analyses, tu peux passer au niveau supérieur rapidement.",
    };
  }
  return {
    title: "Créateur débutant",
    message: "Chaque grand créateur a commencé ici. Viralyz va t'accompagner pas à pas vers le succès viral.",
  };
}

function OptionCard({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border p-4 text-left text-sm font-medium transition-all duration-200 ${
        selected
          ? "border-accent bg-accent/20 text-foreground shadow-lg shadow-accent/20"
          : "border-border bg-surface text-muted hover:border-accent/50 hover:bg-surface/80"
      }`}
    >
      {label}
    </button>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [slideDir, setSlideDir] = useState<"left" | "right">("right");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    experience: "",
    platform: "",
    videosPerWeek: 0,
    averageViews: 0,
    objective: "",
    niche: "",
    hoursPerWeek: 0,
  });

  useEffect(() => {
    getSupabase().auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/login?redirect=/onboarding");
        return;
      }
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.profile?.onboardingDone) {
          router.replace("/dashboard");
          return;
        }
      }
      setLoading(false);
    });
  }, [router]);

  function goNext() {
    setSlideDir("right");
    setStep((s) => Math.min(s + 1, STEPS));
  }

  function canProceed(): boolean {
    switch (step) {
      case 1: return !!data.experience;
      case 2: return !!data.platform;
      case 3: return data.videosPerWeek > 0;
      case 4: return data.averageViews > 0;
      case 5: return !!data.objective;
      case 6: return !!data.niche;
      case 7: return data.hoursPerWeek > 0;
      default: return true;
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      if (!session) {
        router.replace("/login?redirect=/onboarding");
        return;
      }
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Erreur lors de l'onboarding");
        return;
      }
      router.replace("/dashboard");
    } catch {
      alert("Impossible de contacter le serveur.");
    } finally {
      setSubmitting(false);
    }
  }

  const startScore = calculateStartScore(data);
  const levelInfo = getLevelInfo(startScore, data.experience);
  const progress = (step / STEPS) * 100;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0F]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F8F8FF]">
      <div className="fixed top-0 left-0 right-0 z-10 bg-[#0A0A0F]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-lg px-4 pt-6 pb-2">
          <div className="mb-2 flex items-center justify-between text-xs text-[#8B8B9E]">
            <Link href="/" className="flex items-center gap-2 hover:text-[#F8F8FF]">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7C3AED] text-xs font-bold text-white">V</span>
              <span className="font-semibold">Viralyz</span>
            </Link>
            <span>{step}/{STEPS}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#1E1E2E]">
            <div
              className="h-full rounded-full bg-[#7C3AED] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 pt-24 pb-8">
        <div
          key={step}
          className={`flex flex-1 flex-col animate-fade-up ${slideDir === "right" ? "" : ""}`}
        >
          {step === 1 && (
            <div className="flex flex-1 flex-col">
              <h1 className="text-2xl font-bold leading-tight">Depuis combien de temps crées-tu du contenu ?</h1>
              <p className="mt-2 text-sm text-[#8B8B9E]">On adapte Viralyz à ton niveau d&apos;expérience.</p>
              <div className="mt-8 space-y-3">
                {STEP1_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    selected={data.experience === opt.value}
                    onClick={() => setData((d) => ({ ...d, experience: opt.value }))}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-1 flex-col">
              <h1 className="text-2xl font-bold leading-tight">Sur quelle plateforme postes-tu principalement ?</h1>
              <p className="mt-2 text-sm text-[#8B8B9E]">Chaque plateforme a ses propres codes viraux.</p>
              <div className="mt-8 space-y-3">
                {STEP2_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    selected={data.platform === opt.value}
                    onClick={() => setData((d) => ({ ...d, platform: opt.value }))}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-1 flex-col">
              <h1 className="text-2xl font-bold leading-tight">Combien de vidéos publies-tu par semaine ?</h1>
              <p className="mt-2 text-sm text-[#8B8B9E]">La régularité est clé pour la croissance.</p>
              <div className="mt-8 space-y-3">
                {STEP3_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    selected={data.videosPerWeek === opt.value}
                    onClick={() => setData((d) => ({ ...d, videosPerWeek: opt.value }))}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-1 flex-col">
              <h1 className="text-2xl font-bold leading-tight">Combien de vues fais-tu en moyenne par vidéo ?</h1>
              <p className="mt-2 text-sm text-[#8B8B9E]">Pas de jugement — on veut juste calibrer ton profil.</p>
              <div className="mt-8 space-y-3">
                {STEP4_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    selected={data.averageViews === opt.value}
                    onClick={() => setData((d) => ({ ...d, averageViews: opt.value }))}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="flex flex-1 flex-col">
              <h1 className="text-2xl font-bold leading-tight">Pourquoi t&apos;inscris-tu sur Viralyz ?</h1>
              <p className="mt-2 text-sm text-[#8B8B9E]">On personnalise ton expérience selon ton objectif.</p>
              <div className="mt-8 space-y-3">
                {STEP5_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    selected={data.objective === opt.value}
                    onClick={() => setData((d) => ({ ...d, objective: opt.value }))}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="flex flex-1 flex-col">
              <h1 className="text-2xl font-bold leading-tight">Quelle est ta niche principale ?</h1>
              <p className="mt-2 text-sm text-[#8B8B9E]">Sélectionne celle qui te correspond le mieux.</p>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {STEP6_OPTIONS.map((niche) => (
                  <button
                    key={niche}
                    type="button"
                    onClick={() => setData((d) => ({ ...d, niche }))}
                    className={`rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                      data.niche === niche
                        ? "border-[#7C3AED] bg-[#7C3AED]/20 text-[#F8F8FF]"
                        : "border-[#1E1E2E] bg-[#13131A] text-[#8B8B9E] hover:border-[#7C3AED]/50"
                    }`}
                  >
                    {niche}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="flex flex-1 flex-col">
              <h1 className="text-2xl font-bold leading-tight">Combien de temps peux-tu consacrer par semaine ?</h1>
              <p className="mt-2 text-sm text-[#8B8B9E]">On adapte nos recommandations à ton rythme.</p>
              <div className="mt-8 space-y-3">
                {STEP7_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    selected={data.hoursPerWeek === opt.value}
                    onClick={() => setData((d) => ({ ...d, hoursPerWeek: opt.value }))}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="flex flex-1 flex-col items-center text-center">
              <h1 className="text-2xl font-bold">Ton profil créateur est prêt !</h1>
              <p className="mt-2 text-sm text-[#8B8B9E]">Voici ton score de départ basé sur tes réponses.</p>

              <div className="relative mt-10 flex h-48 w-48 items-center justify-center">
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#1E1E2E" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#7C3AED"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(startScore / 100) * 264} 264`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div>
                  <p className="text-5xl font-bold text-[#7C3AED]">{startScore}%</p>
                  <p className="mt-1 text-xs text-[#8B8B9E]">Score de départ</p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-[#1E1E2E] bg-[#13131A] px-6 py-5">
                <p className="text-lg font-semibold text-[#06B6D4]">{levelInfo.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#8B8B9E]">{levelInfo.message}</p>
              </div>

              <div className="mt-6 grid w-full grid-cols-2 gap-3 text-left text-sm">
                <div className="rounded-xl border border-[#1E1E2E] bg-[#13131A] p-3">
                  <p className="text-[#8B8B9E]">Plateforme</p>
                  <p className="mt-1 font-medium capitalize">{data.platform}</p>
                </div>
                <div className="rounded-xl border border-[#1E1E2E] bg-[#13131A] p-3">
                  <p className="text-[#8B8B9E]">Niche</p>
                  <p className="mt-1 font-medium">{data.niche}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          {step < STEPS ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed()}
              className="w-full rounded-xl bg-[#7C3AED] px-6 py-4 text-base font-semibold text-white transition-opacity hover:bg-[#6D28D9] disabled:opacity-40"
            >
              Suivant
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full rounded-xl bg-[#7C3AED] px-6 py-4 text-base font-semibold text-white transition-opacity hover:bg-[#6D28D9] disabled:opacity-50"
            >
              {submitting ? "Chargement..." : "Commencer mon aventure →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
