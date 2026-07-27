"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { getSupabase } from "@/lib/supabase";
import { PlatformIconSingle } from "@/components/PlatformIcons";
import { detectPlatformFromUrl, isNonYouTubeUrl } from "@/lib/platforms";

const TONES = ["Authentique", "Inspirant", "Éducatif", "Humoristique", "Autoritaire", "Intime"] as const;
const FORMATS = ["Storytelling", "Liste", "Révélation", "Défi", "Tutoriel", "Avant/Après"] as const;
const OUTPUT_FORMATS = [
  { value: "Court", label: "Court (30-60s)", desc: "TikTok, Reels, Shorts" },
  { value: "Moyen", label: "Moyen (2-3 min)", desc: "YouTube standard" },
  { value: "Long", label: "Long (5-10 min)", desc: "YouTube approfondi" },
] as const;
const LANGUAGES = ["FR Casual", "FR Pro", "EN Casual", "EN Pro"] as const;

const LOADING_MESSAGES = [
  "🔍 Récupération des données YouTube...",
  "🪝 Analyse du hook...",
  "📊 Détection des techniques virales...",
  "🎯 Calcul du score viral...",
  "✍️ Génération du script...",
  "✨ Finalisation...",
] as const;

const SCRIPT_SECTION_COLORS = [
  "border-accent/40 bg-accent/10",
  "border-secondary/40 bg-secondary/10",
  "border-green-500/40 bg-green-500/10",
  "border-orange-500/40 bg-orange-500/10",
  "border-pink-500/40 bg-pink-500/10",
  "border-cyan-500/40 bg-cyan-500/10",
];

interface AnalysisDetails {
  hookExplanation?: string;
  retentionExplanation?: string;
  ctaExplanation?: string;
  weakPoints?: string[];
  opportunities?: string[];
  narrativeStructure?: { hook: string; development: string; climax: string; cta: string };
  emotions?: string[];
  algorithmTechniques?: string[];
  alternativeHooks?: string[];
  keyLearnings?: string[];
  fullReport?: string;
  detectedLanguage?: string;
  detectedNiche?: string;
  detectedTone?: string;
  detectedFormat?: string;
  thumbnail?: string;
  views?: number;
  likes?: number;
  comments?: number;
  duration?: string;
  channel?: string;
}

interface AnalysisResult {
  id: string;
  viralScore: number;
  whyViral: string;
  improvements: string;
  viralTags: string[];
  hookStrength: number;
  retentionScore: number;
  ctaScore: number;
  script: string;
  videoTitle?: string | null;
  similarityScore?: number | null;
  outputFormat?: string;
  createdAt: string;
  details?: AnalysisDetails;
}

interface QuotaInfo {
  plan: string;
  used: number;
  limit: number | null;
  remaining: number | null;
}

function parseAnalysisDetails(improvements: string): AnalysisDetails | null {
  try {
    const parsed = JSON.parse(improvements);
    if (typeof parsed === "object" && parsed !== null) return parsed;
  } catch {
    /* legacy plain text */
  }
  return null;
}

function enrichResult(item: AnalysisResult): AnalysisResult {
  return { ...item, details: parseAnalysisDetails(item.improvements) ?? undefined };
}

function getScoreBarColor(score: number): string {
  if (score < 40) return "bg-red-500";
  if (score <= 70) return "bg-orange-500";
  return "bg-green-500";
}

function getScoreHexColor(score: number): string {
  if (score > 70) return "#22c55e";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

function getCreditsBarColor(pct: number): string {
  if (pct > 50) return "bg-green-500";
  if (pct >= 20) return "bg-orange-500";
  return "bg-red-500";
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toLocaleString("fr-FR");
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function parseScriptSections(script: string): { title: string; content: string }[] {
  const regex = /(\[[^\]]+\])/g;
  const parts = script.split(regex).filter(Boolean);
  const sections: { title: string; content: string }[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].startsWith("[")) {
      sections.push({ title: parts[i], content: (parts[i + 1] ?? "").trim() });
      i++;
    }
  }
  if (sections.length === 0) return [{ title: "Script complet", content: script }];
  return sections;
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="toast-notification fixed bottom-6 right-6 z-50 rounded-xl border border-accent/40 bg-surface px-4 py-3 text-sm font-medium text-foreground shadow-lg shadow-accent/20">
      {message}
    </div>
  );
}

