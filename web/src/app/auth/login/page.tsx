"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldLabel, TextField } from "@/components/ui/field";
import { type AuthActionState, loginWithCredentials } from "@/app/actions/auth";

const initialState: AuthActionState = { ok: false };

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginWithCredentials, initialState);

  useEffect(() => {
    if (state.ok && state.nextPath) {
      router.push(state.nextPath);
    }
  }, [router, state]);

  return (
    <Card className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Sign in with your account to continue conversations and experiences.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <TextField id="email" name="email" required type="email" placeholder="alex@example.com" />
        </div>

        <div>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <TextField id="password" name="password" required type="password" />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Logging in..." : "Log In"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-[var(--color-muted)]">
        New to Rekkoe?{" "}
        <Link href="/auth/signup" className="font-semibold text-[var(--color-ink)]">
          Create an account
        </Link>
      </p>
    </Card>
  );
}
