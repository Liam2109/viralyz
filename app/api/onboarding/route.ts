import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, getOrCreateDbUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const supabaseUser = await getAuthUser(request)
    if (!supabaseUser) return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
    const dbUser = await getOrCreateDbUser(supabaseUser)
    if (!dbUser) return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 })

    const body = await request.json()
    const { experience, platform, videosPerWeek, averageViews, objective, niche, hoursPerWeek } = body

    // Calcul du score de départ
    let startScore = 0
    if (experience === "avance") startScore += 30
    else if (experience === "confirme") startScore += 20
    else startScore += 10
    if (averageViews > 10000) startScore += 25
    else if (averageViews > 1000) startScore += 15
    else startScore += 5
    if (videosPerWeek >= 5) startScore += 20
    else if (videosPerWeek >= 2) startScore += 10
    else startScore += 5
    if (hoursPerWeek >= 10) startScore += 15
    else if (hoursPerWeek >= 5) startScore += 10
    else startScore += 5

    const profile = await prisma.userProfile.upsert({
      where: { userId: dbUser.id },
      update: { experience, platform, videosPerWeek, averageViews, objective, niche, hoursPerWeek, startScore, onboardingDone: true },
      create: { userId: dbUser.id, experience, platform, videosPerWeek, averageViews, objective, niche, hoursPerWeek, startScore, onboardingDone: true, xp: 10 },
    })

    // Badge premier onboarding
    const existingBadge = await prisma.badge.findFirst({ where: { userId: dbUser.id, type: "onboarding_complete" } })
    if (!existingBadge) {
      await prisma.badge.create({
        data: { userId: dbUser.id, type: "onboarding_complete", label: "Premier pas", emoji: "🚀" }
      })
    }

    // Quêtes de départ
    const questTypes = ["first_analysis", "analyses_3", "analyses_10", "streak_3", "streak_7", "profile_complete"]
    for (const type of questTypes) {
      const exists = await prisma.quest.findFirst({ where: { userId: dbUser.id, type } })
      if (!exists) {
        const questData: Record<string, { label: string; xpReward: number }> = {
          first_analysis: { label: "Faire ta première analyse", xpReward: 20 },
          analyses_3: { label: "Analyser 3 vidéos", xpReward: 30 },
          analyses_10: { label: "Analyser 10 vidéos", xpReward: 100 },
          streak_3: { label: "Revenir 3 jours de suite", xpReward: 50 },
          streak_7: { label: "Revenir 7 jours de suite", xpReward: 150 },
          profile_complete: { label: "Compléter ton profil", xpReward: 20 },
        }
        await prisma.quest.create({
          data: { userId: dbUser.id, type, label: questData[type].label, xpReward: questData[type].xpReward }
        })
      }
    }

    return NextResponse.json({ profile, startScore })
  } catch (error) {
    console.error("ONBOARDING ERROR:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
