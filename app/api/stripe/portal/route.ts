import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAuthUser, getOrCreateDbUser } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const supabaseUser = await getAuthUser(request);
    if (!supabaseUser) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(supabaseUser);
    if (!dbUser) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    if (!dbUser.stripeCustomerId) {
      return NextResponse.json({ error: "Aucun abonnement actif." }, { status: 400 });
    }

    const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL!;

    const session = await stripe.billingPortal.sessions.create({
      customer: dbUser.stripeCustomerId,
      return_url: `${origin}/dashboard`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error("STRIPE PORTAL ERROR:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}