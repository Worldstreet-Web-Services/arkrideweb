"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { decideDriverAction, setDriverActiveAction } from "@/app/admin/actions";
import { formatNaira } from "@/lib/api/ride-model";
import type { AdminDriver, VerificationStatus } from "@/lib/api/admin";

type Filter = "pending" | "approved" | "rejected" | "suspended" | "all";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "pending", label: "Awaiting review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "suspended", label: "Suspended" },
  { key: "all", label: "All" },
];

const STATUS_TONE: Record<VerificationStatus, string> = {
  pending: "bg-warning-tint text-text ring-warning/35",
  approved: "bg-success-tint text-success-strong ring-success-border",
  rejected: "bg-danger-tint text-danger ring-danger-border",
};

export function DriverQueue({
  drivers,
  groups,
}: {
  drivers: AdminDriver[];
  groups: {
    pending: AdminDriver[];
    approved: AdminDriver[];
    rejected: AdminDriver[];
  };
}) {
  const router = useRouter();
  // Awaiting review first — it is the only list with work in it.
  const [filter, setFilter] = useState<Filter>("pending");
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const suspended = drivers.filter((d) => !d.isActive);

  const filtered = useMemo(() => {
    const base =
      filter === "all"
        ? drivers
        : filter === "suspended"
          ? suspended
          : groups[filter];

    const query = q.trim().toLowerCase();
    if (!query) return base;

    return base.filter(
      (d) =>
        d.name?.toLowerCase().includes(query) ||
        d.email?.toLowerCase().includes(query) ||
        d.phone?.includes(query) ||
        d.licenseNumber?.toLowerCase().includes(query) ||
        d.vehicles?.some((v) =>
          v.plateNumber?.toLowerCase().includes(query),
        ),
    );
  }, [drivers, groups, suspended, filter, q]);

  const run = (id: string, fn: () => Promise<{ error?: string }>) => {
    setError(null);
    setBusyId(id);
    startTransition(async () => {
      const result = await fn();
      setBusyId(null);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-[15px] text-text-muted">
          Approve or reject drivers. A driver cannot go online until they are
          approved.
        </p>
        <Link
          href="/admin/applications"
          className="rounded-pill text-sm font-semibold text-text-muted underline underline-offset-4 transition hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Document submissions
        </Link>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-4">
        <Stat label="Awaiting review" value={groups.pending.length} highlight />
        <Stat label="Approved" value={groups.approved.length} />
        <Stat label="Rejected" value={groups.rejected.length} />
        <Stat label="Suspended" value={suspended.length} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <div role="tablist" aria-label="Filter drivers" className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-pill px-3.5 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                filter === f.key
                  ? "bg-surface-inverse text-on-inverse"
                  : "border border-border text-text-muted hover:text-text"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <label className="ml-auto min-w-56 flex-1 sm:max-w-72">
          <span className="sr-only">Search drivers</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, email, phone or plate"
            className="h-11 w-full rounded-pill border border-border-input bg-surface px-4 text-sm text-text outline-none transition placeholder:text-text-placeholder focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/25"
          />
        </label>
      </div>

      <div role="alert" className="empty:hidden">
        {error && (
          <p className="mt-4 rounded-2xl border border-danger-border bg-danger-tint px-4 py-3 text-sm font-medium text-danger">
            {error}
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-border bg-surface px-4 py-12 text-center text-sm text-text-muted">
          {q ? "No drivers match that search." : "Nothing here."}
        </p>
      ) : (
        <ul className="mt-5 grid gap-2.5">
          {filtered.map((d) => (
            <li
              key={d.id}
              className="rounded-2xl border border-border bg-surface p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[15px] font-bold text-text">
                      {d.name}
                    </p>
                    <span
                      className={`rounded-pill px-2.5 py-0.5 text-xs font-semibold ring-1 ${STATUS_TONE[d.verificationStatus]}`}
                    >
                      {d.verificationStatus}
                    </span>
                    {!d.isActive && (
                      <span className="rounded-pill bg-danger-tint px-2.5 py-0.5 text-xs font-semibold text-danger ring-1 ring-danger-border">
                        suspended
                      </span>
                    )}
                    {d.isOnline && (
                      <span className="rounded-pill bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary-ink">
                        online
                      </span>
                    )}
                  </div>

                  <p className="mt-1 truncate text-sm text-text-muted">
                    {d.email} · {d.phone}
                  </p>

                  <dl className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-text-muted">
                    <Pair label="Licence" value={d.licenseNumber} />
                    <Pair
                      label="Expires"
                      value={new Date(d.licenseExpiry).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    />
                    {d.vehicles?.[0] && (
                      <Pair
                        label="Vehicle"
                        value={`${d.vehicles[0].color} ${d.vehicles[0].model} · ${d.vehicles[0].plateNumber}`}
                      />
                    )}
                    <Pair label="Trips" value={String(d.totalCompletedRides)} />
                    <Pair
                      label="Rating"
                      value={d.ratingAverage ? `${d.ratingAverage.toFixed(1)} ★` : "unrated"}
                    />
                    <Pair label="Balance" value={formatNaira(d.walletBalance)} />
                  </dl>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {d.verificationStatus !== "approved" && (
                    <button
                      type="button"
                      disabled={pending && busyId === d.id}
                      onClick={() =>
                        run(d.id, () => decideDriverAction(d.id, "approved"))
                      }
                      className="rounded-pill bg-primary px-4 py-2 text-sm font-bold text-on-primary shadow-primary transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
                    >
                      {pending && busyId === d.id ? "Working…" : "Approve"}
                    </button>
                  )}

                  {d.verificationStatus !== "rejected" && (
                    <RejectButton
                      disabled={pending && busyId === d.id}
                      onReject={(reason) =>
                        run(d.id, () =>
                          decideDriverAction(d.id, "rejected", reason),
                        )
                      }
                    />
                  )}

                  <button
                    type="button"
                    disabled={pending && busyId === d.id}
                    onClick={() =>
                      run(d.id, () => setDriverActiveAction(d.id, !d.isActive))
                    }
                    className="rounded-pill border border-border px-4 py-2 text-sm font-semibold text-text-muted transition hover:border-border-strong hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
                  >
                    {d.isActive ? "Suspend" : "Reinstate"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Reject asks for a reason before it fires.
 *
 * Worth knowing: the API accepts the reason and its controller currently
 * discards it, so the driver is not told why. It is collected and sent anyway
 * — it starts working the moment the controller is fixed, and a reviewer
 * writing one down is useful even before then.
 */
function RejectButton({
  disabled,
  onReject,
}: {
  disabled: boolean;
  onReject: (reason: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="rounded-pill border border-danger-border px-4 py-2 text-sm font-semibold text-danger transition hover:bg-danger-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger disabled:opacity-60"
      >
        Reject
      </button>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-72">
      <label className="text-xs font-semibold text-text">
        Why is this being rejected?
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          autoFocus
          className="mt-1 w-full resize-y rounded-2xl border border-border-input bg-surface px-3 py-2 text-sm font-normal text-text outline-none focus-visible:border-danger focus-visible:ring-4 focus-visible:ring-danger/25"
        />
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setReason("");
          }}
          className="h-10 flex-1 rounded-pill border border-border text-sm font-semibold text-text"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={disabled || !reason.trim()}
          onClick={() => onReject(reason.trim())}
          className="h-10 flex-1 rounded-pill bg-danger text-sm font-bold text-white disabled:opacity-40"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3.5 ${
        highlight && value > 0
          ? "border-primary bg-primary/8"
          : "border-border bg-surface"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-text">{value}</p>
    </div>
  );
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1.5">
      <dt className="font-semibold text-text-subtle">{label}</dt>
      <dd className="text-text-muted">{value}</dd>
    </div>
  );
}
