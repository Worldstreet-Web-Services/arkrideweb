import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPrincipal } from "@/lib/api/session";
import { LoginForm } from "../login/LoginForm";
import { safeInternalPath } from "@/lib/safe-path";

export const metadata: Metadata = {
  title: "Driver sign in | Arkride",
  description: "Sign in to your Arkride driver account.",
};

export default async function DriverLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ next }, principal] = await Promise.all([searchParams, getPrincipal()]);
  if (principal) redirect(principal.role === "driver" ? "/driver" : "/app");

  return <LoginForm audience="driver" next={safeInternalPath(next, "/driver")} />;
}
