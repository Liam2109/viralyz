"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { PlatformIconSingle } from "@/components/PlatformIcons";
import {
  detectPlatformFromUrl,
  isNonYouTubeUrl,
  PLATFORM_LABELS,
} from "@/lib/platforms";
import ReactMarkdown from "react-markdown";
import AnalysisLoadingPanel from "@/components/dashboard/AnalysisLoadingPanel";
import ViralScoreCircle from "@/components/dashboard/ViralScoreCircle";
import VideoMetadataCard from "@/components/dashboard/VideoMetadataCard";
import UpgradeSuccessModal from "@/components/dashboard/UpgradeSuccessModal";
import { XPNotification } from "@/components/XPNotification";
import { formatRelativeDate } from "@/lib/dashboard-utils";

const ALL_PLATFORMS = ["TikTok", "YouTube Shorts", "Instagram Reels", "X"] as const;
const FREE_PLATFORMS = ["YouTube Shorts"] as const;
const TONES = ["Authentique", "Inspirant", "Éducatif", "Humoristique", "Autoritaire", "Intime"] as const;
const FORMATS = ["Storytelling", "Liste", "Révélation", "Défi", "Tutoriel", "Avant/Après"] as const;
const OUTPUT_FORMATS = [
  { value: "Court", label: "Court (30-60s)", desc: "TikTok, Reels, Shorts" },
  { value: "Moyen", label: "Moyen (2-3 min)", desc: "YouTube standard" },
  { value: "Long", label: "Long (5-10 min)", desc: "YouTube approfondi" },
] as const;
const LANGUAGES = ["FR Casual", "FR Pro", "EN Casual", "EN Pro"] as const;

interface AnalysisDetails {
  hookExplanation?: string;
  retentionExplanation?: string;
  ctaExplanation?: string;
  weakPoints?: string[];
  opportunities?: string[];
  narrativeStructure?: { hook: string; development: string; climax: string; cta: string };
  emotions?: string[];
  algorithmTechniques?: string[];
  thumbnail?: string;
  views?: number;
  likes?: number;
  comments?: number;
  duration?: string;
  channel?: string;
  alternativeHooks?: string[];
  fullReport?: string;
  detectedLanguage?: string;
  detectedNiche?: string;
  detectedTone?: string;
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
  } catch { }
  return null;
}

function getScoreColor(score: number): string {
  if (score < 40) return "bg-red-500";
  if (score <= 70) return "bg-orange-500";
  return "bg-green-500";
}

function getSimilarityBadgeColor(score: number): string {
  if (score > 70) return "border-green-500/40 bg-green-500/10 text-green-400";
  if (score >= 40) return "border-orange-500/40 bg-orange-500/10 text-orange-400";
  return "border-red-500/40 bg-red-500/10 text-red-400";
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
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
        <button type="button" onClick={onClose} className="absolute -top-10 right-0 text-sm text-white/70 hover:text-white">Fermer ✕</button>
        <div className="mx-auto w-[280px] rounded-[2.5rem] border-4 border-zinc-700 bg-zinc-900 p-3 shadow-2xl">
          <div className="mb-2 flex justify-center"><div className="h-5 w-24 rounded-full bg-zinc-800" /></div>
          <div ref={scrollRef} className="h-[480px] overflow-y-auto rounded-2xl bg-black px-4 py-6">
            <p className="whitespace-pre-wrap text-lg leading-relaxed text-white">{displayScript}</p>
          </div>
        </div>
        <label className="mt-4 flex items-center justify-center gap-2 text-sm text-white/80">
          <input type="checkbox" checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} className="rounded" />
          Défilement automatique
        </label>
      </div>
    </div>
  );
}

function getCreditsBarColor(pct: number): string {
  if (pct > 50) return "bg-green-500";
  if (pct >= 20) return "bg-orange-500";
  return "bg-red-500";
}

function FreePlanBanner() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-accent/30 bg-accent/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm">Vous avez 2 crédits gratuits ce mois — passez au plan Creator pour en avoir 20</p>
      <Link href="/dashboard/pricing" className="btn-animated shrink-0 rounded-lg gradient-premium px-5 py-2 text-sm font-semibold text-white text-center">
        Upgrader
      </Link>
    </div>
  );
}

