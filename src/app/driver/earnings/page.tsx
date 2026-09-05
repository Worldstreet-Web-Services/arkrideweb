import { EarningsPanel } from "@/components/driver/EarningsPanel";
import { requireDriver } from "@/lib/api/guards";
import {
  getDriverWallet,
  getFuelSupportLimit,
  getWalletTransactions,
  type DriverWallet,
  type FuelSupportLimit,
  type WalletTransaction,
} from "@/lib/api/wallet";

/**
 * Driver earnings, payouts and fuel support.
 *
 * The three loads are independent and each is allowed to fail on its own: a
 * driver should still see their balance if the fuel-support limit endpoint is
 * down, and still see transactions if the limit is not configured.
 */
export default async function DriverEarningsPage() {
  await requireDriver("/driver/earnings");

  const [wallet, transactions, fuel] = await Promise.all([
    getDriverWallet().catch(() => null),
    getWalletTransactions(20).catch(() => [] as WalletTransaction[]),
    getFuelSupportLimit().catch(() => null),
  ]);

  return (
    <EarningsPanel
      wallet={wallet as DriverWallet | null}
      transactions={transactions}
      fuel={fuel as FuelSupportLimit | null}
    />
  );
}
