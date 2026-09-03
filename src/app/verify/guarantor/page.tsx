"use client";

import { StepScreen } from "@/verification/components/StepScreen";
import { GuarantorForm } from "@/verification/components/forms/GuarantorForm";

export default function GuarantorPage() {
  return (
    <StepScreen stepId="guarantor" subtitle="Someone who can vouch for you.">
      {(errors) => <GuarantorForm errors={errors} />}
    </StepScreen>
  );
}
