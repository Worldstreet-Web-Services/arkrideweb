"use client";

import { StepScreen } from "@/verification/components/StepScreen";
import { IdentityForm } from "@/verification/components/forms/IdentityForm";

export default function IdentityPage() {
  return (
    <StepScreen stepId="identity" subtitle="Choose an ID and upload the document.">
      {(errors) => <IdentityForm errors={errors} />}
    </StepScreen>
  );
}
