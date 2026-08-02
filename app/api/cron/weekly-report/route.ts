import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const users = await prisma.user.findMany({
    where: { analyses: { some: { createdAt: { gte: oneWeekAgo } } } },
    include: {
      analyses: { where: { createdAt: { gte: oneWeekAgo } }, orderBy: { viralScore: "desc" }, take: 3 }
    }
  })

  let sent = 0
  for (const user of users) {
    if (!user.email || user.analyses.length === 0) continue
    const avgScore = Math.round(user.analyses.reduce((a, b) => a + b.viralScore, 0) / user.analyses.length)
    
    await resend.emails.send({
      from: "Viralyz <hello@viralyz.io>",
      to: user.email,
      subject: `📊 Ton rapport Viralyz de la semaine`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #F8F8FF; padding: 40px; border-radius: 16px;">
          <h2 style="color: #F8F8FF;">Ton rapport de la semaine 📊</h2>
          <p style="color: #8B8B9E;">Cette semaine tu as analysé <strong style="color: #7C3AED;">${user.analyses.length} vidéo${user.analyses.length > 1 ? "s" : ""}</strong> avec un score viral moyen de <strong style="color: #7C3AED;">${avgScore}/100</strong>.</p>
          <div style="background: #13131A; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #F8F8FF; margin-top: 0;">Tes meilleures analyses :</h3>
            ${user.analyses.map(a => `
              <div style="border-bottom: 1px solid #1E1E2E; padding: 10px 0;">
                <p style="color: #F8F8FF; margin: 0; font-size: 14px;">${a.videoTitle ?? "Vidéo analysée"}</p>
                <p style="color: #7C3AED; margin: 4px 0 0; font-size: 12px;">Score : ${a.viralScore}/100</p>
              </div>
            `).join("")}
          </div>
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://viralyz-xi.vercel.app/dashboard" style="background: #7C3AED; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;">
              Continuer à analyser →
            </a>
          </div>
        </div>
      `
    })
    sent++
  }

  return NextResponse.json({ sent })
}
