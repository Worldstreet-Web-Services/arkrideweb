"use client";

import { useVerification } from "../../store/VerificationProvider";
import type { FieldErrors } from "../../types";
import { DateField } from "../common/DateField";
import { FormField } from "../common/FormField";
import { Input } from "../common/Input";
import { Select } from "../common/Select";

const VEHICLE_TYPES = [
  { value: "Sedan", label: "Sedan" },
  { value: "SUV", label: "SUV" },
  { value: "Hatchback", label: "Hatchback" },
  { value: "Bus", label: "Bus" },
  { value: "Keke", label: "Keke (Tricycle)" },
];

// Years from next year down to 1990 — avoids free-text typos in the year field.
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR + 1 - 1990 + 1 }, (_, idx) => {
  const y = String(CURRENT_YEAR + 1 - idx);
  return { value: y, label: y };
});

export function VehicleForm({ errors }: { errors: FieldErrors }) {
  const { data, update } = useVerification();
  const v = data.vehicle;

  return (
    <>
      <FormField label="Vehicle type" error={errors.type} required>
        <Select
          value={v.type}
          onChange={(e) => update("vehicle", { type: e.target.value })}
          placeholder="Select vehicle type"
          options={VEHICLE_TYPES}
          invalid={!!errors.type}
        />
      </FormField>

      <FormField label="Make" error={errors.make} required>
        <Input
          value={v.make}
          onChange={(e) => update("vehicle", { make: e.target.value })}
          placeholder="Toyota"
          invalid={!!errors.make}
        />
      </FormField>

      <FormField label="Model" error={errors.model} required>
        <Input
          value={v.model}
          onChange={(e) => update("vehicle", { model: e.target.value })}
          placeholder="Corolla"
          invalid={!!errors.model}
        />
      </FormField>

      <FormField label="Year" error={errors.year} required>
        <Select
          value={v.year}
          onChange={(e) => update("vehicle", { year: e.target.value })}
          placeholder="Select year"
          options={YEAR_OPTIONS}
          invalid={!!errors.year}
        />
      </FormField>

      <FormField label="Color" error={errors.color} required>
        <Input
          value={v.color}
          onChange={(e) => update("vehicle", { color: e.target.value })}
          placeholder="Black"
          invalid={!!errors.color}
        />
      </FormField>

      <FormField label="Plate number" error={errors.plateNumber} required>
        <Input
          value={v.plateNumber}
          onChange={(e) => update("vehicle", { plateNumber: e.target.value.toUpperCase() })}
          placeholder="ABC-123-XY"
          invalid={!!errors.plateNumber}
        />
      </FormField>

      <FormField label="Vehicle registration number" error={errors.registrationNumber} required>
        <Input
          value={v.registrationNumber}
          onChange={(e) => update("vehicle", { registrationNumber: e.target.value })}
          placeholder="Registration number"
          invalid={!!errors.registrationNumber}
        />
      </FormField>

      <FormField label="Registration expiry date" hint="Optional">
        <DateField
          value={v.registrationExpiry}
          onChange={(val) => update("vehicle", { registrationExpiry: val })}
          flagExpiry
        />
      </FormField>
    </>
  );
}
