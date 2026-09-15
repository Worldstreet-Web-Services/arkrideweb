"use client";

import Image from "next/image";
import {
  useActionState,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useFormStatus } from "react-dom";
import {
  joinWaitlistAction,
  type WaitlistField,
  type WaitlistState,
} from "@/app/actions/waitlist";

const INITIAL: WaitlistState = { status: "idle" };

const ROLES = [
  { value: "user", label: "Book Ride", hint: "Get around the city" },
  { value: "driver", label: "Become a Driver", hint: "Drive and earn" },
] as const;

const FIELD_ORDER: readonly WaitlistField[] = [
  "userType",
  "name",
  "email",
  "phoneNumber",
  "feature",
];

/**
 * "Join the Waitlist": the hero's button, and the dialog it opens.
 *
 * WHY A DIALOG
 * The page's job is one decision, so the hero carries one action: the
 * design's own 183 × 40 butter button, where the form row used to sit. The
 * form comes up only for people who pressed it, which keeps the page as calm
 * as the design and gives the fields room for real labels and inline errors.
 *
 * WHY NATIVE <dialog>
 * `showModal()` puts it in the top layer and makes the page behind it inert,
 * so focus cannot wander out, Escape closes it, and focus returns to the
 * button afterwards, all without a focus-trap library. A click on the
 * backdrop also closes it. The page behind is held still by one rule in
 * globals.css.
 *
 * SHAPE
 * On a phone it is a bottom sheet: full width, rounded top, reachable with a
 * thumb, respecting the home-indicator inset. From `sm` it is a centred
 * 440px card. It slides or scales in over 300ms using @starting-style, and
 * appears instantly for people who prefer reduced motion.
 *
 * FORM
 * - Ride or drive is two visible cards, not a dropdown: two options read
 *   faster than a menu, and they use the file's own radio (a 15px #A7A5A5
 *   ring that fills #FEEE8F when chosen). The chosen card also gets a black
 *   border, because yellow on white alone is too faint to show state.
 *   "Book Ride" and "Become a Driver" are the app's own words from the design.
 * - Email, phone and the feature idea are the page's field tokens (#FDFBFB,
 *   #E1E1E1, radius 10, the file's icons) at 48px, with 16px text on phones
 *   so iOS does not zoom into the field.
 * - Errors sit under the field they belong to, and the first one takes focus.
 * - On success the form is replaced by a confirmation. Closing after that
 *   resets it; closing mid-typing keeps what was typed.
 */
