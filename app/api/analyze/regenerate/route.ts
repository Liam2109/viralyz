import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { buildPromptScript, PROMPT_SIMILARITY, type OutputFormat } from "@/lib/prompts";
import { prisma } from "@/lib/prisma";
import {
  getAuthUser,
  getOrCreateDbUser,
  getQuotaInfo,
  PLAN_LIMITS,
  getMonthlyUsage,
  CREDITS_EXHAUSTED_MESSAGE,
} from "@/lib/auth";

interface RegenerateBody {
  analysisId: string;
  personalStyle?: string;
}

async function computeSimilarityScore(
  script: string,
  personalStyle: string
): Promise<number | null> {
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
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const supabaseUser = await getAuthUser(request);
  if (!supabaseUser) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const dbUser = await getOrCreateDbUser(supabaseUser);
  if (!dbUser) {
    return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
  }

  const body: RegenerateBody = await request.json();
  const { analysisId, personalStyle = "" } = body;

  if (!analysisId) {
    return NextResponse.json({ error: "ID d'analyse requis." }, { status: 400 });
  }

  const existing = await prisma.analysis.findFirst({
    where: { id: analysisId, userId: dbUser.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Analyse introuvable." }, { status: 404 });
  }

  const limit = PLAN_LIMITS[dbUser.plan];
  if (limit !== null) {
    const used = await getMonthlyUsage(dbUser.id);
    if (used >= limit) {
      return NextResponse.json(
        { error: CREDITS_EXHAUSTED_MESSAGE },
        { status: 403 }
      );
    }
  }

  let analysisContext: Record<string, unknown>;
  try {
    const details = JSON.parse(existing.improvements);
    analysisContext = {
      viralScore: existing.viralScore,
      whyViral: existing.whyViral,
      hookStrength: existing.hookStrength,
      retentionScore: existing.retentionScore,
      ctaScore: existing.ctaScore,
      viralTags: existing.viralTags,
      ...details,
    };
  } catch {
    analysisContext = {
      viralScore: existing.viralScore,
      whyViral: existing.whyViral,
      hookStrength: existing.hookStrength,
      retentionScore: existing.retentionScore,
      ctaScore: existing.ctaScore,
      viralTags: existing.viralTags,
    };
  }

  const scriptPrompt = buildPromptScript({
    platform: existing.platform,
    tone: existing.tone,
    format: existing.format,
    outputFormat: (existing.outputFormat ?? "Court") as OutputFormat,
    language: existing.language,
    niche: existing.niche ?? "général",
    personalStyle,
    videoTitle: existing.videoTitle ?? undefined,
    analysisContext: JSON.stringify(analysisContext, null, 2),
    variant: true,
  });

  const scriptCompletion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: scriptPrompt },
      {
        role: "user",
        content: "Génère une version différente du script maintenant.",
      },
    ],
    temperature: 0.9,
  });

  const script = scriptCompletion.choices[0]?.message?.content ?? "";
  const similarityScore = await computeSimilarityScore(script, personalStyle);

  const [updated] = await prisma.$transaction([
    prisma.analysis.update({
      where: { id: analysisId },
      data: { script, similarityScore },
    }),
    prisma.regeneration.create({
      data: { userId: dbUser.id, analysisId },
    }),
  ]);

  const quota = await getQuotaInfo(dbUser.id, dbUser.plan);

  return NextResponse.json({
    analysis: updated,
    quota,
  });
}
