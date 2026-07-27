import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

type Plan = "FREE" | "CREATOR" | "PRO";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  switch (event.type) {

    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const supabaseId = session.metadata?.supabaseId;
      const plan = session.metadata?.plan as Plan | undefined;

      if (supabaseId && plan) {
        const user = await prisma.user.update({
          where: { supabaseId },
          data: {
            plan,
            stripeCustomerId: session.customer as string,
          },
        });

        // Email de confirmation d'upgrade
        if (user.email) {
          const planLabel = plan === "CREATOR" ? "Creator" : "Pro";
          const credits = plan === "CREATOR" ? "20" : "50";
          await resend.emails.send({
            from: "Viralyz <hello@viralyz.io>",
            to: user.email,
            subject: `🎉 Bienvenue sur le plan ${planLabel} !`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #F8F8FF; padding: 40px; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 32px;">
                  <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: #7C3AED; border-radius: 12px; font-size: 20px; font-weight: bold; color: white;">V</div>
                  <h1 style="color: #F8F8FF; margin-top: 16px;">Viralyz</h1>
                </div>
                <h2 style="color: #F8F8FF;">Plan ${planLabel} activé ! 🚀</h2>
                <p style="color: #8B8B9E; line-height: 1.6;">
                  Tu as maintenant accès à <strong style="color: #7C3AED;">${credits} crédits par mois</strong> et à toutes les fonctionnalités du plan ${planLabel}.
                </p>
                <div style="background: #13131A; border: 1px solid #1E1E2E; border-radius: 12px; padding: 24px; margin: 24px 0;">
                  <h3 style="color: #F8F8FF; margin-top: 0;">Ce qui est débloqué :</h3>
                  <ul style="color: #8B8B9E; line-height: 2;">
                    ${plan === "CREATOR" ? `
                    <li>✅ 20 analyses par mois</li>
                    <li>✅ Analyse complète avec hook, rétention, CTA</li>
                    <li>✅ 5 hooks alternatifs</li>
                    <li>✅ Structure narrative détaillée</li>
                    <li>✅ Miniature + métriques YouTube</li>
                    ` : `
                    <li>✅ 50 analyses par mois</li>
                    <li>✅ Analyse ultra-détaillée</li>
                    <li>✅ 10 hooks alternatifs</li>
                    <li>✅ Plan de tournage complet</li>
                    <li>✅ Checklist et prompt IA</li>
                    `}
                  </ul>
                </div>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="https://viralyz-xi.vercel.app/dashboard" 
                     style="background: #7C3AED; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;">
                    Analyser ma première vidéo →
                  </a>
                </div>
              </div>
            `,
          });
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
      });

      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: { plan: "FREE" },
      });

      // Email d'annulation
      if (user?.email) {
        await resend.emails.send({
          from: "Viralyz <hello@viralyz.io>",
          to: user.email,
          subject: "Ton abonnement Viralyz a été annulé",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #F8F8FF; padding: 40px; border-radius: 16px;">
              <h2 style="color: #F8F8FF;">Abonnement annulé</h2>
              <p style="color: #8B8B9E; line-height: 1.6;">
                Ton abonnement a été annulé. Tu repasses sur le plan gratuit avec 2 crédits par mois.
              </p>
              <p style="color: #8B8B9E;">Tu peux te réabonner à tout moment depuis ton dashboard.</p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://viralyz-xi.vercel.app/dashboard" 
                   style="background: #7C3AED; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;">
                  Retourner sur Viralyz
                </a>
              </div>
            </div>
          `,
        });
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (user?.email) {
        await resend.emails.send({
          from: "Viralyz <hello@viralyz.io>",
          to: user.email,
          subject: "⚠️ Problème de paiement sur ton compte Viralyz",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #F8F8FF; padding: 40px; border-radius: 16px;">
              <h2 style="color: #F8F8FF;">Paiement échoué ⚠️</h2>
              <p style="color: #8B8B9E; line-height: 1.6;">
                Nous n'avons pas pu prélever ton abonnement Viralyz. 
                Mets à jour ta carte bancaire pour continuer à profiter de toutes les fonctionnalités.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://viralyz-xi.vercel.app/dashboard" 
                   style="background: #7C3AED; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;">
                  Mettre à jour ma carte →
                </a>
              </div>
            </div>
          `,
        });
      }
      break;
    }

  }

  return NextResponse.json({ received: true });
}