"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldLabel, SelectField, TextField } from "@/components/ui/field";
import { trackEvent } from "@/lib/analytics";
import { saveSession, type UserRole } from "@/lib/session";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>(() => {
    if (typeof window === "undefined") {
      return "explorer";
    }
    const params = new URLSearchParams(window.location.search);
    return params.get("role") === "guide" ? "guide" : "explorer";
  });

  useEffect(() => {
    trackEvent("signup_started", { entry: "signup_page" });
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveSession({ name, email, role });
    trackEvent("signup_completed", { role });
    router.push(role === "guide" ? "/onboarding/guide" : "/onboarding/explorer");
  }

  return (
    <Card className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight">Create your Rekkoe account</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Choose your role and start your first conversation.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <TextField
            id="name"
            required
            placeholder="Jamie Carter"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <TextField
            id="email"
            required
            type="email"
            placeholder="jamie@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <FieldLabel htmlFor="role">I am joining as</FieldLabel>
          <SelectField
            id="role"
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
          >
            <option value="explorer">Explorer</option>
            <option value="guide">Guide</option>
          </SelectField>
        </div>

        <Button type="submit" className="w-full">
          Continue to onboarding
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
