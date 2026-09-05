import { DriverConsole } from "@/components/driver/DriverConsole";
import { requireDriver } from "@/lib/api/guards";
import { fetchDriver } from "@/lib/api/admin";
import { getAvailableRides, getDriverRides, isActive } from "@/lib/api/rides";
import type { Ride } from "@/lib/api/rides";
import { ApiError } from "@/lib/api/types";

/**
 * The driver console.
 *
 * Loads three things: who the driver is (for approval state and the online
 * toggle), the ride they currently hold, and the open pool. The pool is only
 * fetched when they are online and free — asking for it otherwise spends a
 * request on something that cannot be acted on.
 */
export default async function DriverHome() {
  const principal = await requireDriver("/driver");

  const driver = await fetchDriver(principal.id);
  const approved = driver.verificationStatus === "approved" && driver.isActive;

  let mine: Ride[] = [];
  try {
    mine = await getDriverRides(principal.id);
  } catch {
    // A driver with no history yet — not an error worth showing.
  }
  const current = mine.find((r) => isActive(r.status)) ?? null;

  let pool: Ride[] = [];
  let poolError: string | null = null;
  if (approved && driver.isOnline && !current) {
    try {
      pool = await getAvailableRides();
    } catch (error) {
      poolError =
        error instanceof ApiError
          ? error.message
          : "We couldn't load available rides.";
    }
  }

  return (
    <DriverConsole
      driver={driver}
      current={current}
      pool={pool}
      poolError={poolError}
      completedToday={mine.filter((r) => r.status === "completed").length}
    />
  );
}
