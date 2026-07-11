import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { PROMPT_ANALYZE, buildPromptScript, PROMPT_SIMILARITY, type OutputFormat } from "@/lib/prompts";
import { prisma } from "@/lib/prisma";
import { getAuthUser, getOrCreateDbUser, getQuotaInfo, fetchYouTubeTitle, PLAN_LIMITS, getMonthlyUsage, CREDITS_EXHAUSTED_MESSAGE } from "@/lib/auth";
import { isNonYouTubeUrl } from "@/lib/platforms";

interface AnalyzeBody {
  videoUrl: string;
  transcript?: string;
  platform: string;
  tone: string;
  format: string;
  outputFormat?: OutputFormat;
  language: string;
  niche?: string;
  personalStyle?: string;
}

interface AnalyzeJson {
  viralScore: number;
  whyViral: string;
  improvements?: string;
  viralTags: string[];
  hookStrength: number;
  retentionScore: number;
  ctaScore: number;
  hookExplanation?: string;
  retentionExplanation?: string;
  ctaExplanation?: string;
  weakPoints?: string[];
  opportunities?: string[];
  narrativeStructure?: { hook: string; development: string; climax: string; cta: string };
  emotions?: string[];
  algorithmTechniques?: string[];
}

async function computeSimilarityScore(script: string, personalStyle: string): Promise<number | null> {
  if (!personalStyle.trim()) return null;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: PROMPT_SIMILARITY(script, personalStyle) },
        { role: "user", content: "Évalue la similarité." },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { similarityScore?: number };
    const score = parsed.similarityScore;
    if (typeof score !== "number") return null;
    return Math.max(0, Math.min(100, Math.round(score)));
  } catch { return null; }
}

export async function GET(request: NextRequest) {
  try {
    const supabaseUser = await getAuthUser(request);
    if (!supabaseUser) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    const dbUser = await getOrCreateDbUser(supabaseUser);
    if (!dbUser) return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    const history = await prisma.analysis.findMany({ where: { userId: dbUser.id }, orderBy: { createdAt: "desc" }, take: 5 });
    const quota = await getQuotaInfo(dbUser.id, dbUser.plan);
    return NextResponse.json({ history, quota });
  } catch (error) {
    console.error("ERREUR GET ANALYZE:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUser = await getAuthUser(request);
    if (!supabaseUser) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    const dbUser = await getOrCreateDbUser(supabaseUser);
    if (!dbUser) return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });

    const body: AnalyzeBody = await request.json();
    const { videoUrl, transcript, platform, tone, format, outputFormat = "Court", language, niche = "général", personalStyle = "" } = body;

    if (!videoUrl) return NextResponse.json({ error: "URL vidéo requise." }, { status: 400 });

    if (isNonYouTubeUrl(videoUrl) && !transcript?.trim()) {
      return NextResponse.json({ error: "TikTok, Instagram et X arrivent bientôt. En attendant, collez votre transcription ci-dessous." }, { status: 400 });
    }

    if (isNonYouTubeUrl(videoUrl) && dbUser.plan === "FREE") {
      return NextResponse.json({ error: "Les vidéos non-YouTube nécessitent le plan Creator." }, { status: 403 });
    }

    if (dbUser.plan === "FREE" && outputFormat !== "Court") {
      return NextResponse.json({ error: "Format moyen et long disponibles dès le plan Creator" }, { status: 403 });
    }

    const limit = PLAN_LIMITS[dbUser.plan];
    if (limit !== null) {
      const used = await getMonthlyUsage(dbUser.id);
      if (used >= limit) return NextResponse.json({ error: CREDITS_EXHAUSTED_MESSAGE }, { status: 403 });
    }

    let videoTitle: string | null = null;
    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
      videoTitle = await fetchYouTubeTitle(videoUrl);
    }

    const contentInput = transcript
      ? `Transcript:\n${transcript}\n\nTitre: ${videoTitle ?? "Inconnu"}`
      : `URL vidéo: ${videoUrl}\nTitre: ${videoTitle ?? "Inconnu"}\nAnalyse la structure typique d'une vidéo virale de ce type.`;

    const analyzeCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: PROMPT_ANALYZE },
        { role: "user", content: contentInput },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const analyzeRaw = analyzeCompletion.choices[0]?.message?.content;
    if (!analyzeRaw) return NextResponse.json({ error: "Erreur d'analyse IA." }, { status: 500 });

    let analysis: AnalyzeJson;
    try { analysis = JSON.parse(analyzeRaw); }
    catch { return NextResponse.json({ error: "Réponse IA invalide." }, { status: 500 }); }

    const scriptPrompt = buildPromptScript({
      platform, tone, format, outputFormat, language, niche, personalStyle,
      videoTitle: videoTitle ?? undefined,
      analysisContext: JSON.stringify(analysis, null, 2),
    });

    const scriptCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: scriptPrompt },
        { role: "user", content: "Génère le script maintenant." },
      ],
      temperature: 0.8,
    });

    const script = scriptCompletion.choices[0]?.message?.content ?? "";
    const similarityScore = await computeSimilarityScore(script, personalStyle);

    const analysisDetails = {
      hookExplanation: analysis.hookExplanation,
      retentionExplanation: analysis.retentionExplanation,
      ctaExplanation: analysis.ctaExplanation,
      weakPoints: analysis.weakPoints,
      opportunities: analysis.opportunities,
      narrativeStructure: analysis.narrativeStructure,
      emotions: analysis.emotions,
      algorithmTechniques: analysis.algorithmTechniques,
    };

    const saved = await prisma.analysis.create({
      data: {
        userId: dbUser.id,
        videoUrl,
        videoTitle,
        platform,
        tone,
        format,
        outputFormat,
        language,
        niche,
        viralScore: analysis.viralScore,
        whyViral: analysis.whyViral,
        improvements: JSON.stringify(analysisDetails),
        viralTags: analysis.viralTags,
        hookStrength: analysis.hookStrength,
        retentionScore: analysis.retentionScore,
        ctaScore: analysis.ctaScore,
        script,
        similarityScore,
      },
    });

    const quota = await getQuotaInfo(dbUser.id, dbUser.plan);
    return NextResponse.json({ analysis: saved, quota });

  } catch (error) {
    console.error("ERREUR POST ANALYZE DETAIL:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}