function LoadingAnimation() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const start = performance.now();
    const duration = 45000;
    let frame: number;
    function tick(now: number) {
      const elapsed = now - start;
      setProgress(Math.min(95, (elapsed / duration) * 95));
      if (elapsed < duration) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-surface p-10 text-center">
      <div className="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-4 border-border border-t-accent" />
      <p className="text-base font-medium transition-opacity duration-300">{LOADING_MESSAGES[msgIndex]}</p>
      <div className="mx-auto mt-8 h-2 max-w-md overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-secondary transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted">{Math.round(progress)}%</p>
    </div>
  );
}

function AnimatedScore({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    function animate(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setDisplay(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return <>{display}</>;
}

function ViralScoreCircle({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (score / 100) * circumference;
  const color = getScoreHexColor(score);
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setOffset(targetOffset));
    return () => cancelAnimationFrame(frame);
  }, [targetOffset]);

  return (
    <div className="relative mx-auto h-36 w-36">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#1E1E2E" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          className="score-circle-progress"
          style={{ strokeDashoffset: offset }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color }}>
          <AnimatedScore value={score} />
        </span>
        <span className="text-sm text-muted">/100</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, score, explanation }: { label: string; score: number; explanation?: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">{label}</span>
        <span className="font-bold" style={{ color: getScoreHexColor(score) }}>
          {score}/100
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
        <div
          className={`progress-bar-animated h-full rounded-full ${getScoreBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      {explanation && <p className="mt-2 text-xs leading-relaxed text-muted">{explanation}</p>}
    </div>
  );
}

function CreditsSection({ quota }: { quota: QuotaInfo }) {
  const plan = quota.plan.toUpperCase();
  const remaining = quota.remaining ?? 0;
  const pct = quota.limit && quota.limit > 0 ? (remaining / quota.limit) * 100 : 100;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-surface p-5">
        {quota.limit === null ? (
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Crédits illimités — Plan <span className="text-accent-light">{plan}</span>
            </p>
            <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-light">
              Plan Pro ✨
            </span>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium">
              {remaining} crédit{remaining !== 1 ? "s" : ""} restant{remaining !== 1 ? "s" : ""} — Plan{" "}
              <span className="text-accent-light">{plan}</span>
            </p>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-border">
              <div
                className={`progress-bar-animated h-full rounded-full transition-all duration-500 ${getCreditsBarColor(pct)}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {remaining === 0 && (
              <p className="mt-3 text-xs text-red-400">Vous avez utilisé tous vos crédits ce mois.</p>
            )}
          </>
        )}
      </div>

      {plan === "FREE" && (
        <div className="flex flex-col gap-3 rounded-2xl border border-accent/30 bg-accent/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">Passez au Creator — 20 analyses/mois — 14.99€</p>
          <Link
            href="/dashboard/pricing"
            className="btn-animated w-full rounded-lg gradient-premium px-5 py-2.5 text-center text-sm font-semibold text-white sm:w-auto"
          >
            Upgrader
          </Link>
        </div>
      )}

      {plan === "CREATOR" && (
        <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-surface/60 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">Passez au Pro — 50 analyses — 34.99€</p>
          <Link
            href="/dashboard/pricing"
            className="btn-animated w-full rounded-lg border border-accent/40 bg-accent/10 px-5 py-2 text-center text-sm font-medium text-accent-light transition-colors hover:bg-accent/20 sm:w-auto"
          >
            Upgrader Pro
          </Link>
        </div>
      )}

      {plan === "PRO" && quota.limit !== null && (
        <div className="flex justify-end">
          <span className="rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent-light">
            Plan Pro ✨
          </span>
        </div>
      )}
    </div>
  );
}

