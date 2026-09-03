import { cn } from "@/lib/utils";
import { ElementType, HTMLAttributes } from "react";

type TypographyVariant =
  | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  | "body-lg" | "body" | "body-sm"
  | "caption" | "label" | "overline";

type TypographyColor =
  | "default" | "muted" | "subtle" | "inverse" | "accent" | "primary";

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  color?: TypographyColor;
  as?: ElementType;
}

const variantStyles: Record<TypographyVariant, string> = {
  h1:       "text-[var(--text-6xl)] font-[var(--font-black)]   leading-[var(--leading-tight)]",
  h2:       "text-[var(--text-5xl)] font-[var(--font-bold)]    leading-[var(--leading-tight)]",
  h3:       "text-[var(--text-4xl)] font-[var(--font-bold)]    leading-[var(--leading-snug)]",
  h4:       "text-[var(--text-3xl)] font-[var(--font-semibold)] leading-[var(--leading-snug)]",
  h5:       "text-[var(--text-2xl)] font-[var(--font-semibold)] leading-[var(--leading-snug)]",
  h6:       "text-[var(--text-xl)]  font-[var(--font-semibold)] leading-[var(--leading-normal)]",
  "body-lg":"text-[var(--text-lg)]  font-[var(--font-normal)]  leading-[var(--leading-relaxed)]",
  body:     "text-[var(--text-base)] font-[var(--font-normal)] leading-[var(--leading-normal)]",
  "body-sm":"text-[var(--text-sm)]  font-[var(--font-normal)]  leading-[var(--leading-normal)]",
  caption:  "text-[var(--text-xs)]  font-[var(--font-normal)]  leading-[var(--leading-normal)]",
  label:    "text-[var(--text-sm)]  font-[var(--font-medium)]  leading-[var(--leading-tight)]",
  overline: "text-[var(--text-xs)]  font-[var(--font-semibold)] leading-[var(--leading-tight)] uppercase tracking-widest",
};

const colorStyles: Record<TypographyColor, string> = {
  default: "text-[var(--color-text)]",
  muted:   "text-[var(--color-text-muted)]",
  subtle:  "text-[var(--color-text-subtle)]",
  inverse: "text-[var(--color-text-inverse)]",
  accent:  "text-[var(--color-accent)]",
  primary: "text-[var(--color-primary)]",
};

const defaultTags: Record<TypographyVariant, ElementType> = {
  h1: "h1", h2: "h2", h3: "h3", h4: "h4", h5: "h5", h6: "h6",
  "body-lg": "p", body: "p", "body-sm": "p",
  caption: "span", label: "span", overline: "span",
};

function Typography({
  variant = "body",
  color = "default",
  as,
  className,
  children,
  ...props
}: TypographyProps) {
  const Tag = as ?? defaultTags[variant];

  return (
    <Tag
      className={cn(variantStyles[variant], colorStyles[color], className)}
      {...props}
    >
      {children}
    </Tag>
  );
}

export { Typography };
export type { TypographyProps, TypographyVariant, TypographyColor };
