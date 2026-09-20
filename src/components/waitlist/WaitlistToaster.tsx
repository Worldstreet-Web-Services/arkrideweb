"use client";

import { forwardRef } from "react";
import { Toaster } from "sonner";

/**
 * Toasts sent with this `toasterId` show here and nowhere else; the app's
 * global toaster (layout.tsx) shows only toasts that carry no id.
 */
export const WAITLIST_TOASTER_ID = "waitlist";

/**
 * The toaster for the waitlist dialog.
 *
 * WHY A SECOND TOASTER
 * The dialog is opened with `showModal()`, which puts it in the browser's top
 * layer. Nothing outside the top layer can paint above it, whatever its
 * z-index, so the global toaster was hidden behind the modal. This one lives
 * in the top layer too, and WaitlistDialog shows it right after `showModal()`
 * so it stacks above the dialog (top-layer order is the order things were
 * added).
 *
 * WHY A POPOVER, NOT A CHILD OF THE DIALOG
 * The dialog animates with `translate`/`scale` and clips with
 * `overflow-hidden`. A transformed ancestor becomes the containing block for
 * `position: fixed` descendants, so a toast inside it would be placed against
 * the dialog and clipped by it. A `popover="manual"` sibling has no such
 * ancestor, so sonner's fixed positioning is relative to the viewport again.
 *
 * The popover's default box (inset 0, border, padding, a Canvas background) is
 * reset to a 0 × 0 point: the toasts position themselves and need no box.
 *
 * The toast options mirror the global toaster in layout.tsx; keep them in step.
 */
export const WaitlistToaster = forwardRef<HTMLDivElement>(
  function WaitlistToaster(_props, ref) {
    return (
      <div
        ref={ref}
        popover="manual"
        className="pointer-events-none fixed top-0 left-0 m-0 h-0 w-0 overflow-visible border-0 bg-transparent p-0"
      >
        <Toaster
          id={WAITLIST_TOASTER_ID}
          position="top-center"
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                "flex w-[calc(100vw-32px)] max-w-[380px] items-start gap-3 rounded-[10px] border bg-surface px-4 py-3 font-sans text-sm text-text shadow-[0_12px_32px_rgba(0,0,0,0.12)] border-border",
              title: "font-semibold leading-[20px]",
              description: "text-text-soft leading-[18px]",
              success:
                "border-success-border bg-success-tint text-success-strong",
              error: "border-danger-border bg-danger-tint text-danger",
            },
          }}
        />
      </div>
    );
  },
);
