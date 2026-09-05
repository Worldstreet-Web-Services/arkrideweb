import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-5 py-16">
      <div className="w-full max-w-110 text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">404</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-text">
          We couldn&rsquo;t find that page
        </h1>
        <p className="mt-2 text-[15px] text-text-muted">
          The link may be out of date, or the page may have moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-grid h-12 place-items-center rounded-pill bg-primary px-6 text-[15px] font-bold text-on-primary shadow-primary transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
