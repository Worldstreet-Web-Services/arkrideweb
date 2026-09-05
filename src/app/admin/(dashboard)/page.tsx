"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ApplicationsTable } from "@/admin/components/ApplicationsTable";
import { StatCards } from "@/admin/components/StatCards";
import { useApplications } from "@/admin/hooks";
import { applicantName, vehicleSummary, type ApplicationStatus } from "@/admin/types";

type Filter = "all" | ApplicationStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "submitted", label: "Under review" },
  { key: "changes_requested", label: "Changes requested" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function AdminQueuePage() {
  const apps = useApplications();
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!apps) return [];
    const query = q.trim().toLowerCase();
    return apps.filter((a) => {
      if (filter !== "all" && a.status !== filter) return false;
      if (!query) return true;
      return (
        applicantName(a).toLowerCase().includes(query) ||
        vehicleSummary(a).toLowerCase().includes(query) ||
        a.id.toLowerCase().includes(query)
      );
    });
  }, [apps, filter, q]);

  if (!apps) {
    return <div className="py-24 text-center text-sm text-neutral-400">Loading applications…</div>;
  }

  return (
    <div>
      <p className="mb-6 text-[15px] text-neutral-500">
        Review submissions and approve, reject, or request changes.
      </p>

      <StatCards applications={apps} />

      {/* Controls */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            const n = f.key === "all" ? apps.length : apps.filter((a) => a.status === f.key).length;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                  active
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                )}
              >
                {f.label}
                <span className={cn("tabular-nums", active ? "text-white/70" : "text-neutral-400")}>{n}</span>
              </button>
            );
          })}
        </div>

        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, plate, or ID"
          className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 sm:w-72"
        />
      </div>

      <div className="mt-4">
        <ApplicationsTable applications={filtered} />
      </div>
    </div>
  );
}
