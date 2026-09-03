"use client";

import { StepScreen } from "@/verification/components/StepScreen";
import { VehicleDocumentsForm } from "@/verification/components/forms/VehicleDocumentsForm";

export default function DocumentsPage() {
  return (
    <StepScreen stepId="documents" subtitle="Upload the vehicle papers and required photos.">
      {(errors) => <VehicleDocumentsForm errors={errors} />}
    </StepScreen>
  );
}
