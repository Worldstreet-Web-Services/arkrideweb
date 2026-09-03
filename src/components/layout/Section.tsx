import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  bg?: "default" | "subtle" | "muted" | "primary" | "accent";
  spacing?: "sm" | "md" | "lg" | "xl";
  as?: "section" | "div" | "article" | "main";
}

const bgStyles = {
  default: "bg-[var(--color-bg)]",
  subtle:  "bg-[var(--color-bg-subtle)]",
  muted:   "bg-[var(--color-bg-muted)]",
  primary: "bg-[var(--color-primary)]",
  accent:  "bg-[var(--color-accent)]",
};

const spacingStyles = {
  sm: "py-[var(--space-12)]",
  md: "py-[var(--space-16)]",
  lg: "py-[var(--space-24)]",
  xl: "py-[var(--space-32)]",
};

function Section({
  bg = "default",
  spacing = "lg",
  as: Tag = "section",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <Tag
      className={cn(bgStyles[bg], spacingStyles[spacing], className)}
      {...props}
    >
      {children}
    </Tag>
  );
}

export { Section };
