import type { Metadata } from "next";
import { ArkLogo } from "@/components/brand/ArkLogo";
import { AdminLoginForm } from "./AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin sign in | Arkride",
  robots: { index: false, follow: false },
};

/**
 * Why the "not an admin" case says so plainly:
 *
 * The alternative — showing the same generic message for a wrong password and
 * for a valid non-admin account — sounds safer but is not. The person has
 * already authenticated, so nothing is being disclosed to a stranger, and
 * hiding it means a driver who wanders here retries their correct password
 * until the rate limiter locks them out of the app they can actually use.
 */
const REASONS: Record<string, string> = {
  expired: "Your session expired. Please sign in again.",
  forbidden: "That account does not have admin access.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  // Async in Next 16.
  searchParams: Promise<{ next?: string; reason?: string }>;
}) {
  const { next, reason } = await searchParams;

  // Never round-trip an off-site URL through the form. The action validates
  // this again server-side; this is just so nothing odd is rendered.
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/admin";

  const notice = reason ? REASONS[reason] : undefined;

  return (
    <div className="verify-portal scheme-light grid min-h-dvh place-items-center bg-bg px-5 py-12">
      <div className="w-full max-w-100">
        <div className="mb-7 flex flex-col items-center gap-3 text-center">
          <ArkLogo className="h-7 w-auto text-text" aria-hidden />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">
              Verification review
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Sign in with your Arkride admin account.
            </p>
          </div>
        </div>

        {notice && (
          <p
            role="status"
            className="mb-4 rounded-2xl border border-warning/30 bg-warning-tint px-4 py-3 text-sm font-medium text-text"
          >
            {notice}
          </p>
        )}

        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <AdminLoginForm next={safeNext} />
        </div>

        <p className="mt-5 text-center text-xs text-text-subtle">
          Admin access is granted by the Arkride operations team.
        </p>
      </div>
    </div>
  );
}
