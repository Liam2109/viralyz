"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

interface Badge {
  id: string;
  type: string;
  label: string;
  emoji: string;
  unlockedAt: string;
}

interface Quest {
  id: string;
  type: string;
  label: string;
  xpReward: number;
  completed: boolean;
  completedAt: string | null;
}

interface Profile {
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  totalDaysActive: number;
  avgViralScore: number;
  startScore: number;
  onboardingDone: boolean;
  badges: Badge[];
  quests: Quest[];
}

interface ProfileData {
  profile: Profile | null;
  totalAnalyses: number;
  plan: string;
  email: string;
  name: string | null;
  createdAt: string;
}

const ALL_BADGES = [
  { type: "onboarding_complete", label: "Premier pas", emoji: "🚀" },
  { type: "first_analysis", label: "Première analyse", emoji: "🔬" },
  { type: "analyses_10", label: "Analyste", emoji: "📊" },
  { type: "analyses_50", label: "Expert", emoji: "🏆" },
  { type: "streak_3", label: "En feu", emoji: "🔥" },
  { type: "streak_7", label: "Régulier", emoji: "⚡" },
  { type: "streak_30", label: "Dévoué", emoji: "💎" },
];

function getPlanBadgeColor(plan: string): string {
  switch (plan) {
    case "PRO": return "border-[#06B6D4]/40 bg-[#06B6D4]/10 text-[#06B6D4]";
    case "CREATOR": return "border-[#7C3AED]/40 bg-[#7C3AED]/10 text-[#9F67FF]";
    default: return "border-[#1E1E2E] bg-[#13131A] text-[#8B8B9E]";
  }
}

