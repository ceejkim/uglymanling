import { NextResponse } from "next/server";
import Stripe from "stripe";
import { syncSignedInUser } from "@/lib/clerk-supabase";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";
import { captureServerEvent } from "@/lib/posthog-server";
import { upsertSupabaseRow } from "@/lib/supabase";

function getCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null) {
  if (!customer) {
    return undefined;
  }

  return typeof customer === "string" ? customer : customer.id;
}

function getSubscriptionCurrentPeriodEnd(subscription: Stripe.Subscription) {
  return (subscription as Stripe.Subscription & { current_period_end?: number | null })
    .current_period_end;
}

async function persistSubscriptionState({
  assessmentSessionId,
  cancelAtPeriodEnd,
  checkoutSessionId,
  clerkUserId,
  currentPeriodEnd,
  customerId,
  priceLookupKey,
  status,
  subscriptionId
}: {
  assessmentSessionId?: string | null;
  cancelAtPeriodEnd?: boolean;
  checkoutSessionId?: string | null;
  clerkUserId?: string | null;
  currentPeriodEnd?: number | null;
  customerId?: string | null;
  priceLookupKey?: string | null;
  status: string;
  subscriptionId: string;
}) {
  if (!customerId || !clerkUserId || !priceLookupKey) {
    return;
  }

  await syncSignedInUser(clerkUserId);

  await upsertSupabaseRow({
    table: "subscriptions",
    values: {
      assessment_session_id: assessmentSessionId ?? null,
      cancel_at_period_end: cancelAtPeriodEnd ?? false,
      clerk_user_id: clerkUserId,
      current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
      price_lookup_key: priceLookupKey,
      status,
      stripe_checkout_session_id: checkoutSessionId ?? null,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId
    },
    onConflict: "stripe_customer_id"
  });
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
        const customerId = getCustomerId(session.customer);
        const isMembership = session.metadata?.price_lookup_key === "membership";
        await captureServerEvent({
          distinctId:
            session.client_reference_id ??
            session.metadata?.clerk_user_id ??
            customerId ??
            session.id,
          event: "payment_completed",
          properties: {
            assessment_session_id: session.metadata?.assessment_session_id,
            session_id: session.id,
            amount_total: session.amount_total,
            currency: session.currency,
            price_lookup_key: session.metadata?.price_lookup_key,
            clerk_user_id: session.metadata?.clerk_user_id
          }
        });

        if (isMembership) {
          await captureServerEvent({
            distinctId:
              session.client_reference_id ??
              session.metadata?.clerk_user_id ??
              customerId ??
              session.id,
            event: "membership_checkout_completed",
            properties: {
              assessment_session_id: session.metadata?.assessment_session_id,
              session_id: session.id,
              price_lookup_key: session.metadata?.price_lookup_key
            }
          });
        }

        if (typeof session.subscription === "string") {
          await persistSubscriptionState({
            assessmentSessionId: session.metadata?.assessment_session_id ?? null,
            checkoutSessionId: session.id,
            clerkUserId: session.metadata?.clerk_user_id ?? null,
            customerId,
            priceLookupKey: session.metadata?.price_lookup_key ?? null,
            status: session.payment_status ?? "complete",
            subscriptionId: session.subscription
          });
        }
        break;
      }
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = getCustomerId(subscription.customer);
        await captureServerEvent({
          distinctId:
            subscription.metadata?.clerk_user_id ??
            customerId ??
            subscription.id,
          event: "subscription_created",
          properties: {
            subscription_id: subscription.id,
            status: subscription.status
          }
        });

        await captureServerEvent({
          distinctId:
            subscription.metadata?.clerk_user_id ??
            customerId ??
            subscription.id,
          event: "membership_subscription_activated",
          properties: {
            assessment_session_id: subscription.metadata?.assessment_session_id,
            subscription_id: subscription.id,
            status: subscription.status
          }
        });

        await persistSubscriptionState({
          assessmentSessionId: subscription.metadata?.assessment_session_id ?? null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          clerkUserId: subscription.metadata?.clerk_user_id ?? null,
          currentPeriodEnd: getSubscriptionCurrentPeriodEnd(subscription),
          customerId,
          priceLookupKey: subscription.metadata?.price_lookup_key ?? null,
          status: subscription.status,
          subscriptionId: subscription.id
        });
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = getCustomerId(subscription.customer);
        await captureServerEvent({
          distinctId:
            subscription.metadata?.clerk_user_id ??
            customerId ??
            subscription.id,
          event: "subscription_cancelled",
          properties: {
            subscription_id: subscription.id,
            status: subscription.status
          }
        });

        await captureServerEvent({
          distinctId:
            subscription.metadata?.clerk_user_id ??
            customerId ??
            subscription.id,
          event: "membership_subscription_cancelled",
          properties: {
            assessment_session_id: subscription.metadata?.assessment_session_id,
            subscription_id: subscription.id,
            status: subscription.status
          }
        });

        await persistSubscriptionState({
          assessmentSessionId: subscription.metadata?.assessment_session_id ?? null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          clerkUserId: subscription.metadata?.clerk_user_id ?? null,
          currentPeriodEnd: getSubscriptionCurrentPeriodEnd(subscription),
          customerId,
          priceLookupKey: subscription.metadata?.price_lookup_key ?? null,
          status: subscription.status,
          subscriptionId: subscription.id
        });
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await persistSubscriptionState({
          assessmentSessionId: subscription.metadata?.assessment_session_id ?? null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          clerkUserId: subscription.metadata?.clerk_user_id ?? null,
          currentPeriodEnd: getSubscriptionCurrentPeriodEnd(subscription),
          customerId: getCustomerId(subscription.customer),
          priceLookupKey: subscription.metadata?.price_lookup_key ?? null,
          status: subscription.status,
          subscriptionId: subscription.id
        });
        break;
      }
      case "invoice.paid":
      case "invoice.payment_failed":
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
