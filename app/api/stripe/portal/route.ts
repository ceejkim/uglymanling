import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { captureServerEvent } from "@/lib/posthog-server";

type PortalRequestBody = {
  customerId?: string;
  returnPath?: string;
};

function buildAbsoluteUrl(request: Request, path: string) {
  return new URL(path, request.url).toString();
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: PortalRequestBody = {};

  try {
    body = (await request.json()) as PortalRequestBody;
  } catch {
    body = {};
  }

  if (!body.customerId) {
    return NextResponse.json(
      {
        error: "Missing customerId",
        message:
          "Customer Portal is scaffolded, but Ugly Manling still needs a stored Stripe customer ID per user before this route can be activated."
      },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: body.customerId,
      return_url: buildAbsoluteUrl(request, body.returnPath ?? "/community")
    });

    await captureServerEvent({
      distinctId: userId,
      event: "portal_session_created",
      properties: {
        customer_id: body.customerId
      }
    });

    return NextResponse.json({ portalUrl: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create portal session";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
