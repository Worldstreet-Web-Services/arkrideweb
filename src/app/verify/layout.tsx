import type { Metadata, Viewport } from "next";
import { VerificationLayout } from "@/verification/components/VerificationLayout";
import { VerifyProvider } from "./VerifyProvider";

export const metadata: Metadata = {
  title: "Driver Verification | Arkride",
  description: "Complete your driver verification to start accepting rides.",
};

// Lock the viewport so mobile browsers don't zoom in when a form field is
// focused (default behavior when an input's font-size is < 16px).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

/**
 * Portal shell — mounts the verification store (mock localStorage config by
 * default) and wraps every step in the responsive frame. `verify-portal` +
 * light color-scheme keep native controls (date/select) rendering correctly.
 */
export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="verify-portal scheme-light">
      <VerifyProvider>
        <VerificationLayout>{children}</VerificationLayout>
      </VerifyProvider>
    </div>
  );
}
