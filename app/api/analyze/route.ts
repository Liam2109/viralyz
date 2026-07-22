import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { PROMPT_ANALYZE, PROMPT_ANALYZE_CREATOR, PROMPT_ANALYZE_PRO, buildPromptScript, buildPromptScriptCreator, buildPromptScriptPro, PROMPT_SIMILARITY, type OutputFormat } from "@/lib/prompts";
import { prisma } from "@/lib/prisma";
import { getAuthUser, getOrCreateDbUser, getQuotaInfo, fetchYouTubeData, PLAN_LIMITS, getMonthlyUsage, CREDITS_EXHAUSTED_MESSAGE } from "@/lib/auth";
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
  alternativeHooks?: string[];
  keyLearnings?: string[];
  detectedLanguage?: string;
  detectedNiche?: string;
  detectedTone?: string;
  detectedFormat?: string;
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

    // Récupération des données YouTube complètes
    let youtubeData = null;
    let videoTitle: string | null = null;
    let videoThumbnail: string | null = null;
    let videoViews: number | null = null;
    let videoLikes: number | null = null;
    let videoComments: number | null = null;
    let videoDuration: string | null = null;
    let videoChannel: string | null = null;

    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
      youtubeData = await fetchYouTubeData(videoUrl);
      if (youtubeData) {
        videoTitle = youtubeData.title;
        videoThumbnail = youtubeData.thumbnail;
        videoViews = youtubeData.views;
        videoLikes = youtubeData.likes;
        videoComments = youtubeData.comments;
        videoDuration = youtubeData.duration;
        videoChannel = youtubeData.channelName;
      }
    }

    // Contexte enrichi pour l'analyse
    const metricsContext = youtubeData ? `
Métriques réelles de la vidéo :
- Vues : ${videoViews?.toLocaleString("fr-FR") ?? "N/A"}
- Likes : ${videoLikes?.toLocaleString("fr-FR") ?? "N/A"}
- Commentaires : ${videoComments?.toLocaleString("fr-FR") ?? "N/A"}
- Durée : ${videoDuration ?? "N/A"}
- Chaîne : ${videoChannel ?? "N/A"}
- Ratio engagement : ${videoViews && videoLikes ? ((videoLikes / videoViews) * 100).toFixed(2) + "%" : "N/A"}
` : "";

    const contentInput = transcript
      ? `Transcript:\n${transcript}\n\nTitre: ${videoTitle ?? "Inconnu"}\n${metricsContext}`
      : `URL vidéo: ${videoUrl}\nTitre: ${videoTitle ?? "Inconnu"}\n${metricsContext}\nAnalyse la structure typique d'une vidéo virale de ce type.`;

    // Choisir le prompt selon le plan
    const analyzePrompt = dbUser.plan === "PRO"
      ? PROMPT_ANALYZE_PRO
      : dbUser.plan === "CREATOR"
      ? PROMPT_ANALYZE_CREATOR
      : PROMPT_ANALYZE;

    const analyzeCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: analyzePrompt },
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

    // Choisir le prompt de script selon le plan
    const scriptBuilderFn = dbUser.plan === "PRO"
      ? buildPromptScriptPro
      : dbUser.plan === "CREATOR"
      ? buildPromptScriptCreator
      : buildPromptScript;

    const scriptPrompt = scriptBuilderFn({
      platform,
      tone,
      format,
      outputFormat,
      language,
      niche,
      personalStyle,
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
      alternativeHooks: analysis.alternativeHooks,
      keyLearnings: analysis.keyLearnings,
      detectedLanguage: analysis.detectedLanguage,
      detectedNiche: analysis.detectedNiche,
      detectedTone: analysis.detectedTone,
      detectedFormat: analysis.detectedFormat,
      // Données YouTube
      thumbnail: videoThumbnail,
      views: videoViews,
      likes: videoLikes,
      comments: videoComments,
      duration: videoDuration,
      channel: videoChannel,
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