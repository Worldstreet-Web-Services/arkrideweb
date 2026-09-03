"use client";

import { StepScreen } from "@/verification/components/StepScreen";
import { LicenseForm } from "@/verification/components/forms/LicenseForm";

export default function LicensePage() {
  return (
    <StepScreen stepId="license" subtitle="Your valid driver's license details.">
      {(errors) => <LicenseForm errors={errors} />}
    </StepScreen>
  );
}
