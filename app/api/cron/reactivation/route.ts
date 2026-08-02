import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const eightDaysAgo = new Date()
  eightDaysAgo.setDate(eightDaysAgo.getDate() - 8)

  const inactiveUsers = await prisma.user.findMany({
    where: {
      analyses: {
        none: { createdAt: { gte: sevenDaysAgo } },
        some: { createdAt: { gte: eightDaysAgo } }
      }
    }
  })

  let sent = 0
  for (const user of inactiveUsers) {
    if (!user.email) continue
    await resend.emails.send({
      from: "Viralyz <hello@viralyz.io>",
      to: user.email,
      subject: "Tu nous manques sur Viralyz 👀",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #F8F8FF; padding: 40px; border-radius: 16px;">
          <h2 style="color: #F8F8FF;">Ça fait 7 jours... 👀</h2>
          <p style="color: #8B8B9E;">Tu n'as pas analysé de vidéo depuis une semaine. Les créateurs qui analysent régulièrement progressent 3x plus vite.</p>
          <div style="background: #13131A; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="color: #F8F8FF; margin: 0;">💡 Prends 2 minutes aujourd'hui pour analyser une vidéo virale dans ta niche. Ton prochain script n'attend que toi.</p>
          </div>
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://viralyz-xi.vercel.app/dashboard" style="background: #7C3AED; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;">
              Analyser maintenant →
            </a>
          </div>
        </div>
      `
    })
    sent++
  }

  return NextResponse.json({ sent })
}