function VideoCard({
  thumbnail,
  title,
  channel,
  duration,
  views,
  likes,
  comments,
  detectedLanguage,
  detectedNiche,
  detectedTone,
}: {
  thumbnail: string;
  title?: string | null;
  channel?: string;
  duration?: string;
  views?: number;
  likes?: number;
  comments?: number;
  detectedLanguage?: string;
  detectedNiche?: string;
  detectedTone?: string;
}) {
  return (
    <div className="animate-fade-up flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:flex-row">
      <img
        src={thumbnail}
        alt={title ?? "Miniature vidéo"}
        className="h-auto w-full shrink-0 rounded-xl object-cover sm:w-40"
      />
      <div className="min-w-0 flex-1 space-y-3">
        <div>
          <h3 className="font-semibold leading-snug">{title ?? "Vidéo analysée"}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            {channel && <span>{channel}</span>}
            {channel && duration && <span>·</span>}
            {duration && <span>{duration}</span>}
          </div>
        </div>
        {(views != null || likes != null || comments != null) && (
          <div className="flex flex-wrap gap-4 text-sm">
            {views != null && (
              <span>
                👁 <span className="font-medium text-foreground">{formatNumber(views)}</span>
              </span>
            )}
            {likes != null && (
              <span>
                👍 <span className="font-medium text-foreground">{formatNumber(likes)}</span>
              </span>
            )}
            {comments != null && (
              <span>
                💬 <span className="font-medium text-foreground">{formatNumber(comments)}</span>
              </span>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {detectedLanguage && (
            <span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted">
              🌐 {detectedLanguage}
            </span>
          )}
          {detectedNiche && (
            <span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted">
              🎯 {detectedNiche}
            </span>
          )}
          {detectedTone && (
            <span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted">
              🎭 {detectedTone}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function MobilePreviewModal({ script, onClose }: { script: string; onClose: () => void }) {
  const [autoScroll, setAutoScroll] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node || !autoScroll) return;
    let pos = 0;
    const interval = setInterval(() => {
      pos += 1;
      node.scrollTop = pos;
      if (pos >= node.scrollHeight - node.clientHeight) pos = 0;
    }, 50);
    return () => clearInterval(interval);
  }, [autoScroll]);

  const displayScript = script.replace(/===[^=]+===/g, "").replace(/\[[^\]]+\]/g, "").trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute -top-10 right-0 text-sm text-white/70 transition-colors hover:text-white">
          Fermer ✕
        </button>
        <div className="mx-auto w-[280px] rounded-[2.5rem] border-4 border-zinc-700 bg-zinc-900 p-3 shadow-2xl">
          <div className="mb-2 flex justify-center">
            <div className="h-5 w-24 rounded-full bg-zinc-800" />
          </div>
          <div ref={scrollRef} className="h-[480px] overflow-y-auto rounded-2xl bg-black px-4 py-6">
            <p className="whitespace-pre-wrap text-lg leading-relaxed text-white">{displayScript}</p>
          </div>
        </div>
        <label className="mt-4 flex items-center justify-center gap-2 text-sm text-white/80">
          <input type="checkbox" checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} className="rounded accent-accent" />
          Défilement automatique
        </label>
      </div>
    </div>
  );
}

function ScriptSection({
  title,
  content,
  colorClass,
  onCopy,
}: {
  title: string;
  content: string;
  colorClass: string;
  onCopy: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copySection() {
    await navigator.clipboard.writeText(`${title}\n${content}`);
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`rounded-xl border p-4 ${colorClass}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-semibold text-secondary">{title}</span>
        <button
          type="button"
          onClick={copySection}
          className="btn-animated shrink-0 rounded-lg border border-border bg-background/50 px-2.5 py-1 text-xs text-muted transition-colors hover:border-accent-light hover:text-foreground"
        >
          {copied ? "Copié ✓" : "Copier"}
        </button>
      </div>
      <pre className="mt-2 whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted">{content}</pre>
    </div>
  );
}

function HookCard({ hook, index, onCopy }: { hook: string; index: number; onCopy: () => void }) {
  const [copied, setCopied] = useState(false);

  async function copyHook() {
    await navigator.clipboard.writeText(hook);
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:border-accent/40">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-xs font-bold text-accent-light">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-relaxed">{hook}</p>
        <button
          type="button"
          onClick={copyHook}
          className="btn-animated mt-2 text-xs text-muted transition-colors hover:text-accent-light"
        >
          {copied ? "Copié ✓" : "Copier"}
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [videoUrl, setVideoUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [platform] = useState<string>("YouTube Shorts");
  const [tone] = useState<string>(TONES[0]);
  const [format] = useState<string>(FORMATS[0]);
  const [outputFormat] = useState<string>(OUTPUT_FORMATS[0].value);
  const [language] = useState<string>(LANGUAGES[0]);
  const [niche] = useState("");
  const [personalStyle, setPersonalStyle] = useState("");
  const [styleOpen, setStyleOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const detectedPlatform = detectPlatformFromUrl(videoUrl);
  const showNonYouTubeMessage = isNonYouTubeUrl(videoUrl);
  const isYouTube = detectedPlatform === "youtube";

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const fetchHistory = useCallback(async (token: string) => {
    const res = await fetch("/api/analyze", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const text = await res.text();
      if (!text) {
        alert("Erreur serveur vide");
        return;
      }
      const data = JSON.parse(text);
      setHistory((data.history ?? []).map(enrichResult));
      setQuota(data.quota ?? null);
    }
  }, []);

  useEffect(() => {
    const urlParam = searchParams.get("url");
    const transcriptParam = searchParams.get("transcript");
    if (urlParam) setVideoUrl(urlParam);
    if (transcriptParam) setTranscript(transcriptParam);
    getSupabase().auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        setUserEmail(session.user.email ?? "");
        fetchHistory(session.access_token);
      }
    });
  }, [searchParams, fetchHistory]);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const {
        data: { session },
      } = await getSupabase().auth.getSession();
      if (!session) {
        const params = new URLSearchParams({ redirect: "/dashboard", url: videoUrl });
        if (transcript.trim()) params.set("transcript", transcript.trim());
        window.location.href = `/login?${params.toString()}`;
        return;
      }
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          videoUrl,
          transcript: transcript.trim() || undefined,
          platform,
          tone,
          format,
          outputFormat,
          language,
          niche,
          personalStyle,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }
      const enriched = enrichResult(data.analysis);
      setResult(enriched);
      setHistory((prev) => [enriched, ...prev.filter((h) => h.id !== enriched.id)].slice(0, 5));
      if (data.quota) setQuota(data.quota);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerate() {
    if (!result) return;
    setError("");
    setRegenerating(true);
    try {
      const {
        data: { session },
      } = await getSupabase().auth.getSession();
      if (!session) return;
      const res = await fetch("/api/analyze/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ analysisId: result.id, personalStyle }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }
      const enriched = enrichResult(data.analysis);
      setResult(enriched);
      setHistory((prev) => prev.map((h) => (h.id === enriched.id ? enriched : h)));
      if (data.quota) setQuota(data.quota);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setRegenerating(false);
    }
  }

  async function copyFullScript() {
    if (!result) return;
    await navigator.clipboard.writeText(result.script);
    showToast("Copié !");
  }

  const details = result?.details;
  const scriptSections = result ? parseScriptSections(result.script) : [];
  const fullReport = details?.fullReport || result?.whyViral || "";

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm outline-none transition-colors focus:border-accent-light placeholder:text-muted/60";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg gradient-premium text-sm font-bold text-white">
              V
            </span>
            <span className="text-lg font-semibold">Viralyz</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            {userEmail && <span className="hidden max-w-[180px] truncate text-sm text-muted sm:inline">{userEmail}</span>}
            <button
              type="button"
              onClick={() => getSupabase().auth.signOut().then(() => (window.location.href = "/"))}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent/40 hover:text-foreground"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
        {quota && <CreditsSection quota={quota} />}

        {loading ? (
          <LoadingAnimation />
        ) : (
          <form onSubmit={handleAnalyze} className="space-y-6">
            <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
              <h2 className="text-lg font-semibold sm:text-xl">Analysez une vidéo</h2>
              <div className="mt-4">
                <div className="relative">
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="Collez l'URL YouTube..."
                    required
                    className={`${inputClass} pr-12 text-base sm:py-4`}
                  />
                  {isYouTube && (
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                      <PlatformIconSingle platform="youtube" className="h-6 w-6" />
                    </div>
                  )}
                </div>
                {showNonYouTubeMessage && (
                  <p className="mt-3 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-sm text-orange-400">
                    TikTok et Instagram arrivent bientôt
                  </p>
                )}
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-border bg-background">
                <button
                  type="button"
                  onClick={() => setStyleOpen(!styleOpen)}
                  className="btn-animated flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-surface/50"
                >
                  ✨ Style personnel (optionnel)
                  <span className="text-accent">{styleOpen ? "−" : "+"}</span>
                </button>
                <div
                  className="accordion-content border-t border-border"
                  style={{ maxHeight: styleOpen ? "300px" : "0", opacity: styleOpen ? 1 : 0 }}
                >
                  <textarea
                    value={personalStyle}
                    onChange={(e) => setPersonalStyle(e.target.value)}
                    placeholder="Collez 3 exemples de vos anciens scripts pour que l'IA imite votre style..."
                    rows={4}
                    className="w-full resize-none bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted/60"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-analyze-pulse mt-6 w-full rounded-xl px-6 py-4 text-base font-bold text-white disabled:opacity-50 sm:py-4"
              >
                Analyser
              </button>
            </section>
          </form>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
        )}

        {result && (
          <section className="animate-fade-up space-y-6">
            {details?.thumbnail && (
              <VideoCard
                thumbnail={details.thumbnail}
                title={result.videoTitle}
                channel={details.channel}
                duration={details.duration}
                views={details.views}
                likes={details.likes}
                comments={details.comments}
                detectedLanguage={details.detectedLanguage}
                detectedNiche={details.detectedNiche}
                detectedTone={details.detectedTone}
              />
            )}

            <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
              <div className="rounded-2xl border border-border bg-surface p-6 text-center">
                <p className="mb-4 text-sm font-medium text-muted">Score viral</p>
                <ViralScoreCircle score={result.viralScore} />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <ScoreBar label="Hook" score={result.hookStrength} explanation={details?.hookExplanation} />
                <ScoreBar label="Rétention" score={result.retentionScore} explanation={details?.retentionExplanation} />
                <ScoreBar label="CTA" score={result.ctaScore} explanation={details?.ctaExplanation} />
              </div>
            </div>

            {result.viralTags.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface p-5">
                <h4 className="text-sm font-semibold">Tags viraux</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.viralTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(tag);
                        showToast("Copié !");
                      }}
                      className="tag-viral rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs text-accent-light"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {fullReport && (
              <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
                <h4 className="mb-4 text-sm font-semibold">Rapport complet</h4>
                <div className="report-markdown rounded-xl bg-[#13131A] p-4 sm:p-6">
                  <ReactMarkdown>{fullReport}</ReactMarkdown>
                </div>
              </div>
            )}

            {details?.alternativeHooks && details.alternativeHooks.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
                <h4 className="mb-4 text-sm font-semibold">🎣 Hooks alternatifs</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {details.alternativeHooks.map((hook, i) => (
                    <HookCard key={i} hook={hook} index={i} onCopy={() => showToast("Copié !")} />
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h4 className="text-sm font-semibold">📝 Script généré</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={copyFullScript}
                    className="btn-animated w-full rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent-light hover:text-foreground sm:w-auto"
                  >
                    Copier tout
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMobilePreview(true)}
                    className="btn-animated w-full rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent-light hover:text-foreground sm:w-auto"
                  >
                    Voir sur mobile
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="btn-animated inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent-light hover:text-foreground disabled:opacity-50 sm:w-auto"
                  >
                    <RefreshIcon className={`h-3.5 w-3.5 ${regenerating ? "animate-spin" : ""}`} />
                    {regenerating ? "Génération..." : "Régénérer (1 crédit)"}
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {scriptSections.map((section, i) => (
                  <ScriptSection
                    key={i}
                    title={section.title}
                    content={section.content}
                    colorClass={SCRIPT_SECTION_COLORS[i % SCRIPT_SECTION_COLORS.length]}
                    onCopy={() => showToast("Copié !")}
                  />
                ))}
              </div>
            </div>

            {showMobilePreview && <MobilePreviewModal script={result.script} onClose={() => setShowMobilePreview(false)} />}
          </section>
        )}

        {history.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold">Historique récent</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {history.slice(0, 5).map((item) => {
                const itemDetails = item.details ?? parseAnalysisDetails(item.improvements);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setResult(enrichResult(item))}
                    className="pricing-card flex items-start gap-3 rounded-xl border border-border bg-surface p-3 text-left transition-colors hover:border-accent-light"
                  >
                    {itemDetails?.thumbnail ? (
                      <img
                        src={itemDetails.thumbnail}
                        alt=""
                        className="h-14 w-20 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-background text-lg">
                        🎬
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.videoTitle ?? "Analyse vidéo"}</p>
                      <p className="mt-0.5 text-xs text-muted">{formatRelativeDate(item.createdAt)}</p>
                    </div>
                    <span
                      className="shrink-0 text-lg font-bold"
                      style={{ color: getScoreHexColor(item.viralScore) }}
                    >
                      {item.viralScore}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Toast message={toast} />
    </div>
  );
}