export function WaitlistDialog({ className = "" }: { className?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const joinedRef = useRef(false);
  const [session, setSession] = useState(0);
  const titleId = useId();

  const open = () => {
    if (joinedRef.current) {
      joinedRef.current = false;
      setSession((s) => s + 1);
    }
    dialogRef.current?.showModal();
  };

  const close = () => dialogRef.current?.close();
  const onJoined = useCallback(() => {
    joinedRef.current = true;
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className={`h-12 w-full max-w-[360px] rounded-[11px] bg-[#FEEE8F] px-[22px] font-(family-name:--font-mona-sans) text-[16px] leading-[26px] font-semibold text-black transition-colors hover:bg-secondary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary xl:h-10 xl:w-[183px] xl:max-w-none xl:text-[12px] ${className}`}
      >
        {/* 1.2px: the browser sets Mona Sans 12/26 that much higher than the render. */}
        <span className="relative xl:top-[1.2px]">Join the Waitlist</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        // Browsers return focus to whatever was focused before showModal(),
        // and a mouse click does not focus a button in Safari, so that can be
        // the page itself. Send it back to the trigger explicitly.
        onClose={() => triggerRef.current?.focus()}
        // `text-left` because the trigger sits inside the hero's centred block
        // and a <dialog> inherits text-align from where it is mounted.
        onClick={(event) => {
          // A click that lands on the <dialog> itself, not its content, is
          // a click on the backdrop.
          if (event.target === event.currentTarget) close();
        }}
        className="fixed inset-x-0 top-auto bottom-0 m-0 max-h-[92dvh] w-full max-w-none translate-y-full overflow-hidden rounded-t-[20px] bg-white p-0 text-left text-black opacity-100 shadow-[0_-8px_40px_rgba(0,0,0,0.12)] transition-[opacity,translate,scale,display,overlay] transition-discrete duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] backdrop:bg-black/0 backdrop:transition-[background-color,display,overlay] backdrop:transition-discrete backdrop:duration-300 open:translate-y-0 open:backdrop:bg-black/50 motion-reduce:transition-none motion-reduce:backdrop:transition-none starting:open:translate-y-full starting:open:backdrop:bg-black/0 sm:inset-0 sm:m-auto sm:h-fit sm:w-[calc(100%-32px)] sm:max-w-[440px] sm:translate-y-2 sm:scale-[0.98] sm:rounded-[20px] sm:opacity-0 sm:shadow-[0_24px_64px_rgba(0,0,0,0.18)] sm:open:translate-y-0 sm:open:scale-100 sm:open:opacity-100 sm:starting:open:translate-y-2 sm:starting:open:scale-[0.98] sm:starting:open:opacity-0"
      >
        <div className="relative flex max-h-[92dvh] flex-col overflow-y-auto px-5 pt-3 pb-[max(20px,env(safe-area-inset-bottom))] sm:px-7 sm:pt-7 sm:pb-7">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 shrink-0 rounded-full bg-[#E1E1E1] sm:hidden"
          />

          <WaitlistPanel
            key={session}
            titleId={titleId}
            onJoined={onJoined}
            onDone={close}
          />

          {/* Last in the DOM so opening focuses the form, not this button. */}
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#F2F2F2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:top-5 sm:right-5"
          >
            <Image
              src="/waitlist/icons/close.svg"
              alt=""
              width={9}
              height={9}
              unoptimized
              // The file's own close glyph (the X used in driver onboarding),
              // drawn on a 9 × 9 canvas; shown at 18px.
              className="h-[18px] w-[18px]"
            />
          </button>
        </div>
      </dialog>
    </>
  );
}

function WaitlistPanel({
  titleId,
  onJoined,
  onDone,
}: {
  titleId: string;
  onJoined: () => void;
  onDone: () => void;
}) {
  const [state, formAction] = useActionState(joinWaitlistAction, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);
  const baseId = useId();

  useEffect(() => {
    if (state.status === "joined") {
      onJoined();
      return;
    }
    if (state.status !== "error") return;
    const first = FIELD_ORDER.find((field) => state.fieldErrors?.[field]);
    if (first) {
      formRef.current
        ?.querySelector<HTMLElement>(
          first === "userType"
            ? 'input[name="userType"]:checked, input[name="userType"]'
            : `[name="${first}"]`,
        )
        ?.focus();
    }
  }, [state, onJoined]);

  if (state.status === "joined") {
    return (
      <JoinedPanel
        titleId={titleId}
        alreadyJoined={Boolean(state.alreadyJoined)}
        onDone={onDone}
      />
    );
  }

  const errors = state.fieldErrors ?? {};
  const values = state.values;
  const chosen = values?.userType ?? "user";
  const id = (field: WaitlistField) => `${baseId}-${field}`;

  return (
    <>
      <h2
        id={titleId}
        className="pr-10 font-(family-name:--font-mona-sans) text-[22px] leading-[28px]! font-semibold tracking-normal! text-wrap! text-black sm:text-[24px] sm:leading-[30px]!"
      >
        Join the waitlist
      </h2>
      <p className="mt-1.5 pr-6 font-(family-name:--font-geist) text-[14px] leading-[21px] text-[#767676]">
        Be among the first to ride when Ark Ride launches in September 2026.
      </p>

      <form
        ref={formRef}
        action={formAction}
        noValidate
        className="mt-6 flex flex-col gap-5"
      >
        <fieldset aria-describedby={errors.userType ? `${id("userType")}-error` : undefined}>
          <legend className="font-(family-name:--font-mona-sans) text-[14px] leading-[20px] font-medium text-black">
            I want to
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {ROLES.map((role) => (
              <label
                key={role.value}
                className="group relative flex cursor-pointer flex-col gap-1 rounded-[12px] border border-[#E1E1E1]! bg-[#FDFBFB] p-3.5 transition-colors has-checked:border-black! has-checked:bg-white has-focus-visible:shadow-[0_0_0_4px_rgba(243,186,63,0.28)]"
              >
                <input
                  type="radio"
                  name="userType"
                  value={role.value}
                  defaultChecked={chosen === role.value}
                  className="sr-only"
                />
                <span className="flex items-start justify-between gap-2">
                  <span className="font-(family-name:--font-mona-sans) text-[15px] leading-[20px] font-semibold text-black">
                    {role.label}
                  </span>
                  <span
                    aria-hidden
                    className="mt-0.5 h-[15px] w-[15px] shrink-0 rounded-full border border-[#A7A5A5]! transition-colors group-has-checked:border-[#FEEE8F]! group-has-checked:bg-[#FEEE8F]"
                  />
                </span>
                <span className="font-(family-name:--font-geist) text-[13px] leading-[18px] text-[#767676]">
                  {role.hint}
                </span>
              </label>
            ))}
          </div>
          <FieldError id={`${id("userType")}-error`} message={errors.userType} />
        </fieldset>

        <Field
          id={id("name")}
          label="Full name"
          optional
          icon="/waitlist/icons/user.svg"
          error={errors.name}
        >
          <input
            id={id("name")}
            name="name"
            type="text"
            autoComplete="name"
            autoCapitalize="words"
            maxLength={100}
            defaultValue={values?.name}
            placeholder="Enter your full name"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${id("name")}-error` : undefined}
            className={INPUT}
          />
        </Field>

        <Field
          id={id("email")}
          label="Email address"
          icon="/waitlist/icons/email.svg"
          error={errors.email}
        >
          <input
            id={id("email")}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            defaultValue={values?.email}
            placeholder="Enter your email address"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? `${id("email")}-error` : undefined}
            className={INPUT}
          />
        </Field>

        <Field
          id={id("phoneNumber")}
          label="Phone number"
          icon="/waitlist/icons/phone.svg"
          error={errors.phoneNumber}
        >
          <input
            id={id("phoneNumber")}
            name="phoneNumber"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            maxLength={20}
            defaultValue={values?.phoneNumber}
            placeholder="Enter your phone number"
            aria-invalid={errors.phoneNumber ? true : undefined}
            aria-describedby={
              errors.phoneNumber ? `${id("phoneNumber")}-error` : undefined
            }
            className={INPUT}
          />
        </Field>

        <Field
          id={id("feature")}
          label="What feature would you like to see?"
          optional
          icon="/waitlist/icons/bulb.svg"
          error={errors.feature}
        >
          <input
            id={id("feature")}
            name="feature"
            type="text"
            maxLength={500}
            autoComplete="off"
            defaultValue={values?.feature}
            placeholder="e.g. Split a fare with friends"
            aria-invalid={errors.feature ? true : undefined}
            aria-describedby={errors.feature ? `${id("feature")}-error` : undefined}
            className={INPUT}
          />
        </Field>

        {state.status === "error" && state.message ? (
          <p
            role="alert"
            className="rounded-[10px] bg-danger-tint px-3 py-2.5 font-(family-name:--font-geist) text-[13px] leading-[18px] text-danger"
          >
            {state.message}
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          <SubmitButton />
          <p className="text-center font-(family-name:--font-geist) text-[12px] leading-[17px] text-[#767676]">
            We’ll only use your details to tell you about Ark Ride.
          </p>
        </div>
      </form>
    </>
  );
}

/**
 * `outline-none!`: globals.css draws a focus ring on every :focus-visible
 * element from an unlayered rule, which beats the utility. The field's own
 * border already turns black on focus, so a second ring inside it is noise.
 */
const INPUT =
  "h-full min-w-0 flex-1 bg-transparent font-(family-name:--font-geist) text-[16px] leading-[24px] text-black caret-black outline-none! placeholder:text-[#A7A5A5] autofill:shadow-[inset_0_0_0_1000px_#FDFBFB] autofill:[-webkit-text-fill-color:#000] group-focus-within/field:autofill:shadow-[inset_0_0_0_1000px_#FFFFFF] sm:text-[15px]";

function Field({
  id,
  label,
  optional,
  icon,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  icon: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-baseline justify-between gap-3 font-(family-name:--font-mona-sans) text-[14px] leading-[20px] font-medium text-black"
      >
        {label}
        {optional ? (
          <span className="font-(family-name:--font-geist) text-[12px] font-normal text-[#767676]">
            Optional
          </span>
        ) : null}
      </label>
      {/*
        FOCUS: the border takes the brand amber and a soft 4px amber halo
        grows around the field, which also turns white so the text being typed
        reads clearly. An errored field does the same in red. Both are box
        shadows and a border colour, so nothing shifts by a pixel. Hover only
        darkens an unfocused field, so a resting pointer cannot mask focus.
      */}
      <div
        className={`group/field mt-2 flex h-12 items-center gap-[9px] rounded-[10px] border px-3 transition-[border-color,box-shadow,background-color] duration-150 ease-out motion-reduce:transition-none ${
          error
            ? "border-danger! bg-[#FFFBFB] focus-within:shadow-[0_0_0_4px_rgba(220,38,38,0.14)]"
            : "border-[#E1E1E1]! bg-[#FDFBFB] hover:not-focus-within:border-[#CFCFCF]! focus-within:border-[#F3BA3F]! focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(243,186,63,0.22)]"
        }`}
      >
        <Image
          src={icon}
          alt=""
          width={16}
          height={16}
          unoptimized
          className="h-4 w-4 shrink-0"
        />
        {children}
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p
      id={id}
      className="mt-1.5 font-(family-name:--font-geist) text-[13px] leading-[18px] text-danger"
    >
      {message}
    </p>
  );
}

/** Its own component because `useFormStatus` reads the form ABOVE it. */
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="h-12 w-full rounded-[11px] bg-[#FEEE8F] font-(family-name:--font-mona-sans) text-[15px] font-semibold text-black transition-colors hover:bg-secondary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
    >
      {pending ? "Joining…" : "Join the Waitlist"}
    </button>
  );
}

function JoinedPanel({
  titleId,
  alreadyJoined,
  onDone,
}: {
  titleId: string;
  alreadyJoined: boolean;
  onDone: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the confirmation so a screen reader announces it.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col items-center pt-2 pb-1 text-center sm:pt-4">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FEEE8F]">
        <Image
          src="/waitlist/icons/check.svg"
          alt=""
          width={24}
          height={24}
          unoptimized
          className="h-6 w-6"
        />
      </span>
      <h2
        ref={headingRef}
        id={titleId}
        tabIndex={-1}
        className="mt-5 font-(family-name:--font-mona-sans) text-[22px] leading-[28px]! font-semibold tracking-normal! text-wrap! text-black outline-none sm:text-[24px] sm:leading-[30px]!"
      >
        {alreadyJoined ? "You’re already on the list" : "You’re on the list"}
      </h2>
      <p className="mt-2 max-w-[320px] font-(family-name:--font-geist) text-[14px] leading-[21px] text-[#767676]">
        {alreadyJoined
          ? "That email is already signed up. We’ll be in touch before launch."
          : "Thanks for joining. We’ll email you when Ark Ride launches in September 2026."}
      </p>
      <button
        type="button"
        onClick={onDone}
        className="mt-7 h-12 w-full rounded-[11px] bg-[#FEEE8F] font-(family-name:--font-mona-sans) text-[15px] font-semibold text-black transition-colors hover:bg-secondary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Done
      </button>
    </div>
  );
}
