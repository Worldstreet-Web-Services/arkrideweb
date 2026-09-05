"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Labelled checkbox — used for the final consent gate.
 *
 * The input is first in the DOM so `peer-focus-visible:` on the visual box
 * works: it is a following-sibling selector. Before this, focus landed on an
 * `sr-only` input with no visible indicator at all, which meant a keyboard
 * user could not see that the legal declaration checkbox — the thing gating
 * submission — was focused.
 */
export function Checkbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 grid size-5.5 shrink-0 place-items-center rounded-md border-2 transition-colors",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary",
          checked ? "border-text bg-text" : "border-border-strong bg-surface",
        )}
      >
        {checked && (
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            // currentColor, not a hardcoded #fff: the box inverts with the
            // theme and a fixed white tick disappears on a light background.
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-on-inverse"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <span className="text-sm leading-relaxed text-text-muted">{children}</span>
    </label>
  );
}
