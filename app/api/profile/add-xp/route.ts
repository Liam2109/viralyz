import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, getOrCreateDbUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const supabaseUser = await getAuthUser(request)
    if (!supabaseUser) return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
    const dbUser = await getOrCreateDbUser(supabaseUser)
    if (!dbUser) return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 })

    const { xp, type } = await request.json()

    let profile = await prisma.userProfile.findUnique({ where: { userId: dbUser.id } })
    if (!profile) {
      profile = await prisma.userProfile.create({ data: { userId: dbUser.id, xp: 0 } })
    }

    const newXp = profile.xp + xp
    const newLevel = Math.floor(newXp / 100) + 1

    // Mise à jour streak
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const lastActive = profile.lastActiveDate ? new Date(profile.lastActiveDate) : null
    lastActive?.setHours(0, 0, 0, 0)

    const isConsecutive = lastActive && (today.getTime() - lastActive.getTime()) === 86400000
    const isToday = lastActive && today.getTime() === lastActive.getTime()

    let newStreak = profile.streak
    let newTotalDays = profile.totalDaysActive
    if (!isToday) {
      newStreak = isConsecutive ? profile.streak + 1 : 1
      newTotalDays = profile.totalDaysActive + 1
    }

    const longestStreak = Math.max(profile.longestStreak, newStreak)

    const updated = await prisma.userProfile.update({
      where: { userId: dbUser.id },
      data: { xp: newXp, level: newLevel, streak: newStreak, longestStreak, lastActiveDate: new Date(), totalDaysActive: newTotalDays }
    })

    // Vérification badges automatiques
    const totalAnalyses = await prisma.analysis.count({ where: { userId: dbUser.id } })
    
    const badgesToCheck = [
      { type: "first_analysis", condition: totalAnalyses >= 1, label: "Première analyse", emoji: "🔬" },
      { type: "analyses_10", condition: totalAnalyses >= 10, label: "Analyste", emoji: "📊" },
      { type: "analyses_50", condition: totalAnalyses >= 50, label: "Expert", emoji: "🏆" },
      { type: "streak_3", condition: newStreak >= 3, label: "En feu", emoji: "🔥" },
      { type: "streak_7", condition: newStreak >= 7, label: "Régulier", emoji: "⚡" },
      { type: "streak_30", condition: newStreak >= 30, label: "Dévoué", emoji: "💎" },
    ]

    const newBadges = []
    for (const badge of badgesToCheck) {
      if (badge.condition) {
        const exists = await prisma.badge.findFirst({ where: { userId: dbUser.id, type: badge.type } })
        if (!exists) {
          const newBadge = await prisma.badge.create({
            data: { userId: dbUser.id, type: badge.type, label: badge.label, emoji: badge.emoji }
          })
          newBadges.push(newBadge)
        }
      }
    }

    // Mise à jour quêtes
    if (type === "analysis") {
      if (totalAnalyses >= 1) {
        await prisma.quest.updateMany({ where: { userId: dbUser.id, type: "first_analysis", completed: false }, data: { completed: true, completedAt: new Date() } })
      }
      if (totalAnalyses >= 3) {
        await prisma.quest.updateMany({ where: { userId: dbUser.id, type: "analyses_3", completed: false }, data: { completed: true, completedAt: new Date() } })
      }
      if (totalAnalyses >= 10) {
        await prisma.quest.updateMany({ where: { userId: dbUser.id, type: "analyses_10", completed: false }, data: { completed: true, completedAt: new Date() } })
      }
    }

    return NextResponse.json({ profile: updated, newBadges, newXp, newLevel, newStreak })
  } catch (error) {
    console.error("ADD XP ERROR:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
