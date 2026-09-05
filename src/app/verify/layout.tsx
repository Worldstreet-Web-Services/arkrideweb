import type { Metadata, Viewport } from "next";
import { VerificationLayout } from "@/verification/components/VerificationLayout";
import { VerifyProvider } from "./VerifyProvider";

export const metadata: Metadata = {
  title: "Driver Verification | Arkride",
  description: "Complete your driver verification to start accepting rides.",
};

/**
 * Pinch-zoom stays enabled.
 *
 * This used to set `maximumScale: 1, userScalable: false` to stop iOS zooming
 * when a field is focused. That side effect only happens when an input's
 * font-size is under 16px, so the fix is to size the inputs correctly — not to
 * take zoom away from everyone.
 *
 * Disabling zoom is a WCAG 1.4.4 failure, and this is the flow where someone
 * photographs a document and needs to check the result is legible. Removing
 * their ability to magnify it is precisely backwards.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
