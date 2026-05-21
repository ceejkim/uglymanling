import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getStripe, getStripePriceId } from "@/lib/stripe";
import { captureServerEvent } from "@/lib/posthog-server";

type CheckoutRequestBody = {
  cancelPath?: string;
  mode?: "payment" | "subscription";
  priceLookupKey?: "community" | "consult" | "membership";
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

  try {
    const stripe = getStripe();
    const priceId = getStripePriceId(priceLookupKey);

    const session = await stripe.checkout.sessions.create({
      allow_promotion_codes: true,
      cancel_url: buildAbsoluteUrl(request, cancelPath),
      client_reference_id: userId,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        clerk_user_id: userId,
        price_lookup_key: priceLookupKey
      },
      mode,
      success_url: buildAbsoluteUrl(
        request,
        `${successPath}${successPath.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`
      )
    });

    await captureServerEvent({
      distinctId: userId,
      event: "checkout_session_created",
      properties: {
        price_lookup_key: priceLookupKey,
        mode,
        session_id: session.id
      }
    });

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
