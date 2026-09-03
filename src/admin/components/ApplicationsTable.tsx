import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRightIcon, IdCardIcon } from "@/verification/components/icons";
import { formatDate } from "../format";
import { applicantName, vehicleSummary, type Application } from "../types";
import { StatusBadge } from "./StatusBadge";

export function ApplicationsTable({ applications }: { applications: Application[] }) {
  if (applications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
        <p className="text-[15px] font-semibold text-neutral-900">No applications here</p>
        <p className="mt-1 text-sm text-neutral-500">Nothing matches this filter yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {/* Header (desktop) */}
      <div className="hidden grid-cols-[1.4fr_1.2fr_0.8fr_0.9fr_auto] gap-4 border-b border-neutral-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-400 sm:grid">
        <span>Applicant</span>
        <span>Vehicle</span>
        <span>Submitted</span>
        <span>Status</span>
        <span className="sr-only">Open</span>
      </div>

      <ul className="divide-y divide-neutral-100">
        {applications.map((a) => {
          const photo = a.data.personal.profilePhoto?.dataUrl;
          return (
            <li key={a.id}>
              <Link
                href={`/admin/${a.id}`}
                className="grid grid-cols-1 gap-2 px-5 py-4 transition-colors hover:bg-neutral-50 sm:grid-cols-[1.4fr_1.2fr_0.8fr_0.9fr_auto] sm:items-center sm:gap-4"
              >
                {/* Applicant */}
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-neutral-100 text-neutral-300">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt="" className="size-full object-cover" />
                    ) : (
                      <IdCardIcon size={22} />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-neutral-900">{applicantName(a)}</p>
                    <p className="truncate text-xs text-neutral-400">{a.id}</p>
                  </div>
                </div>

                {/* Vehicle */}
                <span className="truncate text-sm text-neutral-600">{vehicleSummary(a)}</span>

                {/* Submitted */}
                <span className="text-sm text-neutral-500">{formatDate(a.submittedAt)}</span>

                {/* Status */}
                <span><StatusBadge status={a.status} /></span>

                <span className={cn("hidden justify-self-end text-neutral-300 sm:block")}>
                  <ArrowRightIcon size={18} />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
