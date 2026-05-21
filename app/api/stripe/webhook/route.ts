import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";
import { captureServerEvent } from "@/lib/posthog-server";

function getCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null) {
  if (!customer) {
    return undefined;
  }

  return typeof customer === "string" ? customer : customer.id;
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const payload = await request.text();
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      getStripeWebhookSecret()
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await captureServerEvent({
          distinctId:
            session.client_reference_id ??
            session.metadata?.clerk_user_id ??
            getCustomerId(session.customer) ??
            session.id,
          event: "payment_completed",
          properties: {
            session_id: session.id,
            amount_total: session.amount_total,
            currency: session.currency,
            price_lookup_key: session.metadata?.price_lookup_key,
            clerk_user_id: session.metadata?.clerk_user_id
          }
        });
        // TODO: Persist event state to the Ugly Manling database once Supabase is added.
        break;
      }
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        await captureServerEvent({
          distinctId:
            subscription.metadata?.clerk_user_id ??
            getCustomerId(subscription.customer) ??
            subscription.id,
          event: "subscription_created",
          properties: {
            subscription_id: subscription.id,
            status: subscription.status
          }
        });
        // TODO: Persist event state to the Ugly Manling database once Supabase is added.
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await captureServerEvent({
          distinctId:
            subscription.metadata?.clerk_user_id ??
            getCustomerId(subscription.customer) ??
            subscription.id,
          event: "subscription_cancelled",
          properties: {
            subscription_id: subscription.id,
            status: subscription.status
          }
        });
        // TODO: Persist event state to the Ugly Manling database once Supabase is added.
        break;
      }
      case "customer.subscription.updated":
      case "invoice.paid":
      case "invoice.payment_failed":
        // TODO: Persist event state to the Ugly Manling database once Supabase is added.
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true, type: event.type });
  } catch (error) {
    const message =
      error instanceof Stripe.errors.StripeError
        ? error.message
        : "Webhook verification failed";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
