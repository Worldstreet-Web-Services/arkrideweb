"use client";

import Link from "next/link";
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
    return <div className="py-24 text-center text-sm text-text-subtle" role="status">Loading submissions…</div>;
  }

  return (
    <div>
      {/*
        This queue is browser-local. The API has no file upload and no endpoint
        for a KYC submission, so the eighteen scans a driver uploads exist only
        on the device that produced them — a submission made on a driver's
        phone is not visible here. Approving a driver so they can actually work
        happens on /admin, against the real driver records.
      */}
      <div className="mb-6 grid gap-3">
        <p className="text-[15px] text-text-muted">
          Document submissions from the verification portal.
        </p>
        <p className="rounded-2xl border border-warning/30 bg-warning-tint px-4 py-3 text-sm text-text">
          <strong className="font-semibold">Stored on this device only.</strong>{" "}
          The API has no document storage yet, so submissions made elsewhere do
          not appear here. Approving a driver to work is done on{" "}
          <Link
            href="/admin"
            className="font-semibold underline underline-offset-4"
          >
            Driver verification
          </Link>
          .
        </p>
      </div>

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
                    ? "border-text bg-surface-inverse text-white"
                    : "border-border-input bg-surface text-text-muted hover:border-border-strong"
                )}
              >
                {f.label}
                <span className={cn("tabular-nums", active ? "text-white/70" : "text-text-subtle")}>{n}</span>
              </button>
            );
          })}
        </div>

        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, plate, or ID"
          className="h-10 w-full rounded-xl border border-border-input bg-surface px-4 text-sm text-text placeholder:text-text-subtle outline-none transition-colors focus:border-text focus:ring-2 focus:ring-text/10 sm:w-72"
        />
      </div>

      <div className="mt-4">
        <ApplicationsTable applications={filtered} />
      </div>
    </div>
  );
}
