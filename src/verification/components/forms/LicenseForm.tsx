"use client";

import { useVerification } from "../../store/VerificationProvider";
import type { FieldErrors } from "../../types";
import { DateField } from "../common/DateField";
import { FileUpload } from "../common/FileUpload";
import { FormField } from "../common/FormField";
import { Input } from "../common/Input";

export function LicenseForm({ errors }: { errors: FieldErrors }) {
  const { data, update } = useVerification();
  const l = data.license;

  return (
    <>
      <FormField label="License number" error={errors.number} required>
        <Input
          value={l.number}
          onChange={(e) => update("license", { number: e.target.value })}
          placeholder="Enter license number"
          invalid={!!errors.number}
        />
      </FormField>

      <FormField label="License category / class" error={errors.category} required>
        <Input
          value={l.category}
          onChange={(e) => update("license", { category: e.target.value })}
          placeholder="e.g. C"
          invalid={!!errors.category}
        />
      </FormField>

      <FormField label="Issue date" error={errors.issueDate} required>
        <DateField
          value={l.issueDate}
          onChange={(v) => update("license", { issueDate: v })}
          invalid={!!errors.issueDate}
          max={new Date().toISOString().slice(0, 10)}
        />
      </FormField>

      <FormField
        label="Expiry date"
        hint="An expired license must be renewed before you can drive"
        error={errors.expiryDate}
        required
      >
        <DateField
          value={l.expiryDate}
          onChange={(v) => update("license", { expiryDate: v })}
          invalid={!!errors.expiryDate}
          flagExpiry
        />
      </FormField>

      <FormField label="Driver's license — front" error={errors.front} required>
        <FileUpload
          value={l.front}
          onChange={(f) => update("license", { front: f })}
          label="Upload the front of your license"
          invalid={!!errors.front}
        />
      </FormField>

      <FormField label="Driver's license — back" hint="Optional, if applicable">
        <FileUpload
          value={l.back}
          onChange={(f) => update("license", { back: f })}
          label="Upload the back of your license"
        />
      </FormField>
    </>
  );
}
