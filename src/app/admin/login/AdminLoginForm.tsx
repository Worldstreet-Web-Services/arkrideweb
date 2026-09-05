"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { adminSignInAction, type FormState } from "@/app/actions/auth";
import { Field } from "@/components/form/Field";
import { FormError } from "@/components/form/FormError";

const initialState: FormState = {};

/**
 * Separate component so `useFormStatus` can read the pending state of the
 * enclosing form — it reports on the form above it, so it cannot live in the
 * same component that renders the `<form>`.
 */
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="h-12 w-full rounded-pill bg-primary text-[15px] font-bold text-on-primary shadow-primary transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.99] disabled:bg-surface-disabled disabled:text-text-disabled disabled:shadow-none"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function AdminLoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(adminSignInAction, initialState);

  return (
    // A real <form>, not a div with an onClick. That is what makes
    // Enter-to-submit, password-manager autofill and no-JS submission work.
    <form action={formAction} className="grid gap-4" noValidate>
      <FormError message={state.error} />

      {/* Carried through the POST so the user lands where they were going. */}
      <input type="hidden" name="next" value={next} />

      <Field
        label="Work email"
        name="email"
        type="email"
        autoComplete="username"
        placeholder="you@arkride.com"
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

      <SubmitButton />
    </form>
  );
}
