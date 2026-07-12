import { createClient } from "@supabase/supabase-js"
import { prisma } from "./prisma"
type Plan = "FREE" | "CREATOR" | "PRO"

export async function getAuthUser(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")
    if (!token) return null

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    )

    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return null
    return user
  } catch (err) {
    console.error("ERREUR getAuthUser:", err)
    return null
  }
}

export async function getOrCreateDbUser(supabaseUser: {
  id: string
  email?: string
  user_metadata?: { name?: string; niche?: string }
}) {
  const email = supabaseUser.email
  if (!email) return null

  return prisma.user.upsert({
    where: { supabaseId: supabaseUser.id },
    update: {
      email,
      name: supabaseUser.user_metadata?.name ?? undefined,
      niche: supabaseUser.user_metadata?.niche ?? undefined,
    },
    create: {
      supabaseId: supabaseUser.id,
      email,
      name: supabaseUser.user_metadata?.name ?? null,
      niche: supabaseUser.user_metadata?.niche ?? null,
      plan: "FREE",
    },
  })
}

export const PLAN_LIMITS: Record<Plan, number | null> = {
  FREE: 2,
  CREATOR: 50,
  PRO: null,
}

export const CREDITS_EXHAUSTED_MESSAGE =
  "Vous avez utilisé tous vos crédits ce mois. Rechargez avec le plan Creator."

export async function getMonthlyUsage(userId: string) {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [analyses, regenerations] = await Promise.all([
    prisma.analysis.count({
      where: { userId, createdAt: { gte: startOfMonth } },
    }),
    prisma.regeneration.count({
      where: { userId, createdAt: { gte: startOfMonth } },
    }),
  ])

  return analyses + regenerations
}

export async function getQuotaInfo(userId: string, plan: Plan) {
  const used = await getMonthlyUsage(userId)
  const limit = PLAN_LIMITS[plan]

  return {
    plan,
    used,
    limit,
    remaining: limit !== null ? Math.max(0, limit - used) : null,
  }
}

export async function fetchYouTubeTitle(videoUrl: string): Promise<string | null> {
  const match = videoUrl.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  if (!match) return null

  const videoId = match[1]
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return null

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
  )

  if (!res.ok) return null

  const data = await res.json()
  return data.items?.[0]?.snippet?.title ?? null
}