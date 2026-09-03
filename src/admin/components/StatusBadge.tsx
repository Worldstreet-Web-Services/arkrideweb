import { cn } from "@/lib/utils";
import { CheckIcon, ClockIcon, ReplaceIcon, WarningIcon } from "@/verification/components/icons";
import type { ApplicationStatus } from "../types";

const MAP: Record<
  ApplicationStatus,
  { label: string; cls: string; Icon: typeof CheckIcon }
> = {
  submitted: { label: "Under review", cls: "bg-amber-50 text-amber-700 ring-amber-200", Icon: ClockIcon },
  approved: { label: "Approved", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200", Icon: CheckIcon },
  rejected: { label: "Rejected", cls: "bg-red-50 text-red-700 ring-red-200", Icon: WarningIcon },
  changes_requested: {
    label: "Changes requested",
    cls: "bg-blue-50 text-blue-700 ring-blue-200",
    Icon: ReplaceIcon,
  },
};

export function StatusBadge({ status, className }: { status: ApplicationStatus; className?: string }) {
  const { label, cls, Icon } = MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        cls,
        className
      )}
    >
      <Icon size={13} /> {label}
    </span>
  );
}
