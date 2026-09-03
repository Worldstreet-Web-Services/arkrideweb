/**
 * Shared Tailwind class tokens for the verification portal.
 *
 * The portal is a light, neutral (black/white/grey) design — so it maps onto
 * Tailwind's built-in `neutral` scale with black primary actions. Centralising
 * the repeated class strings here keeps the components readable and the look
 * consistent (change a token once, it updates everywhere).
 */

const focusRing =
  "outline-none transition-colors focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10";

export const inputCls =
  `w-full h-12 rounded-xl border border-neutral-200 bg-white px-4 text-[15px] text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 ${focusRing}`;

export const textareaCls =
  `w-full min-h-[5.5rem] rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[15px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 resize-y ${focusRing}`;

export const selectCls =
  `w-full h-12 appearance-none rounded-xl border border-neutral-200 bg-white pl-4 pr-10 text-[15px] text-neutral-900 hover:border-neutral-300 cursor-pointer ${focusRing}`;

/** Applied on top of a control when its field has an error. */
export const invalidCls = "border-red-500 focus:border-red-500 focus:ring-red-500/10";

export const labelCls = "block text-[13px] font-semibold text-neutral-900 mb-1.5";
export const hintCls = "mt-1 text-xs text-neutral-400";
export const errorCls = "mt-1 text-xs text-red-600";

export const cardCls = "rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]";

export const btnPrimaryCls =
  "inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all hover:bg-neutral-800 hover:shadow-md active:translate-y-px disabled:opacity-40 disabled:shadow-none disabled:pointer-events-none";

export const btnLinkCls =
  "font-bold text-[15px] text-neutral-700 underline underline-offset-4 px-2 py-3.5 transition-colors hover:text-neutral-900 disabled:opacity-40 disabled:pointer-events-none";

/** Small, quiet trust/security note — pairs an icon with muted text. */
export const trustNoteCls = "flex items-center gap-2 text-xs text-neutral-500";
