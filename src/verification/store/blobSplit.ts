/**
 * Splitting document blobs out of a JSON draft, and putting them back.
 *
 * Shared by the driver's draft (`storage.ts`) and the admin queue
 * (`applicationsStore.ts`). Both hold the same 18 base64 documents, and both
 * were writing the whole ~5.5 MB into localStorage against a ~5 MB quota — so
 * fixing only one of them would have left the other silently truncating.
 */

/** A file slot as stored in a draft or an application. */
interface FileLike {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export function isFileLike(value: unknown): value is FileLike {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as FileLike).dataUrl === "string" &&
    typeof (value as FileLike).name === "string"
  );
}

/**
 * The only schemes ever stored or returned.
 *
 * A `dataUrl` read back out of browser storage is rendered into `<img src>`
 * and `<a href>` in both the driver's portal and the reviewer's. Anything able
 * to write that storage could set it to `javascript:…` and have it run in a
 * reviewer's authenticated session. Checking on the way in AND the way out
 * means a value written around this check still cannot reach the DOM.
 */
const ALLOWED_PREFIXES = [
  "data:image/jpeg",
  "data:image/jpg",
  "data:image/png",
  "data:image/webp",
  "data:application/pdf",
];

export function isSafeDataUrl(url: unknown): url is string {
  return typeof url === "string" && ALLOWED_PREFIXES.some((p) => url.startsWith(p));
}

/**
 * Walk a value, swapping every `dataUrl` for an empty string and collecting
 * the originals keyed by their path — `identity.idDocument`,
 * `vehicle.photos.2`. Paths are stable, so re-saving overwrites rather than
 * accumulating.
 *
 * `prefix` namespaces the keys, which is how several applications share one
 * blob store without colliding.
 */
export function extractBlobs<T>(
  value: T,
  out: Map<string, string>,
  prefix = "",
): T {
  return walk(value, prefix, out) as T;
}

function walk(value: unknown, path: string, out: Map<string, string>): unknown {
  if (Array.isArray(value)) {
    return value.map((item, i) => walk(item, `${path}.${i}`, out));
  }

  if (isFileLike(value)) {
    if (!isSafeDataUrl(value.dataUrl)) {
      // Drop rather than store. A slot with an unusable URL reads as "not
      // uploaded", which is recoverable; storing it is not.
      return { ...value, dataUrl: "" };
    }
    out.set(path, value.dataUrl);
    return { ...value, dataUrl: "" };
  }

  if (typeof value === "object" && value !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      result[key] = walk(child, path ? `${path}.${key}` : key, out);
    }
    return result;
  }

  return value;
}

/** The inverse of `extractBlobs`. */
export function rehydrateBlobs<T>(
  value: T,
  blobs: Map<string, string>,
  prefix = "",
): T {
  return unwalk(value, prefix, blobs) as T;
}

function unwalk(
  value: unknown,
  path: string,
  blobs: Map<string, string>,
): unknown {
  if (Array.isArray(value)) {
    return value.map((item, i) => unwalk(item, `${path}.${i}`, blobs));
  }

  if (isFileLike(value)) {
    const stored = blobs.get(path);
    return { ...value, dataUrl: isSafeDataUrl(stored) ? stored : "" };
  }

  if (typeof value === "object" && value !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      result[key] = unwalk(child, path ? `${path}.${key}` : key, blobs);
    }
    return result;
  }

  return value;
}