function CreatorUpgradeBanner() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted">Passez au Pro — 50 analyses — 24.99€/mois</p>
      <Link href="/dashboard/pricing" className="btn-animated w-full rounded-lg border border-accent/50 bg-accent/10 px-4 py-2 text-center text-sm font-semibold text-accent-light sm:w-auto">
        Voir Pro
      </Link>
    </div>
  );
}

function AlternativeHookCard({ hook, index, onCopy }: { hook: string; index: number; onCopy: () => void }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    await navigator.clipboard.writeText(hook);
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-accent">#{index + 1}</span>
        <button type="button" onClick={handleCopy} className="btn-animated shrink-0 rounded-lg border border-border px-2.5 py-1 text-xs text-muted hover:border-accent-light">
          {copied ? "Copié ✓" : "Copier"}
        </button>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">{hook}</p>
    </div>
  );
}

function getHistoryThumbnail(improvements: string): string | undefined {
  const d = parseAnalysisDetails(improvements);
  return d?.thumbnail;
}

function AnimatedCounter({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    function animate(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return <span>{display}</span>;
}

function ScoreBar({ label, score, explanation }: { label: string; score: number; explanation?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-bold text-accent">{score}/100</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-border">
        <div className={`progress-bar-animated h-full rounded-full ${getScoreColor(score)}`} style={{ width: `${score}%` }} />
      </div>
      {explanation && <p className="mt-1 text-xs text-muted">{explanation}</p>}
    </div>
  );
}

function CreditsBar({ quota }: { quota: QuotaInfo }) {
  if (quota.limit === null) {
    return (
      <div className="rounded-2xl border border-accent/30 bg-surface p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">Crédits restants ce mois</p>
            <p className="mt-1 text-2xl font-bold gradient-premium-text">Illimité</p>
          </div>
          <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-light">{quota.plan}</span>
        </div>
      </div>
    );
  }
  const remaining = quota.remaining ?? 0;
  const pct = quota.limit > 0 ? (remaining / quota.limit) * 100 : 0;
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{remaining} crédit{remaining !== 1 ? "s" : ""} restant{remaining !== 1 ? "s" : ""} ce mois</p>
          <p className="mt-1 text-xs text-muted">{remaining} / {quota.limit} crédits</p>
        </div>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted">{quota.plan}</span>
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-border">
        <div className={`progress-bar-animated h-full rounded-full transition-all duration-500 ${getCreditsBarColor(pct)}`} style={{ width: `${pct}%` }} />
      </div>
      {remaining === 0 ? (
        <p className="mt-3 text-xs text-red-400">Vous avez utilisé tous vos crédits ce mois. Rechargez avec le plan Creator.</p>
      ) : (
        <p className="mt-2 text-xs text-muted">1 analyse ou régénération = 1 crédit</p>
      )}
    </div>
  );
}

function AccordionItem({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} className="btn-animated flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium">
        {title}
        <span className="text-accent">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="border-t border-border px-4 py-3 text-sm leading-relaxed text-muted">{children}</div>}
    </div>
  );
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

