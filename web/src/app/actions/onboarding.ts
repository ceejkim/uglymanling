"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type OnboardingActionState = {
  ok: boolean;
  error?: string;
};

const explorerSchema = z.object({
  city: z.string().min(2),
  intent: z.string().min(2),
  budget: z.string().min(2),
  timing: z.string().min(2),
});

const guideSchema = z.object({
  expertise: z.string().min(2),
  serviceType: z.string().min(2),
  priceRange: z.string().min(2),
  availability: z.string().min(2),
});

export async function saveExplorerOnboarding(
  _prev: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You must be logged in to continue." };
  }

  const parsed = explorerSchema.safeParse({
    city: formData.get("city"),
    intent: formData.get("intent"),
    budget: formData.get("budget"),
    timing: formData.get("timing"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Please complete all explorer onboarding fields." };
  }

  await prisma.explorerProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...parsed.data },
    update: parsed.data,
  });

  return { ok: true };
}

export async function saveGuideOnboarding(
  _prev: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You must be logged in to continue." };
  }

  const parsed = guideSchema.safeParse({
    expertise: formData.get("expertise"),
    serviceType: formData.get("serviceType"),
    priceRange: formData.get("priceRange"),
    availability: formData.get("availability"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Please complete all guide onboarding fields." };
  }

  await prisma.guideProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...parsed.data },
    update: parsed.data,
  });

  return { ok: true };
}
