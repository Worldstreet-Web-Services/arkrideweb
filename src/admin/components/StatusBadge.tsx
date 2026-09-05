import { cn } from "@/lib/utils";
import { CheckIcon, ClockIcon, ReplaceIcon, WarningIcon } from "@/verification/components/icons";
import type { ApplicationStatus } from "../types";

/**
 * The four status palettes are the design system's, not four hand-rolled ones.
 *
 * This previously used `amber-50/700`, `emerald-50/700`, `red-50/700` and
 * `blue-50/700` from Tailwind's default palette while the tokens defined
 * warning, success, danger and info for exactly this — so the review queue's
 * status colours had no relationship to anything else in the product.
 */
const MAP: Record<
  ApplicationStatus,
  { label: string; cls: string; Icon: typeof CheckIcon }
> = {
  submitted: {
    label: "Under review",
    cls: "bg-warning-tint text-text ring-warning/35",
    Icon: ClockIcon,
  },
  approved: {
    label: "Approved",
    cls: "bg-success-tint text-success-strong ring-success-border",
    Icon: CheckIcon,
  },
  rejected: {
    label: "Rejected",
    cls: "bg-danger-tint text-danger ring-danger-border",
    Icon: WarningIcon,
  },
  changes_requested: {
    label: "Changes requested",
    cls: "bg-info-tint text-info-strong ring-info-border",
    Icon: ReplaceIcon,
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: ApplicationStatus;
  className?: string;
}) {
  // Guarded: an unknown status from stale storage used to throw here during
  // render, taking the whole page down with no error boundary to catch it.
  const entry = MAP[status] ?? MAP.submitted;
  const { label, cls, Icon } = entry;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold ring-1",
        cls,
        className,
      )}
    >
      <Icon size={13} aria-hidden /> {label}
    </span>
  );
}
