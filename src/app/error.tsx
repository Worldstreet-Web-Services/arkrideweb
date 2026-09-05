"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Route-level error boundary.
 *
 * There was none anywhere in the app. A thrown render unmounted the whole tree
 * to the root, and in production Next falls back to a bare white page reading
 * "Application error: a client-side exception has occurred". On the driver
 * verification flow that meant losing an in-progress draft to a blank screen
 * with no way back.
 *
 * Several live paths could reach it: a hand-edited or older-schema draft
 * hydrating a malformed object and then throwing on `data.guarantors.map`, an
 * unknown status destructured out of a lookup table, a bad step id. Those are
 * fixed at source too, but a boundary is what makes the next one survivable.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The digest is the only handle on the server-side stack, which is not
    // sent to the browser. Without logging it there is no way to correlate a
    // report with what actually happened.
    console.error("Unhandled error", { digest: error.digest, message: error.message });
  }, [error]);

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-5 py-16">
      <div className="w-full max-w-110 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-text">
          Something went wrong
        </h1>
        <p className="mt-2 text-[15px] text-text-muted">
          This one is on us. Your saved progress has not been lost — try again,
          or head back and pick up where you left off.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <button
            type="button"
            onClick={reset}
            className="h-12 rounded-pill bg-primary px-6 text-[15px] font-bold text-on-primary shadow-primary transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Try again
          </button>
          <Link
            href="/"
            className="grid h-12 place-items-center rounded-pill border border-border px-6 text-[15px] font-semibold text-text transition hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Back to home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-text-subtle">
            Reference: <span className="font-mono">{error.digest}</span>
          </p>
        )}
      </div>
    </main>
  );
}
