"use client";

import { useId, useMemo, useState } from "react";
import { searchPlaces, placeLabel, type Place } from "@/lib/places/lagos";

export interface ChosenPlace {
  address: string;
  lat: number;
  lng: number;
}

/**
 * Pick a pickup or drop-off point.
 *
 * A combobox over a fixed list rather than a free-text address field, because
 * the API validates coordinates and there is no geocoder to produce them —
 * see `lib/places/lagos.ts`. Typing filters; it does not accept arbitrary text,
 * because arbitrary text cannot be booked.
 *
 * Built on the ARIA combobox pattern rather than a bare input plus a div, so
 * the option count is announced and arrow keys work.
 */
export function PlacePicker({
  label,
  value,
  onChange,
  placeholder,
  allowCurrentLocation = false,
}: {
  label: string;
  value: ChosenPlace | null;
  onChange: (place: ChosenPlace | null) => void;
  placeholder?: string;
  allowCurrentLocation?: boolean;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const results = useMemo(() => searchPlaces(query), [query]);

  const choose = (place: Place) => {
    onChange({ address: placeLabel(place), lat: place.lat, lng: place.lng });
    setQuery("");
    setOpen(false);
    setActiveIndex(-1);
  };

  const useCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      setGeoError("This browser cannot share your location.");
      return;
    }
    setLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          // No reverse geocoder either, so the label is honest about being a
          // pin rather than inventing a street name.
          address: "Current location",
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        });
        setLocating(false);
        setOpen(false);
      },
      (err) => {
        setLocating(false);
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Location access was blocked. Pick a place from the list instead."
            : "We couldn't get your location. Pick a place from the list instead.",
        );
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && open && activeIndex >= 0) {
      e.preventDefault();
      choose(results[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-text">
        {label}
      </label>

      {value ? (
        <div className="flex items-center gap-3 rounded-2xl border border-border-input bg-surface px-4 py-3">
          <span className="min-w-0 flex-1 truncate text-[15px] text-text">
            {value.address}
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="shrink-0 rounded-pill px-2 py-1 text-xs font-semibold text-text-muted underline underline-offset-4 transition hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Change<span className="sr-only"> {label.toLowerCase()}</span>
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            id={id}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
            }
            value={query}
            placeholder={placeholder ?? "Search for a place"}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            className="h-12 w-full rounded-2xl border border-border-input bg-surface px-4 text-base text-text outline-none transition placeholder:text-text-placeholder focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/25"
          />

          {open && (
            <ul
              id={listId}
              role="listbox"
              aria-label={`${label} suggestions`}
              className="absolute z-20 mt-1.5 max-h-64 w-full overflow-auto rounded-2xl border border-border bg-surface py-1.5 shadow-lg"
            >
              {allowCurrentLocation && (
                <li>
                  <button
                    type="button"
                    onClick={useCurrentLocation}
                    disabled={locating}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[15px] font-semibold text-text transition hover:bg-surface-hover disabled:opacity-60"
                  >
                    {locating ? "Getting your location…" : "Use my current location"}
                  </button>
                </li>
              )}

              {results.length === 0 ? (
                <li className="px-4 py-3 text-sm text-text-muted">
                  Nothing matched. Try an area, like &ldquo;Lekki&rdquo;.
                </li>
              ) : (
                results.map((p, i) => (
                  <li key={p.id} id={`${listId}-${i}`} role="option" aria-selected={i === activeIndex}>
                    <button
                      type="button"
                      // Mouse down rather than click: the input's blur would
                      // otherwise close the list before the click lands.
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => choose(p)}
                      className={`flex w-full flex-col items-start px-4 py-2.5 text-left transition hover:bg-surface-hover ${
                        i === activeIndex ? "bg-surface-hover" : ""
                      }`}
                    >
                      <span className="text-[15px] text-text">{p.name}</span>
                      <span className="text-xs text-text-muted">{p.area}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}

      {geoError && (
        <p role="status" className="text-xs font-medium text-danger">
          {geoError}
        </p>
      )}
    </div>
  );
}
