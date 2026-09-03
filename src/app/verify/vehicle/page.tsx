"use client";

import { StepScreen } from "@/verification/components/StepScreen";
import { VehicleForm } from "@/verification/components/forms/VehicleForm";

export default function VehiclePage() {
  return (
    <StepScreen stepId="vehicle" subtitle="Details of the vehicle you'll drive.">
      {(errors) => <VehicleForm errors={errors} />}
    </StepScreen>
  );
}
