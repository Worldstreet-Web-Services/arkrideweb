import "server-only";

import { apiFetch } from "./client";
import { toNumber } from "./ride-model";

/**
 * Money.
 *
 * NOTE ON WHO CAN CALL WHAT: `/wallet/*` is `@Roles(DRIVER)` at the controller
 * level, so a rider token gets a 403 on every route in it. Riders have no
 * wallet endpoint at all — their closest equivalent is `/ledger/me`, which is
 * a statement rather than a balance they can spend. The rider UI reflects that
 * rather than pretending otherwise.
 */

export interface DriverWallet {
  driverId: string;
  walletBalance: number;
  totalCompletedRides: number;
  fuelSupport?: {
    outstanding?: number;
    limit?: number;
  } | null;
}

export interface WalletTransaction {
  id: string;
  type: string;
  amount: number;
  description?: string;
  createdAt: string;
}

/**
 * The driver's balance.
 *
 * `walletBalance` is a Postgres numeric and arrives as a string, so it is
 * coerced here — the same reason drivers and rides are normalized.
 */
export async function getDriverWallet(): Promise<DriverWallet> {
  const { data } = await apiFetch<
    Omit<DriverWallet, "walletBalance"> & { walletBalance: string | number }
  >("/wallet/balance", { cache: "no-store" });

  return { ...data, walletBalance: toNumber(data.walletBalance) ?? 0 };
}

export async function getWalletTransactions(
  limit = 20,
  offset = 0,
): Promise<WalletTransaction[]> {
  const { data } = await apiFetch<
    (Omit<WalletTransaction, "amount"> & { amount: string | number })[]
  >(`/wallet/transactions?limit=${limit}&offset=${offset}`, {
    cache: "no-store",
  });

  return data.map((t) => ({ ...t, amount: toNumber(t.amount) ?? 0 }));
}

export interface FuelSupportLimit {
  limit: number;
  outstanding?: number;
  available?: number;
}

export async function getFuelSupportLimit(): Promise<FuelSupportLimit> {
  const { data } = await apiFetch<Record<string, string | number | null>>(
    "/wallet/fuel-support/limit",
    { cache: "no-store" },
  );

  return {
    limit: toNumber(data.limit) ?? 0,
    outstanding: toNumber(data.outstanding) ?? undefined,
    available: toNumber(data.available) ?? undefined,
  };
}

/** Minimum ₦100, enforced by the API. */
export async function requestFuelSupport(amount: number): Promise<void> {
  await apiFetch("/wallet/fuel-support/request", {
    method: "POST",
    body: { amount },
  });
}

/**
 * Withdraw earnings to a bank account.
 *
 * Minimum ₦500. `accountNumber` must be exactly 10 digits — the Nigerian NUBAN
 * format — and `bankCode` is the CBN code, e.g. "058" for GTBank.
 */
export async function requestPayout(input: {
  amount: number;
  bankAccount: {
    accountNumber: string;
    bankCode: string;
    accountName?: string;
  };
}): Promise<void> {
  await apiFetch("/wallet/payout", { method: "POST", body: input });
}

/* ------------------------------------------------------------------ ledger */

export interface LedgerEntry {
  id: string;
  amount: number;
  direction?: string;
  description?: string;
  createdAt: string;
}

export interface LedgerStatement {
  stakeholderType: "rider" | "driver";
  balance: number;
  entries: LedgerEntry[];
}

/**
 * The signed-in party's money statement.
 *
 * Open to riders and drivers alike, and the only money view a rider has.
 */
export async function getMyLedger(
  limit = 20,
  offset = 0,
): Promise<LedgerStatement> {
  const { data } = await apiFetch<
    Omit<LedgerStatement, "balance" | "entries"> & {
      balance: string | number;
      entries: (Omit<LedgerEntry, "amount"> & { amount: string | number })[];
    }
  >(`/ledger/me?limit=${limit}&offset=${offset}`, { cache: "no-store" });

  return {
    ...data,
    balance: toNumber(data.balance) ?? 0,
    entries: (data.entries ?? []).map((e) => ({
      ...e,
      amount: toNumber(e.amount) ?? 0,
    })),
  };
}
