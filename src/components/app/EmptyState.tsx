import Link from "next/link";

/**
 * One empty state, used everywhere.
 *
 * There were six, all different: bare sentences with four different paddings,
 * two of them with no container at all. A brand-new rider's Trips page
 * rendered as literally two lines of text on an 800px-wide page with no way
 * back — the most likely first screen after sign-up, and the emptiest.
 *
 * An empty state is a screen someone WILL see, usually on their first visit,
 * so it gets a shape, one short line, and somewhere to go next.
 */
export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center">
      {icon && (
        <span
          aria-hidden
          className="mb-4 grid size-12 place-items-center rounded-full bg-surface-sunken text-text-subtle"
        >
          {icon}
        </span>
      )}
      <p className="text-[15px] font-semibold text-text">{title}</p>
      {body && (
        <p className="mt-1 max-w-64 text-sm text-text-muted">{body}</p>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-5 inline-grid h-11 place-items-center rounded-pill bg-primary px-5 text-sm font-bold text-on-primary shadow-primary transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
