"use client";

import { cn } from "@/lib/utils";
import { CheckIcon, WarningIcon } from "@/verification/components/icons";
import type { UploadedFile } from "@/verification/types";
import { DocumentPreview } from "./DocumentPreview";

export interface Row {
  label: string;
  value: string;
}
export interface Doc {
  label: string;
  file: UploadedFile | null;
}

/**
 * One read-only verification section with a "Request change" toggle. When
 * flagged, a note explains what the driver must fix; that note flows into the
 * request-changes decision.
 */
export function SectionCard({
  title,
  rows = [],
  docs = [],
  flagged,
  note,
  onToggleFlag,
  onNoteChange,
}: {
  title: string;
  rows?: Row[];
  docs?: Doc[];
  flagged: boolean;
  note: string;
  onToggleFlag: () => void;
  onNoteChange: (v: string) => void;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors",
        flagged ? "border-blue-300 ring-1 ring-blue-200" : "border-neutral-200"
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b border-neutral-100 px-5 py-3.5">
        <h2 className="text-[15px] font-bold text-neutral-900">{title}</h2>
        <button
          type="button"
          onClick={onToggleFlag}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
            flagged
              ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
              : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
          )}
        >
          {flagged ? <CheckIcon size={13} /> : <WarningIcon size={13} />}
          {flagged ? "Flagged" : "Request change"}
        </button>
      </header>

      <div className="px-5 py-4">
        {rows.length > 0 && (
          <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {rows.map((r) => (
              <div key={r.label} className="flex flex-col">
                <dt className="text-xs font-medium text-neutral-400">{r.label}</dt>
                <dd className="mt-0.5 text-sm font-medium text-neutral-900">{r.value || "—"}</dd>
              </div>
            ))}
          </dl>
        )}

        {docs.length > 0 && (
          <div
            className={cn(
              "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
              rows.length > 0 && "mt-5 border-t border-neutral-100 pt-4"
            )}
          >
            {docs.map((d) => (
              <DocumentPreview key={d.label} label={d.label} file={d.file} />
            ))}
          </div>
        )}

        {flagged && (
          <div className="mt-4 rounded-xl bg-blue-50 p-3">
            <label className="mb-1.5 block text-xs font-semibold text-blue-900">
              What should the driver fix?
            </label>
            <textarea
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="e.g. The license front image is blurry — please re-upload a clear photo."
              className="min-h-16 w-full resize-y rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
            />
          </div>
        )}
      </div>
    </section>
  );
}
