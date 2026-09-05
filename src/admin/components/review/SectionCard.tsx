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
        "rounded-2xl border bg-surface shadow-sm transition-colors",
        flagged ? "border-info-border ring-1 ring-info-border" : "border-border-input"
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-3.5">
        <h2 className="text-[15px] font-bold text-text">{title}</h2>
        <button
          type="button"
          onClick={onToggleFlag}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
            flagged
              ? "border-info bg-info text-white hover:bg-info-strong"
              : "border-border-input text-text-muted hover:border-border-strong"
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
                <dt className="text-xs font-medium text-text-subtle">{r.label}</dt>
                <dd className="mt-0.5 text-sm font-medium text-text">{r.value || "—"}</dd>
              </div>
            ))}
          </dl>
        )}

        {docs.length > 0 && (
          <div
            className={cn(
              "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
              rows.length > 0 && "mt-5 border-t border-border-subtle pt-4"
            )}
          >
            {docs.map((d) => (
              <DocumentPreview key={d.label} label={d.label} file={d.file} />
            ))}
          </div>
        )}

        {flagged && (
          <div className="mt-4 rounded-xl bg-info-tint p-3">
            <label className="mb-1.5 block text-xs font-semibold text-text">
              What should the driver fix?
            </label>
            <textarea
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="e.g. The license front image is blurry — please re-upload a clear photo."
              className="min-h-16 w-full resize-y rounded-lg border border-info-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-subtle outline-none focus:border-info focus:ring-2 focus:ring-info/15"
            />
          </div>
        )}
      </div>
    </section>
  );
}
