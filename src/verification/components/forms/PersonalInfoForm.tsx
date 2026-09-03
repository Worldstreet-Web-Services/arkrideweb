"use client";

import { useVerification } from "../../store/VerificationProvider";
import type { FieldErrors } from "../../types";
import { DateField } from "../common/DateField";
import { FileUpload } from "../common/FileUpload";
import { FormField } from "../common/FormField";
import { Input, Textarea } from "../common/Input";
import { RadioGroup } from "../common/RadioGroup";

const today = new Date().toISOString().slice(0, 10);

export function PersonalInfoForm({ errors }: { errors: FieldErrors }) {
  const { data, update } = useVerification();
  const p = data.personal;

  return (
    <>
      <FormField label="First name" error={errors.firstName} required>
        <Input
          value={p.firstName}
          onChange={(e) => update("personal", { firstName: e.target.value })}
          placeholder="John"
          invalid={!!errors.firstName}
        />
      </FormField>

      <FormField label="Middle name">
        <Input
          value={p.middleName}
          onChange={(e) => update("personal", { middleName: e.target.value })}
          placeholder="Optional"
        />
      </FormField>

      <FormField label="Last name" error={errors.lastName} required>
        <Input
          value={p.lastName}
          onChange={(e) => update("personal", { lastName: e.target.value })}
          placeholder="Doe"
          invalid={!!errors.lastName}
        />
      </FormField>

      <FormField label="Date of birth" error={errors.dob} required>
        <DateField
          value={p.dob}
          onChange={(v) => update("personal", { dob: v })}
          invalid={!!errors.dob}
          max={today}
        />
      </FormField>

      <FormField label="Gender" error={errors.gender} required>
        <RadioGroup
          name="gender"
          value={p.gender}
          onChange={(v) => update("personal", { gender: v as typeof p.gender })}
          columns={3}
          options={[
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" },
          ]}
        />
      </FormField>

      <FormField label="Phone number" error={errors.phone} required>
        <Input
          type="tel"
          value={p.phone}
          onChange={(e) => update("personal", { phone: e.target.value })}
          placeholder="0803 000 0000"
          invalid={!!errors.phone}
        />
      </FormField>

      <FormField label="Email" error={errors.email} required>
        <Input
          type="email"
          value={p.email}
          onChange={(e) => update("personal", { email: e.target.value })}
          placeholder="you@example.com"
          invalid={!!errors.email}
        />
      </FormField>

      <FormField label="Occupation" error={errors.occupation} required>
        <Input
          value={p.occupation}
          onChange={(e) => update("personal", { occupation: e.target.value })}
          placeholder="Driver"
          invalid={!!errors.occupation}
        />
      </FormField>

      <FormField label="Residential address" error={errors.residentialAddress} required>
        <Textarea
          value={p.residentialAddress}
          onChange={(e) => update("personal", { residentialAddress: e.target.value })}
          placeholder="House number, street, area, city"
          invalid={!!errors.residentialAddress}
        />
      </FormField>

      <FormField label="Profile photograph" error={errors.profilePhoto} required>
        <FileUpload
          value={p.profilePhoto}
          onChange={(f) => update("personal", { profilePhoto: f })}
          label="Upload a clear photo of yourself"
          invalid={!!errors.profilePhoto}
        />
      </FormField>
    </>
  );
}
