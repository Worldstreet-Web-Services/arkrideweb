"use client";

import { useVerification } from "../../store/VerificationProvider";
import type { FieldErrors } from "../../types";
import { FileUpload } from "../common/FileUpload";
import { FormField } from "../common/FormField";
import { Input, Textarea } from "../common/Input";

export function AddressForm({ errors }: { errors: FieldErrors }) {
  const { data, update } = useVerification();
  const a = data.address;

  return (
    <>
      <FormField label="Residential address" error={errors.residentialAddress} required>
        <Textarea
          value={a.residentialAddress}
          onChange={(e) => update("address", { residentialAddress: e.target.value })}
          placeholder="House number, street, area"
          invalid={!!errors.residentialAddress}
        />
      </FormField>

      <FormField label="State" error={errors.state} required>
        <Input
          value={a.state}
          onChange={(e) => update("address", { state: e.target.value })}
          placeholder="Lagos"
          invalid={!!errors.state}
        />
      </FormField>

      <FormField label="LGA" error={errors.lga} required>
        <Input
          value={a.lga}
          onChange={(e) => update("address", { lga: e.target.value })}
          placeholder="Ikeja"
          invalid={!!errors.lga}
        />
      </FormField>

      <FormField label="City" error={errors.city} required>
        <Input
          value={a.city}
          onChange={(e) => update("address", { city: e.target.value })}
          placeholder="Ikeja"
          invalid={!!errors.city}
        />
      </FormField>

      <FormField
        label="Proof of address"
        hint="Utility bill, bank statement or government-issued address document"
        error={errors.proofOfAddress}
        required
       group>
        <FileUpload
          value={a.proofOfAddress}
          onChange={(f) => update("address", { proofOfAddress: f })}
          label="Upload proof of address"
          invalid={!!errors.proofOfAddress}
        />
      </FormField>
    </>
  );
}
