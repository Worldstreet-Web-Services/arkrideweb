import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Features } from "@/components/sections/Features";
import { DriverSignup } from "@/components/sections/DriverSignup";

/**
 * Landing page — sections implemented pixel-perfect from Figma.
 * Add/remove/reorder sections here as designs come in.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Features />
      <DriverSignup />
    </>
  );
}
