"use client";

import Image from "next/image";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { joinWaitlistAction, type WaitlistState } from "@/app/actions/waitlist";
import { RoleDropdown } from "./RoleDropdown";

const INITIAL: WaitlistState = { status: "idle" };

/**
 * The form row on the waitlist page: role, email, a feature wish, submit.
 *
 * At xl it is the design's row exactly — an 863px horizontal auto-layout with
 * 12px gaps holding the 149 dropdown, the 238 email field, the 257 feature
 * field and the 183 button, all 40 tall. The fields are #FDFBFB with a 1px
 * #E1E1E1 stroke that the file counts IN the layout, radius 10, padding
 * 6/10/6/12, and a 16px glyph 9px before a Geist 400 10/26 placeholder in
 * #A7A5A5. Because the stroke is inside the layout box, CSS border-box with a
 * 1px border and that padding lands every child on the file's pixel.
 *
 * Below xl there is no frame: the four controls stack (two columns from md),
 * 48 tall with 16px text so a phone does not zoom into the field on focus.
 *
 * The status line has no frame either. It is one centred line of Geist under
 * the row, in the design's grey on success and the site's danger token on
 * failure, and it is announced to screen readers.
 */
export function WaitlistForm({ className = "" }: { className?: string }) {
  const [state, formAction] = useActionState(joinWaitlistAction, INITIAL);
  const joined = state.status === "joined";

  const field =
    "flex h-12 w-full items-center gap-[9px] rounded-[10px] border border-[#E1E1E1]! bg-[#FDFBFB] pr-[10px] pl-3 focus-within:border-[#c9c9c9]! xl:h-10";
  const input =
    "h-[26px] min-w-0 flex-1 bg-transparent font-(family-name:--font-geist) text-[16px] leading-[26px] font-normal text-black outline-none placeholder:text-[#A7A5A5] disabled:text-[#767676] xl:relative xl:top-[1.25px] xl:text-[10px]";

  return (
    <div className={`relative ${className}`}>
      <form
        action={formAction}
        noValidate
        className="flex flex-col gap-3 md:grid md:grid-cols-2 xl:flex xl:flex-row xl:items-center"
      >
        <RoleDropdown name="role" disabled={joined} />

        <label className={`${field} xl:w-[238px] xl:shrink-0`}>
          <Image
            src="/waitlist/icons/email.svg"
            alt=""
            width={16}
            height={16}
            unoptimized
            className="h-4 w-4 shrink-0"
          />
          <span className="sr-only">Email address</span>
          <input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            disabled={joined}
            placeholder="Enter your email address"
            aria-describedby="waitlist-status"
            className={input}
          />
        </label>

        <label className={`${field} xl:w-[257px] xl:shrink-0`}>
          <Image
            src="/waitlist/icons/bulb.svg"
            alt=""
            width={16}
            height={16}
            unoptimized
            className="h-4 w-4 shrink-0"
          />
          <span className="sr-only">What feature would you like to see? (optional)</span>
          <input
            name="feature"
            type="text"
            maxLength={500}
            autoComplete="off"
            disabled={joined}
            placeholder="What Feature would you like to see?"
            className={input}
          />
        </label>

        <SubmitButton disabled={joined} />
      </form>

      <p
        id="waitlist-status"
        role="status"
        aria-live="polite"
        className={`mt-3 min-h-5 text-center font-(family-name:--font-geist) text-[13px] leading-5 font-medium xl:absolute xl:inset-x-0 xl:top-[52px] xl:mt-0 xl:text-[12px] ${
          state.status === "error" ? "text-danger" : "text-[#767676]"
        }`}
      >
        {state.message}
      </p>
    </div>
  );
}

/**
 * Its own component because `useFormStatus` reads the form ABOVE it.
 *
 * The label carries a 1.2px nudge at xl: the browser sets Mona Sans 12/26 that
 * much higher in the line box than the render does (measured). The fields'
 * placeholders get 1.25px for the same reason, and their border colour is
 * `!` because globals.css paints every border with an unlayered rule.
 *
 * The design's button: 183 × 40, #FEEE8F, radius 11, 7/22 padding, label in
 * Mona Sans 600 12/26. (The three loose copies of this button beside the frame
 * are set in Geist; the one inside the frame is Mona Sans, and that one wins.)
 */
function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className="h-12 w-full rounded-[11px] bg-[#FEEE8F] px-[22px] font-(family-name:--font-mona-sans) text-[16px] leading-[26px] font-semibold text-black transition-colors hover:bg-secondary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 xl:h-10 xl:w-[183px] xl:shrink-0 xl:text-[12px]"
    >
      <span className="relative xl:top-[1.2px]">
        {pending ? "Joining…" : "Join the Waitlist"}
      </span>
    </button>
  );
}
