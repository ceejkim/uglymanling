"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldLabel, SelectField, TextField } from "@/components/ui/field";
import { saveSession, type UserRole } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("explorer");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveSession({ name, email, role });
    router.push("/chat");
  }

  return (
    <Card className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Sign in to continue conversations and experiences.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <TextField
            id="name"
            required
            placeholder="Alex Rivera"
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
            placeholder="alex@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <FieldLabel htmlFor="role">Role</FieldLabel>
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
          Log In
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
