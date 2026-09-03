import type { ReactNode } from "react";
import { AdminHeader } from "./AdminHeader";

/** Header + page frame for the admin dashboard. */
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-neutral-50 text-neutral-900">
      <AdminHeader />
      <main className="mx-auto w-full max-w-320 flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
