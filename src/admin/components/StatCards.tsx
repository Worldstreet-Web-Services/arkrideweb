import { cardCls } from "@/verification/ui";
import { cn } from "@/lib/utils";
import type { Application, ApplicationStatus } from "../types";

const TILES: { key: ApplicationStatus; label: string; dot: string }[] = [
  { key: "submitted", label: "Under review", dot: "bg-amber-500" },
  { key: "changes_requested", label: "Changes requested", dot: "bg-blue-500" },
  { key: "approved", label: "Approved", dot: "bg-emerald-500" },
  { key: "rejected", label: "Rejected", dot: "bg-red-500" },
];

export function StatCards({ applications }: { applications: Application[] }) {
  const count = (s: ApplicationStatus) => applications.filter((a) => a.status === s).length;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {TILES.map((t) => (
        <div key={t.key} className={cn(cardCls, "p-4")}>
          <div className="flex items-center gap-2">
            <span className={cn("size-2 rounded-full", t.dot)} aria-hidden />
            <span className="text-xs font-semibold text-neutral-500">{t.label}</span>
          </div>
          <p className="mt-2 text-3xl font-extrabold tabular-nums text-neutral-900">{count(t.key)}</p>
        </div>
      ))}
    </div>
  );
}
