"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldLabel, SelectField, TextField } from "@/components/ui/field";
import { trackEvent } from "@/lib/analytics";
import { type AuthActionState, signupWithCredentials } from "@/app/actions/auth";

const initialState: AuthActionState = { ok: false };

export default function SignupPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signupWithCredentials, initialState);

  useEffect(() => {
    trackEvent("signup_started", { entry: "signup_page" });
  }, []);

  useEffect(() => {
    if (state.ok && state.nextPath) {
      trackEvent("signup_completed");
      router.push(state.nextPath);
    }
  }, [router, state]);

  return (
    <Card className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight">Create your Rekkoe account</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Create your account with email and password, then complete role onboarding.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <TextField id="name" name="name" required placeholder="Jamie Carter" />
        </div>

        <div>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <TextField id="email" name="email" required type="email" placeholder="jamie@example.com" />
        </div>

        <div>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <TextField id="password" name="password" required type="password" />
        </div>

        <div>
          <FieldLabel htmlFor="role">I am joining as</FieldLabel>
          <SelectField id="role" name="role" defaultValue="explorer">
            <option value="explorer">Explorer</option>
            <option value="guide">Guide</option>
          </SelectField>
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Creating account..." : "Continue to onboarding"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-[var(--color-muted)]">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-[var(--color-ink)]">
          Log in
        </Link>
      </p>
    </Card>
  );
}
