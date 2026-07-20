import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getAuthUser, getOrCreateDbUser } from "@/lib/auth";
type Plan = "FREE" | "CREATOR" | "PRO";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_IDS: Record<string, string> = {
  creator: process.env.STRIPE_CREATOR_PRICE_ID!,
  pro: process.env.STRIPE_PRO_PRICE_ID!,
};

const PLAN_MAP: Record<string, Plan> = {
  creator: "CREATOR",
  pro: "PRO",
};

export async function GET(request: NextRequest) {
  const plan = request.nextUrl.searchParams.get("plan");

  if (!plan || !PRICE_IDS[plan]) {
    return NextResponse.json({ error: "Plan invalide." }, { status: 400 });
  }

  const supabaseUser = await getAuthUser(request);
  if (!supabaseUser) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const dbUser = await getOrCreateDbUser(supabaseUser);
  if (!dbUser) {
    return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
  }

  const origin = request.nextUrl.origin;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: dbUser.stripeCustomerId ?? undefined,
    customer_email: dbUser.stripeCustomerId ? undefined : dbUser.email,
    line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
    success_url: `${origin}/dashboard?upgraded=true`,
    cancel_url: `${origin}/dashboard?cancelled=true`,
    metadata: {
      supabaseId: dbUser.supabaseId,
      plan: PLAN_MAP[plan],
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Erreur Stripe." }, { status: 500 });
  }

  return NextResponse.redirect(session.url);
}

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();

    if (!plan || !PRICE_IDS[plan]) {
      return NextResponse.json({ error: "Plan invalide." }, { status: 400 });
    }

    const supabaseUser = await getAuthUser(request);
    if (!supabaseUser) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(supabaseUser);
    if (!dbUser) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    const origin = request.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: dbUser.stripeCustomerId ?? undefined,
      customer_email: dbUser.stripeCustomerId ? undefined : dbUser.email,
      line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
      success_url: `${origin}/dashboard?upgraded=true`,
      cancel_url: `${origin}/dashboard?cancelled=true`,
      metadata: {
        supabaseId: dbUser.supabaseId,
        plan: PLAN_MAP[plan],
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error("STRIPE CHECKOUT ERROR:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
