"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { joinWaitlistAction, type WaitlistState } from "@/app/actions/waitlist";

const INITIAL: WaitlistState = { status: "idle" };

/**
 * The email capture on the waitlist page.
 *
 * Measurements are the design's own: a 538 × 64 pill (`#FDFBFB` with a 1px
 * `#E1E1E1` inside stroke, radius 169) holding a 197 × 46 butter button
 * (radius 71) inset 10px from the right and 8px from the top, and a
 * placeholder whose left edge sits 25px in. The 2px left offset is also the
 * design's — the pill starts at x=38 where every other block starts at x=40.
 *
 * Below `md` there is no design frame, so the pill opens up into a stacked
 * field and full-width button; the desktop values are untouched.
 *
 * The result line has no frame in the design either, so it is one line of
 * the form's own type, in the design's grey for success and the site's danger
 * token for failure, and it announces itself for screen readers.
 */
export function WaitlistForm() {
  const [state, formAction] = useActionState(joinWaitlistAction, INITIAL);
  const joined = state.status === "joined";

  return (
    <div className="mt-8 w-full md:mt-[32px] md:w-[538px] md:-ml-0.5">
      <form
        action={formAction}
        noValidate
        className="relative flex flex-col gap-3 rounded-[32px] border border-[#E1E1E1] bg-[#FDFBFB] p-2 focus-within:border-[#c9c9c9] md:h-16 md:flex-row md:items-center md:rounded-[169px] md:p-0"
      >
        <label htmlFor="waitlist-email" className="sr-only">
          Email address
        </label>
        <input
          id="waitlist-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          disabled={joined}
          placeholder="Enter your email address"
          aria-describedby="waitlist-status"
          className="h-12 w-full min-w-0 rounded-[24px] bg-transparent px-4 font-(family-name:--font-geist) text-[14px] leading-[26px] font-medium text-black outline-none placeholder:text-[#767676] disabled:text-[#767676] md:h-full md:rounded-[169px] md:pl-6 md:pr-[215px]"
        />
        <SubmitPill disabled={joined} />
      </form>

      <p
        id="waitlist-status"
        role="status"
        aria-live="polite"
        className={`mt-3 min-h-[26px] font-(family-name:--font-geist) text-[14px] leading-[26px] font-medium ${
          state.status === "error" ? "text-danger" : "text-[#767676]"
        }`}
      >
        {state.message}
      </p>
    </div>
  );
}

/**
 * Its own component because `useFormStatus` reads the form ABOVE it — called
 * from `WaitlistForm` it would always report idle.
 */
function SubmitPill({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className="h-[46px] w-full shrink-0 rounded-[71px] bg-secondary px-[21px] font-(family-name:--font-geist) text-[16px] leading-[26px] font-semibold text-black transition hover:bg-secondary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 md:absolute md:top-2 md:right-[10px] md:w-[197px]"
    >
      {pending ? "Joining…" : "Join the Waitlist"}
    </button>
  );
}
