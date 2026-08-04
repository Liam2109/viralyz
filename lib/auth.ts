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

  // Cherche d'abord par supabaseId
  const existingById = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
  })

  if (existingById) {
    return prisma.user.update({
      where: { supabaseId: supabaseUser.id },
      data: {
        email,
        name: supabaseUser.user_metadata?.name ?? undefined,
        niche: supabaseUser.user_metadata?.niche ?? undefined,
      },
    })
  }

  // Cherche par email
  const existingByEmail = await prisma.user.findUnique({
    where: { email },
  })

  if (existingByEmail) {
    return prisma.user.update({
      where: { email },
      data: {
        supabaseId: supabaseUser.id,
        name: supabaseUser.user_metadata?.name ?? undefined,
        niche: supabaseUser.user_metadata?.niche ?? undefined,
      },
    })
  }

  // Crée un nouveau user
  return prisma.user.create({
    data: {
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

export interface YouTubeVideoData {
  videoId: string
  title: string
  thumbnail: string
  views: number
  likes: number
  comments: number
  duration: string
  publishedAt: string
  channelName: string
  description: string
}

export async function fetchYouTubeData(videoUrl: string): Promise<YouTubeVideoData | null> {
  const match = videoUrl.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  if (!match) return null

  const videoId = match[1]
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return null

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`
  )

  if (!res.ok) return null

  const data = await res.json()
  const item = data.items?.[0]
  if (!item) return null

  const snippet = item.snippet
  const stats = item.statistics
  const details = item.contentDetails

  const duration = details?.duration ?? "PT0S"
  const match2 = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  const hours = parseInt(match2?.[1] ?? "0")
  const minutes = parseInt(match2?.[2] ?? "0")
  const seconds = parseInt(match2?.[3] ?? "0")
  const durationStr = hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${minutes}:${String(seconds).padStart(2, "0")}`

  return {
    videoId,
    title: snippet?.title ?? "Inconnu",
    thumbnail: snippet?.thumbnails?.maxres?.url ?? snippet?.thumbnails?.high?.url ?? "",
    views: parseInt(stats?.viewCount ?? "0"),
    likes: parseInt(stats?.likeCount ?? "0"),
    comments: parseInt(stats?.commentCount ?? "0"),
    duration: durationStr,
    publishedAt: snippet?.publishedAt ?? "",
    channelName: snippet?.channelTitle ?? "Inconnu",
    description: snippet?.description?.slice(0, 500) ?? "",
  }
}

export async function fetchYouTubeTitle(videoUrl: string): Promise<string | null> {
  const data = await fetchYouTubeData(videoUrl)
  return data?.title ?? null
}