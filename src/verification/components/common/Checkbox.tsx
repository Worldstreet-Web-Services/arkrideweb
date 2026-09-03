import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Labelled checkbox — used for the final consent gate. */
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
      <span
        aria-hidden
        className={cn(
          "mt-0.5 grid size-5.5 shrink-0 place-items-center rounded-md border-2 transition-colors",
          checked ? "border-neutral-900 bg-neutral-900" : "border-neutral-300 bg-white"
        )}
      >
        {checked && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span className="text-sm leading-relaxed text-neutral-600">{children}</span>
    </label>
  );
}