function ScriptSection({ title, content }: { title: string; content: string }) {
  const [copied, setCopied] = useState(false);
  async function copySection() {
    await navigator.clipboard.writeText(`${title}\n${content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-semibold text-secondary">{title}</span>
        <button type="button" onClick={copySection} className="btn-animated rounded-lg border border-border px-2.5 py-1 text-xs text-muted hover:border-accent-light hover:text-foreground">
          {copied ? "Copié ✓" : "Copier"}
        </button>
      </div>
      <pre className="mt-2 whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted">{content}</pre>
    </div>
  );
}

function enrichResult(item: AnalysisResult): AnalysisResult {
  return { ...item, details: parseAnalysisDetails(item.improvements) ?? undefined };
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
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [xpNotif, setXpNotif] = useState<{ xp: number; badge?: { emoji: string; label: string } } | null>(null);

  function showCopyToast() {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }

  async function copyViralTag(tag: string) {
    setSelectedTag(tag);
    await navigator.clipboard.writeText(tag);
    showCopyToast();
  }

  async function copyFullScript() {
    if (!result) return;
    await navigator.clipboard.writeText(result.script);
    showCopyToast();
  }

  const isFreePlan = quota?.plan === "FREE";

  const detectedPlatform = detectPlatformFromUrl(videoUrl);
  const showNonYouTubeMessage = isNonYouTubeUrl(videoUrl);

  const fetchHistory = useCallback(async (token: string) => {
    const res = await fetch("/api/analyze", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const text = await res.text();
      if (!text) return;
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

    getSupabase().auth.getSession().then(async ({ data: { session } }) => {
      if (session?.access_token) {
        setUserEmail(session.user.email ?? "");

        // Vérifie onboarding EN PREMIER
        const profileRes = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (!profileData.profile || profileData.profile.onboardingDone === false) {
            window.location.href = "/onboarding";
            return;
          }
        }

        // Ensuite charge l'historique
        fetchHistory(session.access_token);
      }
    });
  }, [searchParams, fetchHistory]);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);
    setSelectedTag(null);
    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      if (!session) {
        const params = new URLSearchParams({ redirect: "/dashboard", url: videoUrl });
        if (transcript.trim()) params.set("transcript", transcript.trim());
        window.location.href = `/login?${params.toString()}`;
        return;
      }
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ videoUrl, transcript: transcript.trim() || undefined, platform, tone, format, outputFormat, language, niche, personalStyle }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Une erreur est survenue."); return; }
      const enriched = enrichResult(data.analysis);
      setResult(enriched);
      setHistory((prev) => [enriched, ...prev.filter((h) => h.id !== enriched.id)].slice(0, 5));
      if (data.quota) setQuota(data.quota);
      fetch("/api/profile/add-xp", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ xp: 10, type: "analysis" }),
      }).then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.newBadges?.length > 0) {
            setXpNotif({ xp: 10, badge: { emoji: data.newBadges[0].emoji, label: data.newBadges[0].label } });
          } else {
            setXpNotif({ xp: 10 });
          }
        }
      }).catch(() => {});
    } catch { setError("Impossible de contacter le serveur."); }
    finally { setLoading(false); }
  }

  async function handleRegenerate() {
    if (!result) return;
    setError("");
    setRegenerating(true);
    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      if (!session) return;
      const res = await fetch("/api/analyze/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ analysisId: result.id, personalStyle }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Une erreur est survenue."); return; }
      const enriched = enrichResult(data.analysis);
      setResult(enriched);
      setHistory((prev) => prev.map((h) => (h.id === enriched.id ? enriched : h)));
      if (data.quota) setQuota(data.quota);
    } catch { setError("Impossible de contacter le serveur."); }
    finally { setRegenerating(false); }
  }

  const inputClass = "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent-light";
  const details = result?.details;
  const scriptSections = result ? parseScriptSections(result.script) : [];
  const reportMarkdown = details?.fullReport ?? result?.whyViral ?? "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {toastVisible && <div className="toast-notification" role="status">✓ Copié !</div>}
      <UpgradeSuccessModal plan={quota?.plan ?? "CREATOR"} />
      <header className="border-b border-border px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-premium text-sm font-bold text-white">V</span>
            <span className="text-lg font-semibold">Viralyz</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            {quota?.plan === "PRO" && (
              <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-light">Plan Pro ✨</span>
            )}
            <Link href="/profile" className="text-sm text-muted hover:text-accent-light">Mon profil</Link>
            {userEmail && <span className="hidden text-sm text-muted sm:inline">{userEmail}</span>}
            <button type="button" onClick={() => getSupabase().auth.signOut().then(() => (window.location.href = "/"))} className="text-sm text-muted hover:text-accent-light">Déconnexion</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
        <section className="space-y-4">
          {quota?.plan === "CREATOR" && <CreatorUpgradeBanner />}
          {quota?.plan === "FREE" && <FreePlanBanner />}
          {quota && <CreditsBar quota={quota} />}
          {quota?.plan === "PRO" && (
  <div className="flex justify-end">
    <button
      type="button"
      onClick={async () => {
        const { data: { session } } = await getSupabase().auth.getSession();
        if (!session) return;
        const res = await fetch("/api/stripe/portal", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      }}
      className="btn-animated rounded-lg border border-border px-5 py-2 text-sm font-semibold text-muted hover:border-accent-light"
    >
      Gérer mon abonnement
    </button>
  </div>
)}
        </section>

        {loading ? (
          <AnalysisLoadingPanel />
        ) : (
          <form onSubmit={handleAnalyze} className="space-y-6">
            <section className="rounded-2xl border border-border bg-surface p-4 space-y-4 sm:p-6">
              <h2 className="text-lg font-semibold">Analyser une vidéo</h2>
              <div>
                <label className="text-sm font-medium">URL de votre vidéo</label>
                <div className="mt-2 flex items-center gap-3">
                  <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." required className={`flex-1 ${inputClass}`} />
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                    <PlatformIconSingle platform={detectedPlatform} className="h-5 w-5" />
                  </div>
                </div>
                {detectedPlatform && (
                  <p className="mt-1.5 text-xs text-muted">Plateforme détectée : {PLATFORM_LABELS[detectedPlatform]}{detectedPlatform === "youtube" && " — analyse automatique"}</p>
                )}
              </div>
              {detectedPlatform === "x" && (
  <>
    <div className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm">X (Twitter) arrive bientôt. En attendant, collez votre transcription ci-dessous.</div>
    <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Collez votre transcription ici..." rows={5} className={`resize-none ${inputClass}`} />
  </>
)}
              <AccordionItem title="✨ Style personnel (optionnel)" defaultOpen={false}>
                <textarea value={personalStyle} onChange={(e) => setPersonalStyle(e.target.value)} placeholder="Collez 3 exemples de vos anciens scripts pour que l'IA imite votre style..." rows={5} className={`w-full resize-none ${inputClass}`} />
              </AccordionItem>
            </section>

            <div className="flex justify-center">
              <button type="submit" disabled={loading} className="btn-analyze-pulse btn-analyze-main w-full rounded-2xl px-10 py-4 text-base font-bold text-white disabled:opacity-50 sm:w-auto">
                Analyser
              </button>
            </div>
          </form>
        )}

        {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}

        {result && (
          <section className="animate-fade-up space-y-6">
            <h2 className="text-xl font-semibold">Résultat de l&apos;analyse</h2>
            <VideoMetadataCard
              thumbnail={details?.thumbnail}
              videoTitle={result.videoTitle}
              channel={details?.channel}
              duration={details?.duration}
              views={details?.views}
              likes={details?.likes}
              comments={details?.comments}
              detectedLanguage={details?.detectedLanguage}
              detectedNiche={details?.detectedNiche}
              detectedTone={details?.detectedTone}
            />
            <div className="rounded-2xl border border-border bg-surface p-6">
              <ViralScoreCircle score={result.viralScore} />
            </div>
            {reportMarkdown && (
              <div className="report-markdown rounded-xl border border-[#1E1E2E] bg-[#13131A] p-6">
                <h4 className="mb-3 text-sm font-medium text-secondary">Rapport d&apos;analyse</h4>
                <ReactMarkdown>{reportMarkdown}</ReactMarkdown>
              </div>
            )}
            {details?.alternativeHooks && details.alternativeHooks.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-secondary">🎣 Hooks alternatifs</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {details.alternativeHooks.map((hook, i) => (
                    <AlternativeHookCard key={i} hook={hook} index={i} onCopy={showCopyToast} />
                  ))}
                </div>
              </div>
            )}
            <div className="rounded-2xl border border-border bg-surface p-6 space-y-6">
              <div className="space-y-4">
                <ScoreBar label="Hook" score={result.hookStrength} explanation={details?.hookExplanation} />
                <ScoreBar label="Rétention" score={result.retentionScore} explanation={details?.retentionExplanation} />
                <ScoreBar label="CTA" score={result.ctaScore} explanation={details?.ctaExplanation} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-secondary">Tags viraux</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.viralTags.map((tag) => (
                    <button key={tag} type="button" onClick={() => copyViralTag(tag)}
                      className={`tag-viral rounded-full border px-3 py-1 text-xs ${selectedTag === tag ? "border-accent-light bg-accent/20 text-accent-light" : "border-border text-muted"}`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-secondary">Analyse détaillée</h4>
                <AccordionItem title="Pourquoi cette vidéo a explosé" defaultOpen>
                  <p className="whitespace-pre-wrap">{result.whyViral}</p>
                </AccordionItem>
                <AccordionItem title="Points faibles identifiés">
                  {details?.weakPoints?.length ? (
                    <ul className="list-disc pl-4 space-y-1">{details.weakPoints.map((p, i) => <li key={i}>{p}</li>)}</ul>
                  ) : <p>Non disponible</p>}
                </AccordionItem>
                <AccordionItem title="Opportunités d&apos;amélioration">
                  {details?.opportunities?.length ? (
                    <ul className="list-disc pl-4 space-y-1">{details.opportunities.map((p, i) => <li key={i}>{p}</li>)}</ul>
                  ) : <p>Aucune suggestion disponible.</p>}
                </AccordionItem>
                {details?.narrativeStructure && (
                  <AccordionItem title="Structure narrative">
                    <div className="space-y-2">
                      <p><strong className="text-foreground">Hook :</strong> {details.narrativeStructure.hook}</p>
                      <p><strong className="text-foreground">Développement :</strong> {details.narrativeStructure.development}</p>
                      <p><strong className="text-foreground">Climax :</strong> {details.narrativeStructure.climax}</p>
                      <p><strong className="text-foreground">CTA :</strong> {details.narrativeStructure.cta}</p>
                    </div>
                  </AccordionItem>
                )}
                {details?.emotions && details.emotions.length > 0 && (
                  <AccordionItem title="Émotions déclenchées">
                    <div className="flex flex-wrap gap-2">{details.emotions.map((e) => <span key={e} className="rounded-full border border-border px-3 py-1 text-xs">{e}</span>)}</div>
                  </AccordionItem>
                )}
                {details?.algorithmTechniques && details.algorithmTechniques.length > 0 && (
                  <AccordionItem title="Techniques algorithmiques">
                    <ul className="list-disc pl-4 space-y-1">{details.algorithmTechniques.map((t, i) => <li key={i}>{t}</li>)}</ul>
                  </AccordionItem>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                  <h4 className="text-sm font-medium text-secondary">Script généré</h4>
                  <button type="button" onClick={copyFullScript} className="btn-animated w-full rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:border-accent-light sm:w-auto">
                    📋 Copier tout le script
                  </button>
                </div>
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                  {result.similarityScore != null && (
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getSimilarityBadgeColor(result.similarityScore)}`}>
                      Similarité : {result.similarityScore}%
                    </span>
                  )}
                  <button type="button" onClick={() => setShowMobilePreview(true)} className="btn-animated rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:border-accent-light">Voir sur mobile</button>
                  <button type="button" onClick={handleRegenerate} disabled={regenerating} className="btn-animated inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:border-accent-light disabled:opacity-50">
                    <RefreshIcon className={`h-3.5 w-3.5 ${regenerating ? "animate-spin" : ""}`} />
                    {regenerating ? "Génération..." : "Régénérer"}
                  </button>
                </div>
              </div>
              {scriptSections.map((section, i) => <ScriptSection key={i} title={section.title} content={section.content} />)}
            </div>

            {showMobilePreview && <MobilePreviewModal script={result.script} onClose={() => setShowMobilePreview(false)} />}
          </section>
        )}

        {history.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold">Historique récent</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {history.slice(0, 5).map((item) => {
                const thumb = getHistoryThumbnail(item.improvements);
                return (
                  <button key={item.id} type="button" onClick={() => setResult(enrichResult(item))}
                    className="pricing-card flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-accent-light">
                    {thumb && (
                      <img src={thumb} alt="" className="hidden h-12 w-20 shrink-0 rounded-md object-cover sm:block" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.videoTitle ?? "Analyse vidéo"}</p>
                      <p className="mt-0.5 text-xs text-muted">{formatRelativeDate(item.createdAt)}</p>
                    </div>
                    <div className="ml-0 shrink-0 text-right sm:ml-3">
                      <span className={`inline-block h-2 w-2 rounded-full ${getScoreColor(item.viralScore)}`} />
                      <p className="text-lg font-bold text-accent">{item.viralScore}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </main>
      {xpNotif && <XPNotification xp={xpNotif.xp} badge={xpNotif.badge} onClose={() => setXpNotif(null)} />}
    </div>
  );
}