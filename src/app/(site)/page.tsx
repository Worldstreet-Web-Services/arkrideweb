import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Features } from "@/components/sections/Features";
import { DriverSignup } from "@/components/sections/DriverSignup";
import { GetTheApp } from "@/components/sections/GetTheApp";

export const metadata: Metadata = {
  // The root layout sets a `%s · ArkRide` template; the landing page wants the
  // full brand line instead, so it overrides with an absolute title.
  title: {
    absolute: "ArkRide — Move at the speed of now",
  },
};

/**
 * The landing page.
 *
 * Order is deliberate: the promise, then how it works, then what it does, then
 * the driver ask, then the app. A visitor who bounces after two screens should
 * still have understood what ArkRide is and why it is different.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Features />
      <DriverSignup />
      <GetTheApp />
    </>
  );
}
