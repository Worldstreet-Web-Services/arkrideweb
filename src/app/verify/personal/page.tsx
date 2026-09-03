"use client";

import { StepScreen } from "@/verification/components/StepScreen";
import { PersonalInfoForm } from "@/verification/components/forms/PersonalInfoForm";

export default function PersonalPage() {
  return (
    <StepScreen stepId="personal" subtitle="Tell us a bit about yourself.">
      {(errors) => <PersonalInfoForm errors={errors} />}
    </StepScreen>
  );
}
