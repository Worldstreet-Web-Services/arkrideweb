"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { bookRideAction, estimateAction } from "@/app/actions/rides";
import {
  CATEGORY_LABELS,
  formatNaira,
  type RideCategory,
  type RideOption,
} from "@/lib/api/ride-model";
import { PlacePicker, type ChosenPlace } from "./PlacePicker";

/**
 * The booking flow: choose two points, price them, pick a class, book.
 *
 * Estimating is a separate step rather than firing on every change because it
 * is a rate-limited authenticated round trip — the API allows 120 requests a
 * minute across everything, and re-pricing on each keystroke would spend that
 * budget on a user who has not finished choosing.
 */
export function BookRide() {
  const router = useRouter();
  const [pickup, setPickup] = useState<ChosenPlace | null>(null);
  const [dropoff, setDropoff] = useState<ChosenPlace | null>(null);
  const [options, setOptions] = useState<RideOption[] | null>(null);
  const [selected, setSelected] = useState<RideCategory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const ready = pickup !== null && dropoff !== null;

  const samePlace =
    ready && pickup.lat === dropoff.lat && pickup.lng === dropoff.lng;

  const getEstimate = () => {
    if (!ready || samePlace) return;
    setError(null);
    startTransition(async () => {
      const result = await estimateAction(pickup, dropoff);
      if (result.error) {
        setError(result.error);
        setOptions(null);
        return;
      }
      setOptions(result.data ?? []);
      setSelected(result.data?.[0]?.category ?? null);
    });
  };

  const book = () => {
    if (!ready || !selected) return;
    setError(null);
    startTransition(async () => {
      const result = await bookRideAction({ pickup, dropoff, category: selected });
      if (result.error || !result.data) {
        setError(result.error ?? "We couldn't book that ride.");
        return;
      }
      router.push(`/app/rides/${result.data.id}`);
    });
  };

  // Changing either end invalidates the quote — showing a stale fare for a
  // different trip would be worse than showing none.
  const setPickupAndReset = (p: ChosenPlace | null) => {
    setPickup(p);
    setOptions(null);
    setSelected(null);
  };
  const setDropoffAndReset = (p: ChosenPlace | null) => {
    setDropoff(p);
    setOptions(null);
    setSelected(null);
  };

  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-text">Where to?</h2>

      <div className="mt-5 grid gap-4">
        <PlacePicker
          label="Pickup"
          value={pickup}
          onChange={setPickupAndReset}
          placeholder="Where are you now?"
          allowCurrentLocation
        />
        <PlacePicker
          label="Drop-off"
          value={dropoff}
          onChange={setDropoffAndReset}
          placeholder="Where are you going?"
        />
      </div>

      {samePlace && (
        <p role="status" className="mt-4 text-sm font-medium text-danger">
          Pickup and drop-off are the same place.
        </p>
      )}

      <div role="alert" className="empty:hidden">
        {error && (
          <p className="mt-4 rounded-2xl border border-danger-border bg-danger-tint px-4 py-3 text-sm font-medium text-danger">
            {error}
          </p>
        )}
      </div>

      {!options && (
        <button
          type="button"
          onClick={getEstimate}
          disabled={!ready || samePlace || pending}
          aria-busy={pending}
          className="mt-5 h-12 w-full rounded-pill bg-primary text-[15px] font-bold text-on-primary shadow-primary transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.99] disabled:bg-surface-disabled disabled:text-text-disabled disabled:shadow-none"
        >
          {pending ? "Checking fares…" : "See fares"}
        </button>
      )}

      {options && (
        <div className="mt-6">
          <h3 className="text-[13px] font-bold uppercase tracking-wide text-text-subtle">
            Choose a ride
          </h3>

          {options.length === 0 ? (
            <p className="mt-3 text-sm text-text-muted">
              No rides are available for that trip right now.
            </p>
          ) : (
            <div
              role="radiogroup"
              aria-label="Ride options"
              className="mt-3 grid gap-2.5"
            >
              {options.map((o) => {
                const active = selected === o.category;
                return (
                  <label key={o.category} className="cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value={o.category}
                      checked={active}
                      onChange={() => setSelected(o.category)}
                      className="peer sr-only"
                    />
                    <span
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${
                        active
                          ? "border-primary bg-primary/8 ring-1 ring-primary"
                          : "border-border-input hover:border-border-strong"
                      }`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-semibold text-text">
                          {o.displayName || CATEGORY_LABELS[o.category]}
                        </span>
                        <span className="block text-xs text-text-muted">
                          {o.description || `${o.distanceKm.toFixed(1)} km`}
                        </span>
                      </span>
                      <span className="shrink-0 text-[15px] font-bold text-text">
                        {formatNaira(o.estimatedFare)}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          <div className="mt-5 flex gap-2.5">
            <button
              type="button"
              onClick={() => {
                setOptions(null);
                setSelected(null);
              }}
              className="h-12 rounded-pill border border-border px-5 text-[15px] font-semibold text-text transition hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Back
            </button>
            <button
              type="button"
              onClick={book}
              disabled={!selected || pending}
              aria-busy={pending}
              className="h-12 flex-1 rounded-pill bg-primary text-[15px] font-bold text-on-primary shadow-primary transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.99] disabled:bg-surface-disabled disabled:text-text-disabled disabled:shadow-none"
            >
              {pending ? "Booking…" : "Book this ride"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
