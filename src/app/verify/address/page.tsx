"use client";

import { StepScreen } from "@/verification/components/StepScreen";
import { AddressForm } from "@/verification/components/forms/AddressForm";

export default function AddressPage() {
  return (
    <StepScreen stepId="address" subtitle="Where do you live? Add a proof of address.">
      {(errors) => <AddressForm errors={errors} />}
    </StepScreen>
  );
}
