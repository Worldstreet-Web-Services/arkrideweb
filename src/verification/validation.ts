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

/** Validates a raw File before it is read/stored. */
export function checkFile(file: File): string | null {
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    return "Unsupported file. Please upload a JPG, PNG or PDF.";
  }
  if (file.size > MAX_FILE_BYTES) {
    return "File is too large. Please upload a file under 10MB.";
  }
  return null;
}
