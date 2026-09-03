import { EyeIcon, FileIcon } from "@/verification/components/icons";
import type { UploadedFile } from "@/verification/types";

/** Read-only thumbnail for a submitted document/photo, with a caption + open link. */
export function DocumentPreview({ label, file }: { label: string; file: UploadedFile | null }) {
  const isImage = file?.type.startsWith("image/");
  return (
    <div>
      <div className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
        {file ? (
          isImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={file.dataUrl} alt={label} className="size-full object-cover" />
              <a
                href={file.dataUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0 grid place-items-center bg-neutral-900/0 text-white opacity-0 transition-all hover:bg-neutral-900/40 hover:opacity-100"
                aria-label={`Open ${label}`}
              >
                <EyeIcon size={22} />
              </a>
            </>
          ) : (
            <a
              href={file.dataUrl}
              target="_blank"
              rel="noreferrer"
              className="flex size-full flex-col items-center justify-center gap-1.5 text-neutral-500 hover:text-neutral-900"
            >
              <FileIcon size={26} />
              <span className="text-xs font-semibold">Open PDF</span>
            </a>
          )
        ) : (
          <div className="grid size-full place-items-center text-xs font-medium text-neutral-400">
            Not provided
          </div>
        )}
      </div>
      <p className="mt-1.5 text-xs font-medium text-neutral-600">{label}</p>
    </div>
  );
}
