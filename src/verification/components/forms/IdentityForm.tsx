"use client";

import { useVerification } from "../../store/VerificationProvider";
import type { FieldErrors, IdType } from "../../types";
import { DateField } from "../common/DateField";
import { FileUpload } from "../common/FileUpload";
import { FormField } from "../common/FormField";
import { Input } from "../common/Input";
import { RadioGroup } from "../common/RadioGroup";
import { ShieldCheckIcon } from "../icons";

const ID_LABELS: Record<IdType, string> = {
  nin: "NIN",
  passport: "International Passport",
  drivers_license: "Driver's License",
};

export function IdentityForm({ errors }: { errors: FieldErrors }) {
  const { data, update } = useVerification();
  const i = data.identity;
  // Passports and driver's licenses carry an expiry; NIN does not.
  const showExpiry = i.idType === "passport" || i.idType === "drivers_license";

  return (
    <>
      <FormField label="Identification type" error={errors.idType} required>
        <RadioGroup
          name="idType"
          value={i.idType}
          onChange={(v) => update("identity", { idType: v as IdType })}
          options={(Object.keys(ID_LABELS) as IdType[]).map((k) => ({
            value: k,
            label: ID_LABELS[k],
          }))}
        />
      </FormField>

      <FormField label="Identification number" error={errors.idNumber} required>
        <Input
          value={i.idNumber}
          onChange={(e) => update("identity", { idNumber: e.target.value })}
          placeholder="Enter your ID number"
          invalid={!!errors.idNumber}
        />
      </FormField>

      {showExpiry && (
        <FormField label="Expiry date" hint="As printed on the document">
          <DateField
            value={i.expiryDate}
            onChange={(v) => update("identity", { expiryDate: v })}
            flagExpiry
          />
        </FormField>
      )}

      <FormField label="Identification document" error={errors.document} required>
        <FileUpload
          value={i.document}
          onChange={(f) => update("identity", { document: f })}
          label="Upload your identification document"
          invalid={!!errors.document}
        />
      </FormField>

      <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
        <ShieldCheckIcon size={18} className="mt-0.5 shrink-0 text-neutral-500" />
        <p className="text-xs leading-relaxed text-neutral-500">
          Identity checks are handled by a trusted verification partner. Your documents are encrypted
          and used only to confirm your identity.
        </p>
      </div>
    </>
  );
}
