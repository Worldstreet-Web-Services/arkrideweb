import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

/**
 * The ArkRide button.
 *
 * Ported from mobile's `GreenButton` (the name is legacy — it is amber). The
 * details that make it look like ArkRide rather than generic Tailwind:
 *
 *  - FULL PILL, always. Nothing interactive in this product has a corner.
 *  - BLACK label on amber, never white. Amber `#f3ba3f` against white text is
 *    roughly 1.8:1 — unreadable. Against black it is ~11:1. The app does this
 *    consistently and it is the single easiest thing to get wrong.
 *  - An amber GLOW under the primary, which is the only real shadow in the
 *    entire design system. Everything else uses a hairline.
 *  - Disabled is a flat grey fill with no glow, not a faded amber — mobile
 *    renders a genuinely different object rather than lowering opacity.
 *
 * Heights come straight off the app: 48px default, 56px for the big auth and
 * landing CTAs.
 */
type Variant = "primary" | "secondary" | "ink" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  // The primary CTA — "Get started", "Find Drivers", "Top Up Now".
  primary: cn(
    "bg-primary text-on-primary shadow-primary",
    "hover:bg-primary-hover hover:shadow-none",
    "active:translate-y-px",
  ),
  // Butter. The softer CTA — "Continue", "Find a ride", "Sign in with Google".
  secondary: cn(
    "bg-secondary text-on-secondary",
    "hover:bg-secondary-hover",
    "active:translate-y-px",
  ),
  // The ink button — mobile's "Get started" on the email screen.
  ink: cn(
    "bg-surface-inverse text-on-inverse",
    "hover:opacity-90",
    "active:translate-y-px",
  ),
  outline: cn(
    "bg-transparent text-text border border-border-strong",
    "hover:bg-surface-hover",
  ),
  ghost: cn("bg-transparent text-text-muted", "hover:bg-surface-hover hover:text-text"),
  // Cancel / SOS. A tinted fill with a soft border, never a solid red block.
  danger: cn(
    "bg-danger-tint text-danger border border-danger-border",
    "hover:bg-danger-tint hover:border-danger",
  ),
};

const sizeStyles: Record<Size, string> = {
  sm: "h-10 px-4 text-sm gap-1.5",
  md: "h-12 px-6 text-lg gap-2",
  lg: "h-14 px-8 text-lg gap-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    disabled,
    className,
    children,
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      // Tells assistive tech the control is working, not just greyed out.
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-pill font-semibold",
        "whitespace-nowrap select-none cursor-pointer",
        "transition-[background-color,box-shadow,transform,opacity] duration-200",
        "motion-reduce:transition-none motion-reduce:active:translate-y-0",
        sizeStyles[size],
        // Disabled wins over the variant entirely — a flat grey object, as on
        // mobile, rather than a translucent amber one.
        isDisabled
          ? "bg-surface-disabled text-text-disabled shadow-none cursor-not-allowed pointer-events-none"
          : variantStyles[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading && (
        <span
          // Purely decorative: `aria-busy` above already announces the state.
          aria-hidden="true"
          className="size-4 shrink-0 rounded-full border-2 border-current border-t-transparent animate-spin motion-reduce:animate-none"
        />
      )}
      {children}
    </button>
  );
});

export { Button };
export type { ButtonProps, Variant as ButtonVariant, Size as ButtonSize };
