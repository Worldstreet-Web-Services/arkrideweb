"use client";

import { useFormStatus } from "react-dom";

/**
 * A submit button that knows whether its form is in flight.
 *
 * `useFormStatus` reports on the form ABOVE it, so this has to be its own
 * component — reading it inside the component that renders the `<form>` always
 * returns idle.
 */
export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "ink";
}) {
  const { pending } = useFormStatus();

  const base =
    "h-12 w-full rounded-pill text-[15px] font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.99] disabled:bg-surface-disabled disabled:text-text-disabled disabled:shadow-none";
  const look =
    variant === "ink"
      ? "bg-surface-inverse text-on-inverse hover:opacity-90"
      : "bg-primary text-on-primary shadow-primary hover:bg-primary-hover";

  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={`${base} ${look}`}>
      {pending ? (pendingLabel ?? "Working…") : children}
    </button>
  );
}
