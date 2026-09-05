"use client";

import { useTransition } from "react";
import { signOutAction } from "@/app/actions/auth";

/**
 * Sign out.
 *
 * A button in a form rather than an `onClick` fetch, so it still works before
 * hydration and degrades to a plain POST with JavaScript disabled.
 */
export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <form action={() => startTransition(() => void signOutAction())}>
      <button
        type="submit"
        disabled={pending}
        className="rounded-pill border border-border px-3.5 py-1.5 text-xs font-semibold text-text-muted transition hover:border-text-subtle hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
      >
        {pending ? "Signing out…" : "Sign out"}
      </button>
    </form>
  );
}
