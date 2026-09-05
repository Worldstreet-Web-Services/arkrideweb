"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, type FormState } from "@/app/actions/auth";
import { Field } from "@/components/form/Field";
import { FormError } from "@/components/form/FormError";
import { SubmitButton } from "@/components/form/SubmitButton";
import { PrivyButton } from "@/components/auth/PrivyButton";

const initialState: FormState = {};

export function LoginForm({
  audience,
  next,
}: {
  audience: "rider" | "driver";
  next: string;
}) {
  const [state, formAction] = useActionState(signInAction, initialState);
  const isDriver = audience === "driver";

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-text">
        {isDriver ? "Driver sign in" : "Welcome back"}
      </h1>
      <p className="mt-1.5 text-[15px] text-text-muted">
        {isDriver
          ? "Sign in to go online and start accepting rides."
          : "Sign in to book a ride."}
      </p>

      {/*
        A real <form> posting to a Server Action: Enter submits, password
        managers can fill it, and it works before hydration.
      */}
      <form action={formAction} className="mt-7 grid gap-4" noValidate>
        <FormError message={state.error} />

        <input type="hidden" name="audience" value={audience} />
        <input type="hidden" name="next" value={next} />

        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="you@example.com"
          required
          error={state.fieldErrors?.email}
        />

        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          error={state.fieldErrors?.password}
        />

        <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
      </form>

      {/*
        Privy is offered to riders only. A driver signing in with Privy against
        an unlinked identity is a 400 by design — drivers are never
        auto-provisioned, because a driver account requires a licence, a
        vehicle and an admin approval that an email address cannot stand in for.
      */}
      {!isDriver && (
        <>
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
              or
            </span>
            <span className="h-px flex-1 bg-border" aria-hidden />
          </div>
          <PrivyButton audience="rider" next={next} />
        </>
      )}

      <p className="mt-7 text-center text-sm text-text-muted">
        {isDriver ? (
          <>
            New driver?{" "}
            <Link
              href="/driver-register"
              className="rounded-pill font-semibold text-text underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Apply to drive
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link
              href="/register"
              className="rounded-pill font-semibold text-text underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Create an account
            </Link>
          </>
        )}
      </p>

      <p className="mt-2 text-center text-sm text-text-muted">
        {isDriver ? (
          <Link href="/login" className="underline underline-offset-4">
            Sign in as a rider instead
          </Link>
        ) : (
          <Link href="/driver-login" className="underline underline-offset-4">
            Sign in as a driver instead
          </Link>
        )}
      </p>
    </div>
  );
}
