"use client";

import { useVerification } from "../../store/VerificationProvider";
import type { FieldErrors, IdType } from "../../types";
import { FileUpload } from "../common/FileUpload";
import { FormField } from "../common/FormField";
import { Input, Textarea } from "../common/Input";
import { Select } from "../common/Select";

const ID_OPTIONS = [
  { value: "nin", label: "NIN" },
  { value: "passport", label: "International Passport" },
  { value: "drivers_license", label: "Driver's License" },
];

export function GuarantorForm({ errors }: { errors: FieldErrors }) {
  const { data, updateGuarantor } = useVerification();

  return (
    <>
      {data.guarantors.map((g, idx) => {
        const e = (field: string) => errors[`g${idx}.${field}`];
        return (
          <div
            key={idx}
            className="flex flex-col gap-4.5 rounded-2xl border border-border-input bg-surface p-5"
          >
            {data.guarantors.length > 1 && (
              <p className="text-base font-bold text-text">Guarantor {idx + 1}</p>
            )}

            <FormField label="Full name" error={e("fullName")} required>
              <Input
                value={g.fullName}
                onChange={(ev) => updateGuarantor(idx, { fullName: ev.target.value })}
                placeholder="Full name"
                invalid={!!e("fullName")}
              />
            </FormField>

            <FormField label="Phone number" error={e("phone")} required>
              <Input
                type="tel"
                value={g.phone}
                onChange={(ev) => updateGuarantor(idx, { phone: ev.target.value })}
                placeholder="0803 000 0000"
                invalid={!!e("phone")}
              />
            </FormField>

            <FormField label="Relationship with driver" error={e("relationship")} required>
              <Input
                value={g.relationship}
                onChange={(ev) => updateGuarantor(idx, { relationship: ev.target.value })}
                placeholder="e.g. Brother, Colleague"
                invalid={!!e("relationship")}
              />
            </FormField>

            <FormField label="Occupation" error={e("occupation")} required>
              <Input
                value={g.occupation}
                onChange={(ev) => updateGuarantor(idx, { occupation: ev.target.value })}
                placeholder="Occupation"
                invalid={!!e("occupation")}
              />
            </FormField>

            <FormField label="Address" error={e("address")} required>
              <Textarea
                value={g.address}
                onChange={(ev) => updateGuarantor(idx, { address: ev.target.value })}
                placeholder="Guarantor's residential address"
                invalid={!!e("address")}
              />
            </FormField>

            <FormField label="ID type" error={e("idType")} required>
              <Select
                value={g.idType}
                onChange={(ev) => updateGuarantor(idx, { idType: ev.target.value as IdType })}
                placeholder="Select ID type"
                options={ID_OPTIONS}
                invalid={!!e("idType")}
              />
            </FormField>

            <FormField label="ID number" error={e("idNumber")} required>
              <Input
                value={g.idNumber}
                onChange={(ev) => updateGuarantor(idx, { idNumber: ev.target.value })}
                placeholder="Guarantor's ID number"
                invalid={!!e("idNumber")}
              />
            </FormField>

            <FormField label="ID document" error={e("idDocument")} required group>
              <FileUpload
                value={g.idDocument}
                onChange={(f) => updateGuarantor(idx, { idDocument: f })}
                label="Upload guarantor ID"
                invalid={!!e("idDocument")}
              />
            </FormField>

            <FormField label="Photograph" error={e("photograph")} required group>
              <FileUpload
                value={g.photograph}
                onChange={(f) => updateGuarantor(idx, { photograph: f })}
                label="Upload guarantor photograph"
                invalid={!!e("photograph")}
              />
            </FormField>
          </div>
        );
      })}
    </>
  );
}
