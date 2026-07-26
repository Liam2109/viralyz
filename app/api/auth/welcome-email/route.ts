import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    await resend.emails.send({
      from: "Viralyz <hello@viralyz.io>",
      to: email,
      subject: "Bienvenue sur Viralyz 🎉",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #F8F8FF; padding: 40px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: #7C3AED; border-radius: 12px; font-size: 20px; font-weight: bold; color: white;">V</div>
            <h1 style="color: #F8F8FF; margin-top: 16px;">Viralyz</h1>
          </div>
          
          <h2 style="color: #F8F8FF;">Bienvenue ${name} ! 🚀</h2>
          
          <p style="color: #8B8B9E; line-height: 1.6;">
            Ton compte Viralyz est prêt. Tu as <strong style="color: #7C3AED;">2 crédits gratuits</strong> ce mois pour analyser tes premières vidéos virales.
          </p>

          <div style="background: #13131A; border: 1px solid #1E1E2E; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="color: #F8F8FF; margin-top: 0;">Comment commencer :</h3>
            <ol style="color: #8B8B9E; line-height: 2;">
              <li>Trouve une vidéo virale dans ta niche sur YouTube</li>
              <li>Colle l'URL dans Viralyz</li>
              <li>Reçois l'analyse complète + ton script en 30 secondes</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="https://viralyz-xi.vercel.app/dashboard" 
               style="background: #7C3AED; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;">
              Analyser ma première vidéo →
            </a>
          </div>

          <p style="color: #4A4A5E; font-size: 12px; text-align: center; margin-top: 32px;">
            © 2025 Viralyz — Tu reçois cet email car tu viens de créer un compte.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Email error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}