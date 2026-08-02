import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, getOrCreateDbUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const supabaseUser = await getAuthUser(request)
    if (!supabaseUser) return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
    const dbUser = await getOrCreateDbUser(supabaseUser)
    if (!dbUser) return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 })

    const profile = await prisma.userProfile.findUnique({
      where: { userId: dbUser.id },
    })

    const badges = await prisma.badge.findMany({ where: { userId: dbUser.id } })
    const quests = await prisma.quest.findMany({ where: { userId: dbUser.id } })

    const totalAnalyses = await prisma.analysis.count({ where: { userId: dbUser.id } })

    return NextResponse.json({
      profile: profile ? { ...profile, badges, quests } : null,
      totalAnalyses,
      plan: dbUser.plan,
      email: dbUser.email,
      name: dbUser.name,
      createdAt: dbUser.createdAt,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
