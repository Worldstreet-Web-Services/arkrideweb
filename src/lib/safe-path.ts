/**
 * Only allow redirects to a path on this site.
 *
 * A `next` parameter taken at face value is an open redirect: an attacker
 * sends `/login?next=https://evil.example` and the victim is bounced off-site
 * immediately after authenticating, with the muscle memory of having just
 * typed their password. Requiring a single leading slash — and rejecting
 * `//host`, which browsers read as protocol-relative — keeps it on this origin.
 *
 * Shared so the page and the Server Action apply the same rule. The action's
 * check is the one that matters; the page's only avoids rendering something
 * odd into the form.
 */
export function safeInternalPath(next: unknown, fallback: string): string {
  if (typeof next !== "string" || next.length === 0) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  // A backslash is normalised to a forward slash by some browsers, so `/\evil`
  // can escape the origin too.
  if (next.startsWith("/\\")) return fallback;
  return next;
}
