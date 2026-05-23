import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getStripe, getStripePriceId } from "@/lib/stripe";
import { captureServerEvent } from "@/lib/posthog-server";

type CheckoutRequestBody = {
  assessmentSessionId?: string;
  cancelPath?: string;
  entrySource?: string;
  mode?: "payment" | "subscription";
  offerVariant?: string;
  priceLookupKey?: "community" | "consult" | "membership";
  resultVersion?: string;
  successPath?: string;
};

function buildAbsoluteUrl(request: Request, path: string) {
  return new URL(path, request.url).toString();
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CheckoutRequestBody = {};

  try {
    body = (await request.json()) as CheckoutRequestBody;
  } catch {
    body = {};
  }

  const mode = body.mode ?? "payment";
  const priceLookupKey =
    body.priceLookupKey ?? (mode === "subscription" ? "membership" : "consult");
  const successPath = body.successPath ?? "/community?checkout=success";
  const cancelPath = body.cancelPath ?? "/community?checkout=cancelled";
  const entrySource = body.entrySource ?? "unknown";

  try {
    const stripe = getStripe();
    const priceId = getStripePriceId(priceLookupKey);
    const metadata = {
      assessment_session_id: body.assessmentSessionId ?? "",
      clerk_user_id: userId,
      entry_source: entrySource,
      offer_variant: body.offerVariant ?? "",
      price_lookup_key: priceLookupKey,
      result_version: body.resultVersion ?? ""
    };

    const session = await stripe.checkout.sessions.create({
      allow_promotion_codes: true,
      cancel_url: buildAbsoluteUrl(request, cancelPath),
      client_reference_id: userId,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata,
      mode,
      subscription_data:
        mode === "subscription"
          ? {
              metadata
            }
          : undefined,
      success_url: buildAbsoluteUrl(
        request,
        `${successPath}${successPath.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`
      )
    });

    await captureServerEvent({
      distinctId: userId,
      event: "stripe_checkout_started",
      properties: {
        assessment_session_id: body.assessmentSessionId ?? null,
        entry_source: entrySource,
        price_lookup_key: priceLookupKey,
        mode,
        offer_variant: body.offerVariant ?? null,
        session_id: session.id
      }
    });

    if (priceLookupKey === "membership" || mode === "subscription") {
      await captureServerEvent({
        distinctId: userId,
        event: "membership_checkout_started",
        properties: {
          assessment_session_id: body.assessmentSessionId ?? null,
          entry_source: entrySource,
          offer_variant: body.offerVariant ?? null,
          price_lookup_key: priceLookupKey,
          result_version: body.resultVersion ?? null,
          session_id: session.id
        }
      });
    }

    return NextResponse.json({ checkoutUrl: session.url, sessionId: session.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create checkout session";

    return NextResponse.json(
      {
        error: message,
        message:
          "Stripe checkout is scaffolded, but it still needs live env values and product mapping before activation."
      },
      { status: 500 }
    );
  }
}
