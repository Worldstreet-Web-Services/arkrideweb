import type { UploadedFile } from "./types";

/**
 * Small, dependency-free validators. Each returns an error string when the
 * value is invalid, or `null` when it's fine — so callers can build a
 * FieldErrors map by dropping the nulls.
 */

export function required(value: string | null | undefined, label = "This field"): string | null {
  return value && String(value).trim() ? null : `${label} is required.`;
}

export function email(value: string): string | null {
  if (!value.trim()) return "Email is required.";
  // Simple, permissive check — good enough for form UX.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : "Please enter a valid email address.";
}

/** Nigerian phone: 11 local digits (0803…) or +234 followed by 10 digits. */
export function phoneNG(value: string): string | null {
  if (!value.trim()) return "Phone number is required.";
  const digits = value.replace(/[\s-]/g, "");
  const ok = /^0\d{10}$/.test(digits) || /^\+?234\d{10}$/.test(digits);
  return ok ? null : "Please enter a valid phone number.";
}

export function dateRequired(value: string, label = "Date"): string | null {
  if (!value) return `${label} is required.`;
  return Number.isNaN(Date.parse(value)) ? `Please enter a valid ${label.toLowerCase()}.` : null;
}

/** True when an ISO date is in the past (used to flag expired documents). */
export function isExpired(value: string): boolean {
  if (!value) return false;
  const d = Date.parse(value);
  if (Number.isNaN(d)) return false;
  return d < Date.now();
}

export function fileRequired(file: UploadedFile | null, label = "Document"): string | null {
  return file ? null : `Please upload the ${label.toLowerCase()}.`;
}

export const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB source cap (before downscale)

/**
 * Cheap checks that need no I/O. Run first so an obviously wrong file is
 * rejected instantly.
 *
 * `file.type` here is the BROWSER'S GUESS FROM THE FILENAME, not the content.
 * Renaming `payload.svg` to `payload.pdf` makes this report `application/pdf`.
 * So this is a courtesy check for honest mistakes, and `checkFileContents`
 * below is the one that actually verifies anything.
 */
export function checkFile(file: File): string | null {
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    return "Unsupported file. Please upload a JPG, PNG or PDF.";
  }
  if (file.size > MAX_FILE_BYTES) {
    return "File is too large. Please upload a file under 10MB.";
  }
  return null;
}

/**
 * Verify the file really is what its name claims, by its leading bytes.
 *
 * Every format worth accepting starts with a fixed signature, and unlike the
 * extension the bytes cannot be renamed. Without this, an attacker (or a
 * confused user) stores arbitrary content that a reviewer later opens from
 * `<a href={dataUrl}>` in an authenticated admin session.
 *
 * This is a client-side check and can be bypassed by anyone driving the API
 * directly. It is not a substitute for server-side validation — which does not
 * exist yet, because the backend has no upload endpoint at all. When one is
 * added, this same check has to be repeated there, and THAT is the one that
 * counts. This only keeps bad content out of the reviewer's browser.
 */
const SIGNATURES: { mime: string; bytes: number[]; offset?: number }[] = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] }, // "%PDF"
  // WebP is RIFF....WEBP — the size field sits between the two markers.
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] },
];

export async function checkFileContents(file: File): Promise<string | null> {
  const sync = checkFile(file);
  if (sync) return sync;

  let head: Uint8Array;
  try {
    head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  } catch {
    return "We couldn't read that file. Please try again.";
  }

  const matches = SIGNATURES.some(({ bytes, offset = 0 }) =>
    bytes.every((b, i) => head[offset + i] === b),
  );

  if (!matches) {
    // Deliberately does not say "signature mismatch" — that is noise to a
    // driver who renamed a screenshot, and a hint to anyone probing.
    return "That file doesn't look like a JPG, PNG or PDF. Please upload a photo or a PDF.";
  }

  return null;
}
