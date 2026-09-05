import type { ReactNode } from "react";
import { AdminHeader } from "./AdminHeader";
import { getCurrentReviewer } from "../auth";

/**
 * Header + page frame for the admin dashboard.
 *
 * The reviewer is resolved here, on the server, and handed down as a prop.
 * The header used to call `getCurrentReviewer()` itself from client code,
 * which is how it ended up displaying a hardcoded identity — a client
 * component cannot read a session, so it had nothing else to show.
 */
export async function AdminShell({ children }: { children: ReactNode }) {
  const reviewer = await getCurrentReviewer();

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-text">
      <AdminHeader reviewerName={reviewer?.name ?? ""} />
      <main className="mx-auto w-full max-w-320 flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
