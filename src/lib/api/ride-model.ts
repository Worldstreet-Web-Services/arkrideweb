/**
 * Ride types, labels and formatting.
 *
 * Deliberately NOT `server-only`, unlike `rides.ts` which holds the fetching.
 * Client components need to render a fare and a status label, and importing
 * those from a server-only module is a build error — so the pure half lives
 * here and both sides import from it.
 *
 * Nothing in this file touches the network or reads a cookie. If something
 * here ever needs to, it belongs in `rides.ts` instead.
 */

export type RideCategory = "private" | "shared" | "okada" | "car";

export type RideStatus =
  | "requested"
  | "accepted"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled";

/** Statuses where the ride is still happening. */
export const ACTIVE_STATUSES: RideStatus[] = [
  "requested",
  "accepted",
  "arrived",
  "in_progress",
];

export function isActive(status: RideStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

export interface RideLocation {
  address: string;
  lat: number;
  lng: number;
}

export interface RideOption {
  category: RideCategory;
  displayName: string;
  estimatedFare: number;
  distanceKm: number;
  description: string;
}

export interface RideDriver {
  id: string;
  name: string;
  phone?: string;
  /**
   * Coerced by `normalizeRide`. Off the wire this is a numeric STRING like
   * "0.00", the same as every other Postgres numeric — and it is nested inside
   * the ride, so normalising the ride's own fields is not enough.
   */
  ratingAverage?: number | null;
  totalCompletedRides?: number;
  vehicles?: {
    id: string;
    type: string;
    plateNumber: string;
    color: string;
    model: string;
  }[];
  location?: { lat: number; lng: number } | null;
}

/**
 * A ride, AS THE API ACTUALLY SENDS IT.
 *
 * Two things here are not what you would guess, and both were found by running
 * a real booking rather than reading the DTOs:
 *
 * 1. `distanceKm`, `estimatedFare` and `finalFare` arrive as STRINGS —
 *    "21.71", "1819.70". They are Postgres `numeric` columns, and node-postgres
 *    hands those back as strings on purpose, because a float cannot hold every
 *    decimal exactly. TypeORM passes that through untouched.
 *
 * 2. The settled fare is `finalFare`, not `fare`. It stays null until the ride
 *    completes; `estimatedFare` is what to show before then.
 *
 * `normalizeRide` in `rides.ts` coerces the numerics at the boundary, so
 * `RideView` below — the shape the UI actually holds — has real numbers.
 * Calling `.toFixed()` on the raw wire value throws, which is exactly what it
 * did the first time this page was loaded.
 */
export interface RideWire {
  id: string;
  status: RideStatus;
  category: RideCategory;
  pickup: RideLocation;
  dropoff: RideLocation;
  distanceKm?: string | number | null;
  estimatedFare?: string | number | null;
  finalFare?: string | number | null;
  cancellationReason?: string | null;
  originChannel?: string;
  userId?: string;
  driverId?: string | null;
  vehicleId?: string | null;
  requestedAt?: string;
  acceptedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; phone?: string } | null;
  driver?: RideDriver | null;
  vehicle?: { plateNumber: string; model: string; color: string; type: string } | null;
}

/** A ride with its numerics coerced. This is what components receive. */
export interface Ride extends Omit<RideWire, "distanceKm" | "estimatedFare" | "finalFare"> {
  distanceKm: number | null;
  estimatedFare: number | null;
  finalFare: number | null;
  /** `finalFare` once settled, otherwise `estimatedFare`. */
  fare: number | null;
}

/**
 * Coerce a Postgres numeric to a number.
 *
 * Returns null rather than NaN for anything unparseable, because NaN spreads
 * silently through arithmetic and surfaces as "₦NaN" three components later.
 */
export function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export interface FareBreakdown {
  baseFare?: number;
  distanceFare?: number;
  total?: number;
  [key: string]: unknown;
}

export interface NearbyDriver {
  driver: {
    id: string;
    name: string;
    ratingAverage: number | null;
    totalCompletedRides: number;
    vehicles?: { type: string; plateNumber: string; model: string }[];
  };
  distance: number;
  location: { lat: number; lng: number };
}

/** Naira, no decimals — fares are whole naira and the kobo is noise. */
export function formatNaira(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  return `₦${Math.round(amount).toLocaleString("en-NG")}`;
}

export const STATUS_LABELS: Record<RideStatus, string> = {
  requested: "Finding a driver",
  accepted: "Driver on the way",
  arrived: "Driver has arrived",
  in_progress: "On the trip",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const CATEGORY_LABELS: Record<RideCategory, string> = {
  private: "Private Keke",
  shared: "Shared Keke",
  okada: "Okada",
  car: "Car",
};
