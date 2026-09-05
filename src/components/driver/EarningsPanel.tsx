"use client";

import { useActionState, useState } from "react";
import {
  requestFuelSupportAction,
  requestPayoutAction,
} from "@/app/actions/wallet";
import type { FormState } from "@/app/actions/auth";
import { Field } from "@/components/form/Field";
import { FormError } from "@/components/form/FormError";
import { SelectField } from "@/components/form/SelectField";
import { SubmitButton } from "@/components/form/SubmitButton";
import { BANKS } from "@/lib/banks";
import { formatNaira } from "@/lib/api/ride-model";
import type {
  DriverWallet,
  FuelSupportLimit,
  WalletTransaction,
} from "@/lib/api/wallet";

const initialState: FormState = {};

export function EarningsPanel({
  wallet,
  transactions,
  fuel,
}: {
  wallet: DriverWallet | null;
  transactions: WalletTransaction[];
  fuel: FuelSupportLimit | null;
}) {
  const [tab, setTab] = useState<"payout" | "fuel">("payout");
  const [payoutState, payoutAction] = useActionState(
    requestPayoutAction,
    initialState,
  );
  const [fuelState, fuelAction] = useActionState(
    requestFuelSupportAction,
    initialState,
  );

  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-text">
          Earnings
        </h1>

        <div className="mt-4 rounded-3xl border border-border bg-surface-inverse p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-on-inverse-muted">
            Available balance
          </p>
          <p className="mt-1.5 text-4xl font-bold tracking-tight text-on-inverse">
            {wallet ? formatNaira(wallet.walletBalance) : "—"}
          </p>
          {wallet && (
            <p className="mt-1.5 text-sm text-on-inverse-muted">
              {wallet.totalCompletedRides} completed trip
              {wallet.totalCompletedRides === 1 ? "" : "s"}
            </p>
          )}
        </div>

        {!wallet && (
          <p
            role="status"
            className="mt-3 rounded-2xl border border-warning/30 bg-warning-tint px-4 py-3 text-sm font-medium text-text"
          >
            We couldn&rsquo;t load your balance just now.
          </p>
        )}
      </section>

      <section>
        {/* A real tablist, so arrow keys and the current-tab state are exposed. */}
        <div role="tablist" aria-label="Money actions" className="flex gap-1.5">
          <TabButton
            id="payout"
            active={tab === "payout"}
            onSelect={() => setTab("payout")}
          >
            Withdraw
          </TabButton>
          <TabButton
            id="fuel"
            active={tab === "fuel"}
            onSelect={() => setTab("fuel")}
          >
            Fuel support
          </TabButton>
        </div>

        <div
          role="tabpanel"
          id="panel-payout"
          aria-labelledby="tab-payout"
          hidden={tab !== "payout"}
          className="mt-4 rounded-3xl border border-border bg-surface p-5 shadow-sm"
        >
          <h2 className="text-lg font-bold text-text">Withdraw to your bank</h2>
          <p className="mt-1 text-sm text-text-muted">
            Minimum ₦500. Paid to a Nigerian bank account.
          </p>

          <form action={payoutAction} className="mt-5 grid gap-4" noValidate>
            <FormError message={payoutState.error} />

            <Field
              label="Amount"
              name="amount"
              type="number"
              inputMode="numeric"
              placeholder="5000"
              required
              error={payoutState.fieldErrors?.amount}
            />
            <SelectField
              label="Bank"
              name="bankCode"
              placeholder="Choose your bank"
              options={BANKS.map((b) => ({ value: b.code, label: b.name }))}
              required
              error={payoutState.fieldErrors?.bankCode}
            />
            <Field
              label="Account number"
              name="accountNumber"
              inputMode="numeric"
              placeholder="0123456789"
              hint="10 digits."
              required
              error={payoutState.fieldErrors?.accountNumber}
            />
            <Field
              label="Account name"
              name="accountName"
              placeholder="As it appears at your bank"
              error={payoutState.fieldErrors?.accountName}
            />

            <SubmitButton pendingLabel="Requesting…">
              Request payout
            </SubmitButton>
          </form>
        </div>

        <div
          role="tabpanel"
          id="panel-fuel"
          aria-labelledby="tab-fuel"
          hidden={tab !== "fuel"}
          className="mt-4 rounded-3xl border border-border bg-surface p-5 shadow-sm"
        >
          <h2 className="text-lg font-bold text-text">Fuel support</h2>
          <p className="mt-1 text-sm text-text-muted">
            An advance against your earnings. Minimum ₦100.
          </p>

          {fuel && (
            <dl className="mt-4 grid gap-2 rounded-2xl bg-surface-sunken px-4 py-3.5">
              <div className="flex justify-between gap-4">
                <dt className="text-sm text-text-muted">Your limit</dt>
                <dd className="text-sm font-bold text-text">
                  {formatNaira(fuel.limit)}
                </dd>
              </div>
              {fuel.outstanding !== undefined && (
                <div className="flex justify-between gap-4">
                  <dt className="text-sm text-text-muted">Outstanding</dt>
                  <dd className="text-sm font-bold text-text">
                    {formatNaira(fuel.outstanding)}
                  </dd>
                </div>
              )}
            </dl>
          )}

          <form action={fuelAction} className="mt-5 grid gap-4" noValidate>
            <FormError message={fuelState.error} />
            <Field
              label="Amount"
              name="amount"
              type="number"
              inputMode="numeric"
              placeholder="2000"
              required
              error={fuelState.fieldErrors?.amount}
            />
            <SubmitButton variant="ink" pendingLabel="Requesting…">
              Request fuel support
            </SubmitButton>
          </form>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-text">Recent activity</h2>
        {transactions.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-border bg-surface px-4 py-8 text-center text-sm text-text-muted">
            Nothing here yet.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
            {transactions.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-4 px-4 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text">
                    {t.description || t.type}
                  </p>
                  <time
                    dateTime={t.createdAt}
                    className="text-xs text-text-subtle"
                  >
                    {new Date(t.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </div>
                <span className="shrink-0 text-sm font-bold text-text">
                  {formatNaira(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function TabButton({
  id,
  active,
  onSelect,
  children,
}: {
  id: string;
  active: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={`tab-${id}`}
      aria-selected={active}
      aria-controls={`panel-${id}`}
      onClick={onSelect}
      className={`rounded-pill px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        active
          ? "bg-surface-inverse text-on-inverse"
          : "border border-border text-text-muted hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}
