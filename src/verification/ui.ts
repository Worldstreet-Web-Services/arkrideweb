/**
 * Shared Tailwind class tokens for the verification portal.
 *
 * This file used to describe itself as "a light, neutral (black/white/grey)
 * design" mapped onto Tailwind's built-in `neutral` scale with black primary
 * actions — a second design system, competing with the one in `globals.css`.
 * The result was that every primary button in the KYC flow was black while the
 * brand button is amber, labels were `#171717` while the brand ink is the
 * navy-slate `#152531`, and focus rings were grey while the brand focus is
 * amber. The portal looked like a different product from the page that links
 * to it.
 *
 * It now draws from the same tokens as everything else. There is one design
 * system; this file is just the portal's shorthand for it.
 *
 * ON THE 16px INPUT SIZE
 *
 * The controls below are `text-base` (16px) rather than the 15px they used to
 * be. iOS zooms the viewport when a focused input is under 16px, and the
 * previous answer to that was `userScalable: false` on the whole flow — taking
 * pinch-zoom away from everyone, on the one flow where people photograph a
 * document and need to check it is legible. Sizing the input correctly fixes
 * the zoom-on-focus without disabling zoom.
 */

const focusRing =
  "outline-none transition-colors focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/25";

const controlBase =
  "w-full rounded-2xl border border-border-input bg-surface text-base text-text placeholder:text-text-placeholder hover:border-border-strong";

export const inputCls = `${controlBase} h-12 px-4 ${focusRing}`;

export const textareaCls =
  `${controlBase} min-h-22 px-4 py-3 leading-relaxed resize-y ${focusRing}`;

export const selectCls =
  `${controlBase} h-12 appearance-none pl-4 pr-10 cursor-pointer ${focusRing}`;

/** Applied on top of a control when its field has an error. */
export const invalidCls =
  "border-danger focus-visible:border-danger focus-visible:ring-danger/25";

export const labelCls = "block text-[13px] font-semibold text-text mb-1.5";
export const hintCls = "mt-1 text-xs text-text-muted";
export const errorCls = "mt-1 text-xs font-medium text-danger";

export const cardCls = "rounded-2xl border border-border bg-surface shadow-sm";

/**
 * The primary action.
 *
 * Amber with black text — `--color-on-primary` is `#000`, not white, because
 * white on this amber is 1.76:1 and fails contrast badly.
 */
export const btnPrimaryCls =
  "inline-flex items-center justify-center gap-2 rounded-pill bg-primary px-6 py-3.5 text-[15px] font-bold text-on-primary shadow-primary transition-all hover:bg-primary-hover active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:bg-surface-disabled disabled:text-text-disabled disabled:shadow-none disabled:pointer-events-none";

export const btnLinkCls =
  "rounded-pill font-bold text-[15px] text-text-soft underline underline-offset-4 px-2 py-3.5 transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-40 disabled:pointer-events-none";

/** Small, quiet trust/security note — pairs an icon with muted text. */
export const trustNoteCls = "flex items-center gap-2 text-xs text-text-muted";
