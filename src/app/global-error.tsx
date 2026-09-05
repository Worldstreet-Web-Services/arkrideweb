"use client";

/**
 * Last-resort boundary, for a failure in the root layout itself.
 *
 * This one replaces the entire document, so it has to render its own <html>
 * and <body> — the layout that would normally provide them is what failed.
 * For the same reason it cannot rely on the app's CSS being loaded, so the
 * styles here are inline.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#f5f7f8",
          color: "#152531",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
          padding: "2rem 1.25rem",
        }}
      >
        <div style={{ maxWidth: "26rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>
            Arkride is temporarily unavailable
          </h1>
          <p style={{ marginTop: "0.5rem", color: "#69707e", fontSize: "0.9375rem" }}>
            Something failed while loading the page. Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              height: "3rem",
              padding: "0 1.5rem",
              borderRadius: "999px",
              border: "none",
              background: "#f3ba3f",
              color: "#000",
              fontSize: "0.9375rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "#6a6f78" }}>
              Reference: <code>{error.digest}</code>
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
