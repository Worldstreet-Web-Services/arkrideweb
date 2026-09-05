import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPrincipal } from "@/lib/api/session";
import { LoginForm } from "./LoginForm";
import { safeInternalPath } from "@/lib/safe-path";

export const metadata: Metadata = {
  title: "Sign in | Arkride",
  description: "Sign in to book a ride with Arkride.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ next }, principal] = await Promise.all([searchParams, getPrincipal()]);

  // Already signed in — sending them to a sign-in form is just a dead end.
  if (principal) redirect(principal.role === "driver" ? "/driver" : "/app");

  return <LoginForm audience="rider" next={safeInternalPath(next, "/app")} />;
}
