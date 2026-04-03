"use server";

import { hash } from "bcryptjs";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["explorer", "guide"]),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type AuthActionState = {
  ok: boolean;
  error?: string;
  nextPath?: string;
};

export async function signupWithCredentials(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Please provide valid signup details." };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const passwordHash = await hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      role: parsed.data.role,
    },
  });

  const signInResult = await signIn("credentials", {
    email,
    password: parsed.data.password,
    redirect: false,
  });

  if (signInResult?.error) {
    return { ok: false, error: "Account created, but automatic login failed." };
  }

  return {
    ok: true,
    nextPath: parsed.data.role === "guide" ? "/onboarding/guide" : "/onboarding/explorer",
  };
}

export async function loginWithCredentials(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Please provide a valid email and password." };
  }

  const signInResult = await signIn("credentials", {
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
    redirect: false,
  });

  if (signInResult?.error) {
    return { ok: false, error: "Invalid email or password." };
  }

  return { ok: true, nextPath: "/chat" };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
