"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerDriverAction, type FormState } from "@/app/actions/auth";
import { Field } from "@/components/form/Field";
import { FormError } from "@/components/form/FormError";
import { SelectField } from "@/components/form/SelectField";
import { SubmitButton } from "@/components/form/SubmitButton";

const initialState: FormState = {};

const VEHICLE_TYPES = [
  { value: "keke", label: "Keke (tricycle)" },
  { value: "bike", label: "Okada (motorcycle)" },
  { value: "car", label: "Car" },
  { value: "courier", label: "Courier" },
];

/** Tomorrow, as an ISO date — the licence expiry must be in the future. */
function minExpiry(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function DriverRegisterForm() {
  const [state, formAction] = useActionState(registerDriverAction, initialState);
  const currentYear = new Date().getFullYear();

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-text">
        Apply to drive
      </h1>
      <p className="mt-1.5 text-[15px] text-text-muted">
        Tell us about you and your vehicle. Verification comes next.
      </p>

      <form action={formAction} className="mt-7 grid gap-4" noValidate>
        <FormError message={state.error} />

        <fieldset className="grid gap-4">
          <legend className="mb-1 text-[13px] font-bold uppercase tracking-wide text-text-subtle">
            About you
          </legend>

          <Field
            label="Full name"
            name="name"
            autoComplete="name"
            placeholder="Chidi Nwosu"
            required
            error={state.fieldErrors?.name}
          />
          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            error={state.fieldErrors?.email}
          />
          {/*
            Driver phone must be `+234…` or `0…` — a different rule from rider
            registration, which wants bare digits. The action normalises.
          */}
          <Field
            label="Phone number"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0801 234 5678"
            hint="Nigerian mobile number, starting 070, 080, 081, 090 or 091."
            required
            error={state.fieldErrors?.phone}
          />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            hint="At least 8 characters."
            required
            error={state.fieldErrors?.password}
          />
        </fieldset>

        <fieldset className="mt-2 grid gap-4">
          <legend className="mb-1 text-[13px] font-bold uppercase tracking-wide text-text-subtle">
            Your licence
          </legend>

          <Field
            label="Licence number"
            name="licenseNumber"
            placeholder="AKW12345AA"
            required
            error={state.fieldErrors?.licenseNumber}
          />
          <Field
            label="Licence expiry"
            name="licenseExpiry"
            type="date"
            hint="Must not have expired."
            required
            defaultValue=""
            error={state.fieldErrors?.licenseExpiry}
          />
        </fieldset>

        <fieldset className="mt-2 grid gap-4">
          <legend className="mb-1 text-[13px] font-bold uppercase tracking-wide text-text-subtle">
            Your vehicle
          </legend>

          <SelectField
            label="Vehicle type"
            name="vehicleType"
            placeholder="Choose a type"
            options={VEHICLE_TYPES}
            required
            error={state.fieldErrors?.vehicleType}
          />
          <Field
            label="Plate number"
            name="plateNumber"
            placeholder="LSD 123 AB"
            required
            error={state.fieldErrors?.plateNumber}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Model"
              name="vehicleModel"
              placeholder="Bajaj RE"
              required
              error={state.fieldErrors?.vehicleModel}
            />
            <Field
              label="Colour"
              name="vehicleColor"
              placeholder="Yellow"
              required
              error={state.fieldErrors?.vehicleColor}
            />
          </div>
          <Field
            label="Year"
            name="vehicleYear"
            type="number"
            inputMode="numeric"
            placeholder={String(currentYear - 5)}
            hint={`Between 1990 and ${currentYear + 1}.`}
            required
            error={state.fieldErrors?.vehicleYear}
          />
        </fieldset>

        <SubmitButton pendingLabel="Creating account…">
          Create driver account
        </SubmitButton>
      </form>

      <p className="mt-7 text-center text-sm text-text-muted">
        Already driving with us?{" "}
        <Link
          href="/driver-login"
          className="rounded-pill font-semibold text-text underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

/** Kept out of the component so the date is computed once per render tree. */
export const MIN_EXPIRY = minExpiry();
