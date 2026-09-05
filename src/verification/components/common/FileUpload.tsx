"use client";

import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import type { UploadedFile } from "../../types";
import { checkFileContents } from "../../validation";
import { useFieldContext } from "./FormField";
import { CameraIcon, CheckIcon, EyeIcon, FileIcon, ReplaceIcon, TrashIcon, UploadIcon } from "../icons";
import { processFile } from "./processFile";

/**
 * Document/photo upload control.
 * Empty: dropzone with "Take Photo" (camera) + "Choose File".
 * Filled: preview (image thumb or PDF chip) + Preview / Replace / Remove.
 */
export function FileUpload({
  value,
  onChange,
  label = "Upload document",
  compact = false,
  invalid = false,
}: {
  value: UploadedFile | null;
  onChange: (file: UploadedFile | null) => void;
  label?: string;
  compact?: boolean;
  invalid?: boolean;
}) {
  const field = useFieldContext();

  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    // Async now: the content check reads the file's leading bytes, because
    // `file.type` is only the browser guessing from the filename.
    setBusy(true);
    const problem = await checkFileContents(file);
    if (problem) {
      setError(problem);
      setBusy(false);
      return;
    }
    setError(null);
    try {
      onChange(await processFile(file));
    } catch {
      setError("We couldn't read that file. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const isImage = value?.type.startsWith("image/");
  const miniBtn =
    "inline-flex items-center gap-1.5 rounded-full border border-border-strong px-3.5 py-2 text-[13px] font-semibold text-text transition-colors hover:border-text hover:bg-surface-hover disabled:opacity-50";
  const actionBtn = "inline-flex items-center gap-1 transition-colors";

  return (
    <div>
      <input
        ref={cameraRef}
        type="file"
        accept="image/jpeg,image/png"
        capture="environment"
        hidden
        aria-label={`Take a photo of ${label.toLowerCase()}`}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        hidden
        aria-label={`Choose a file for ${label.toLowerCase()}`}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {!value ? (
        <div
          role="group"
          aria-labelledby={field?.labelId}
          aria-describedby={field?.describedBy}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex flex-col items-center rounded-2xl border border-dashed bg-surface text-center transition-colors",
            compact ? "gap-2 p-4" : "gap-3 px-4 py-6",
            dragOver
              ? "border-text bg-surface-hover"
              : invalid || field?.invalid
                ? "border-danger"
                : "border-border-strong hover:border-text-subtle"
          )}
        >
          <span
            className={cn(
              "grid place-items-center rounded-full transition-colors",
              dragOver ? "bg-surface-inverse text-white" : "bg-surface-sunken text-text-muted",
              compact ? "size-9" : "size-12"
            )}
            aria-hidden
          >
            <UploadIcon size={compact ? 18 : 22} />
          </span>
          {!compact && (
            <div>
              <p className="text-[15px] font-semibold text-text">{label}</p>
              <p className="text-xs text-text-subtle">Drag &amp; drop, or choose · JPG, PNG or PDF · up to 10MB</p>
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" className={miniBtn} onClick={() => cameraRef.current?.click()} disabled={busy}>
              <CameraIcon size={15} /> Take Photo
            </button>
            <button type="button" className={miniBtn} onClick={() => fileRef.current?.click()} disabled={busy}>
              <UploadIcon size={15} /> {busy ? "Uploading…" : "Choose File"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-border-input bg-surface p-3 shadow-sm">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.dataUrl} alt={value.name} className="size-12 shrink-0 rounded-lg object-cover" />
          ) : (
            <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-surface-sunken text-text-muted">
              <FileIcon size={22} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-[13px] font-semibold text-text">
              <CheckIcon size={15} className="shrink-0 text-success-strong" />
              <span className="truncate">{value.name}</span>
            </p>
            <div className="mt-1.5 flex gap-3.5 text-xs font-medium text-text-muted">
              <a href={value.dataUrl} target="_blank" rel="noreferrer" className={`${actionBtn} hover:text-text`}>
                <EyeIcon size={14} /> Preview
              </a>
              <button type="button" onClick={() => fileRef.current?.click()} className={`${actionBtn} hover:text-text`}>
                <ReplaceIcon size={14} /> Replace
              </button>
              <button type="button" onClick={() => onChange(null)} className={`${actionBtn} text-danger hover:text-danger`}>
                <TrashIcon size={14} /> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