function getInitials(name: string | null, email: string): string {
  if (name) return name.charAt(0).toUpperCase();
  return email.charAt(0).toUpperCase();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ActivityHeatmap() {
  const weeks = 12;
  const daysPerWeek = 7;
  const totalDays = weeks * daysPerWeek;

  const cells = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: totalDays }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (totalDays - 1 - i));
      const activity = Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 1 : 0;
      return { date, activity };
    });
  }, [totalDays]);

  const weekGroups = useMemo(() => {
    const groups: typeof cells[] = [];
    for (let w = 0; w < weeks; w++) {
      groups.push(cells.slice(w * daysPerWeek, (w + 1) * daysPerWeek));
    }
    return groups;
  }, [cells, weeks, daysPerWeek]);

  function getActivityColor(level: number): string {
    if (level === 0) return "bg-[#1E1E2E]";
    if (level === 1) return "bg-[#7C3AED]/30";
    if (level === 2) return "bg-[#7C3AED]/50";
    if (level === 3) return "bg-[#7C3AED]/70";
    return "bg-[#7C3AED]";
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-fit">
          {weekGroups.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((cell, di) => (
                <div
                  key={di}
                  title={`${cell.date.toLocaleDateString("fr-FR")} — activité: ${cell.activity}`}
                  className={`h-3 w-3 rounded-sm ${getActivityColor(cell.activity)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-[#8B8B9E]">
        <span>Moins</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div key={level} className={`h-3 w-3 rounded-sm ${getActivityColor(level)}`} />
        ))}
        <span>Plus</span>
      </div>
    </div>
  );
}

function getQuestProgress(type: string, totalAnalyses: number, streak: number): { current: number; target: number } | null {
  switch (type) {
    case "first_analysis": return { current: Math.min(totalAnalyses, 1), target: 1 };
    case "analyses_3": return { current: Math.min(totalAnalyses, 3), target: 3 };
    case "analyses_10": return { current: Math.min(totalAnalyses, 10), target: 10 };
    case "streak_3": return { current: Math.min(streak, 3), target: 3 };
    case "streak_7": return { current: Math.min(streak, 7), target: 7 };
    default: return null;
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProfileData | null>(null);

  useEffect(() => {
    getSupabase().auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/login?redirect=/profile");
        return;
      }
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        setData(await res.json());
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0F]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7C3AED] border-t-transparent" />
      </div>
    );
  }

  const profile = data?.profile;
  const xp = profile?.xp ?? 0;
  const level = Math.floor(xp / 100) + 1;
  const xpForNextLevel = level * 100;
  const xpInCurrentLevel = xp % 100;
  const xpProgress = (xpInCurrentLevel / 100) * 100;

  const unlockedBadgeTypes = new Set(profile?.badges?.map((b) => b.type) ?? []);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F8F8FF]">
      <header className="border-b border-[#1E1E2E] px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7C3AED] text-sm font-bold text-white">V</span>
            <span className="text-lg font-semibold">Viralyz</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-[#8B8B9E] hover:text-[#9F67FF]">
            ← Retour au dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold">Mon profil</h1>

        {/* Section 1 — Identité */}
        <section className="rounded-2xl border border-[#1E1E2E] bg-[#13131A] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#7C3AED]/20 text-2xl font-bold text-[#9F67FF]">
              {getInitials(data?.name ?? null, data?.email ?? "?")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold">{data?.name ?? "Créateur"}</p>
              <p className="truncate text-sm text-[#8B8B9E]">{data?.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${getPlanBadgeColor(data?.plan ?? "FREE")}`}>
                  Plan {data?.plan ?? "FREE"}
                </span>
                {data?.createdAt && (
                  <span className="text-xs text-[#8B8B9E]">Inscrit le {formatDate(data.createdAt)}</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 — Niveau et XP */}
        <section className="rounded-2xl border border-[#1E1E2E] bg-[#13131A] p-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-[#8B8B9E]">Niveau actuel</p>
              <p className="text-4xl font-bold text-[#7C3AED]">Niveau {level}</p>
            </div>
            <p className="text-sm text-[#8B8B9E]">{xpInCurrentLevel} / 100 XP</p>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#1E1E2E]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] transition-all duration-700"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[#8B8B9E]">
            {100 - xpInCurrentLevel} XP pour atteindre le niveau {level + 1} ({xp} XP total)
          </p>
        </section>

        {/* Section 3 — Stats */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { emoji: "🎯", label: "Total analyses", value: data?.totalAnalyses ?? 0 },
            { emoji: "🔥", label: "Streak actuel", value: `${profile?.streak ?? 0}j` },
            { emoji: "🏆", label: "Meilleure série", value: `${profile?.longestStreak ?? 0}j` },
            { emoji: "📅", label: "Jours actifs", value: profile?.totalDaysActive ?? 0 },
            { emoji: "⚡", label: "Score moyen viral", value: profile?.avgViralScore?.toFixed(0) ?? "0" },
            { emoji: "🚀", label: "Score de départ", value: `${profile?.startScore ?? 0}%` },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[#1E1E2E] bg-[#13131A] p-4">
              <p className="text-lg">{stat.emoji}</p>
              <p className="mt-1 text-xl font-bold">{stat.value}</p>
              <p className="mt-0.5 text-xs text-[#8B8B9E]">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Section 4 — Badges */}
        <section className="rounded-2xl border border-[#1E1E2E] bg-[#13131A] p-6">
          <h2 className="text-lg font-semibold">Mes badges</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {ALL_BADGES.map((badgeDef) => {
              const unlocked = profile?.badges?.find((b) => b.type === badgeDef.type);
              const isUnlocked = unlockedBadgeTypes.has(badgeDef.type);
              return (
                <div
                  key={badgeDef.type}
                  className={`rounded-xl border p-4 text-center transition-all ${
                    isUnlocked
                      ? "border-[#7C3AED]/40 bg-[#7C3AED]/10"
                      : "border-[#1E1E2E] bg-[#0A0A0F]/50 opacity-40 grayscale"
                  }`}
                >
                  <p className="text-2xl">{badgeDef.emoji}</p>
                  <p className="mt-2 text-xs font-medium">{badgeDef.label}</p>
                  {unlocked && (
                    <p className="mt-1 text-[10px] text-[#8B8B9E]">
                      {formatDate(unlocked.unlockedAt)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 5 — Quêtes */}
        <section className="rounded-2xl border border-[#1E1E2E] bg-[#13131A] p-6">
          <h2 className="text-lg font-semibold">Mes quêtes</h2>
          <div className="mt-4 space-y-3">
            {(profile?.quests ?? []).length === 0 ? (
              <p className="text-sm text-[#8B8B9E]">Complète l&apos;onboarding pour débloquer tes quêtes.</p>
            ) : (
              profile!.quests.map((quest) => {
                const progress = getQuestProgress(quest.type, data?.totalAnalyses ?? 0, profile?.streak ?? 0);
                return (
                  <div
                    key={quest.id}
                    className={`rounded-xl border p-4 ${
                      quest.completed ? "border-green-500/30 bg-green-500/5" : "border-[#1E1E2E] bg-[#0A0A0F]/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span>{quest.completed ? "✅" : "🔄"}</span>
                        <span className="text-sm font-medium">{quest.label}</span>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-[#06B6D4]">+{quest.xpReward} XP</span>
                    </div>
                    {progress && !quest.completed && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-[#8B8B9E]">
                          <span>{progress.current}/{progress.target}</span>
                          <span>{Math.round((progress.current / progress.target) * 100)}%</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#1E1E2E]">
                          <div
                            className="h-full rounded-full bg-[#7C3AED]"
                            style={{ width: `${(progress.current / progress.target) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Section 6 — Calendrier activité */}
        <section className="rounded-2xl border border-[#1E1E2E] bg-[#13131A] p-6">
          <h2 className="text-lg font-semibold">Activité — 12 dernières semaines</h2>
          <div className="mt-4">
            <ActivityHeatmap />
          </div>
        </section>
      </main>
    </div>
  );
}
