import { getMyLedger, type LedgerStatement } from "@/lib/api/wallet";
import { formatNaira } from "@/lib/api/rides";
import { requireRider } from "@/lib/api/guards";

/**
 * Rider account and money statement.
 *
 * Riders have no wallet endpoint — `/wallet/*` is driver-only and returns 403
 * for a rider token. `/ledger/me` is the closest thing: a statement of what
 * has moved, not a balance they can spend or top up. There is no top-up, no
 * card, and no cashback endpoint (the column exists but is only ever returned
 * inside the sign-in payload), so none of that is offered here.
 */
export default async function RiderAccountPage() {
  const principal = await requireRider("/app/account");

  let ledger: LedgerStatement | null = null;
  try {
    ledger = await getMyLedger(20);
  } catch {
    // A rider with no ledger activity is a normal state, and the endpoint may
    // legitimately have nothing to say. Not worth an error banner.
  }

  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-2xl font-extrabold tracking-tight text-text">Account</h1>
        <div className="mt-4 rounded-3xl border border-border bg-surface p-5 shadow-sm">
          <dl className="grid gap-3.5">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-sm text-text-muted">Name</dt>
              <dd className="text-[15px] font-semibold text-text">
                {principal.name || "—"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-sm text-text-muted">Email</dt>
              <dd className="truncate text-[15px] font-semibold text-text">
                {principal.email || "—"}
              </dd>
            </div>
            {principal.walletAddressEvm && (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-sm text-text-muted">Wallet</dt>
                <dd className="truncate font-mono text-xs text-text-muted">
                  {principal.walletAddressEvm}
                </dd>
              </div>
            )}
          </dl>

          {/*
            Editing is not offered because there is nothing to call: the API has
            no users controller at all — no GET /users/me and no PATCH. A form
            that cannot save is worse than no form.
          */}
          <p className="mt-4 border-t border-border pt-4 text-xs text-text-subtle">
            To change your details, contact support.
          </p>
        </div>
      </section>

      {ledger && (
        <section>
          <h2 className="text-lg font-bold text-text">Statement</h2>
          <p className="mt-1 text-[15px] text-text-muted">
            Balance {formatNaira(ledger.balance)}
          </p>

          {ledger.entries.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-border bg-surface px-4 py-6 text-center text-sm text-text-muted">
              Nothing here yet.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
              {ledger.entries.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-4 px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text">
                      {e.description || "Transaction"}
                    </p>
                    <time
                      dateTime={e.createdAt}
                      className="text-xs text-text-subtle"
                    >
                      {new Date(e.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-text">
                    {formatNaira(e.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
