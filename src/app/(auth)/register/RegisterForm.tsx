"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerRiderAction, type FormState } from "@/app/actions/auth";
import { Field } from "@/components/form/Field";
import { FormError } from "@/components/form/FormError";
import { SubmitButton } from "@/components/form/SubmitButton";
import { PrivyButton } from "@/components/auth/PrivyButton";

const initialState: FormState = {};

export function RegisterForm() {
  const [state, formAction] = useActionState(registerRiderAction, initialState);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-text">
        Create your account
      </h1>
      <p className="mt-1.5 text-[15px] text-text-muted">
        It takes a minute. You can book straight after.
      </p>

      <form action={formAction} className="mt-7 grid gap-4" noValidate>
        <FormError message={state.error} />

        <Field
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Ada Okoro"
          required
          error={state.fieldErrors?.name}
        />

        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          error={state.fieldErrors?.email}
        />

        {/*
          The API wants bare digits here — 10 to 15 of them, no `+`. The action
          strips punctuation before sending, so a pasted "+234 801 234 5678"
          works. Driver registration uses a different and incompatible rule.
        */}
        <Field
          label="Phone number"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0801 234 5678"
          hint="Nigerian mobile number."
          required
          error={state.fieldErrors?.phone}
        />

        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          error={state.fieldErrors?.password}
        />

        <Field
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          error={state.fieldErrors?.confirmPassword}
        />

        <label className="flex items-start gap-2.5">
          <input
            type="checkbox"
            name="acceptTerms"
            className="mt-0.5 size-4.5 shrink-0 rounded accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            required
          />
          <span className="text-sm leading-relaxed text-text-muted">
            I agree to the Arkride terms of service and privacy policy.
          </span>
        </label>
        {state.fieldErrors?.acceptTerms && (
          <p className="-mt-2 text-xs font-medium text-danger">
            {state.fieldErrors.acceptTerms}
          </p>
        )}

        <SubmitButton pendingLabel="Creating account…">
          Create account
        </SubmitButton>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
          or
        </span>
        <span className="h-px flex-1 bg-border" aria-hidden />
      </div>

      <PrivyButton audience="rider" next="/app" />

      <p className="mt-7 text-center text-sm text-text-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="rounded-pill font-semibold text-text underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
