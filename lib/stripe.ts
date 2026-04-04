import "server-only";

import Stripe from "stripe";

const apiVersion = "2026-02-25.clover";

let stripeClient: Stripe | null = null;

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required Stripe environment variable: ${name}`);
  }

  return value;
}

export function getStripe() {
  if (!stripeClient) {
    stripeClient = new Stripe(getRequiredEnv("STRIPE_SECRET_KEY"), {
      apiVersion
    });
  }

  return stripeClient;
}

export function getStripePublishableKey() {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
}

export function getStripeWebhookSecret() {
  return getRequiredEnv("STRIPE_WEBHOOK_SECRET");
}

export function getStripePriceId(key: "community" | "consult" | "membership") {
  const priceMap = {
    community: process.env.STRIPE_PRICE_ID_COMMUNITY,
    consult: process.env.STRIPE_PRICE_ID_CONSULT,
    membership: process.env.STRIPE_PRICE_ID_MEMBERSHIP
  };

  const priceId = priceMap[key];

  if (!priceId) {
    throw new Error(`Missing Stripe price configuration for ${key}`);
  }

  return priceId;
}
