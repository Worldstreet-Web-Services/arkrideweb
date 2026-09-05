import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPrincipal } from "@/lib/api/session";
import { DriverRegisterForm } from "./DriverRegisterForm";

export const metadata: Metadata = {
  title: "Apply to drive | Arkride",
  description: "Create an Arkride driver account and start earning.",
};

export default async function DriverRegisterPage() {
  const principal = await getPrincipal();
  if (principal) redirect(principal.role === "driver" ? "/driver" : "/app");

  return <DriverRegisterForm />;
}
