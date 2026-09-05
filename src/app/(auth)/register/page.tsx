import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPrincipal } from "@/lib/api/session";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Create an account | Arkride",
  description: "Create an Arkride account and book your first ride.",
};

export default async function RegisterPage() {
  const principal = await getPrincipal();
  if (principal) redirect(principal.role === "driver" ? "/driver" : "/app");

  return <RegisterForm />;
}
