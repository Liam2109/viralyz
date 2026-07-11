import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import type { Plan } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
        await prisma.user.update({
          where: { supabaseId },
          data: {
            plan,
            stripeCustomerId: session.customer as string,
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: { plan: "FREE" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
