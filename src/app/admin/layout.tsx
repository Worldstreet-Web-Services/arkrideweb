import type { Metadata } from "next";
import { AdminShell } from "@/admin/components/AdminShell";

export const metadata: Metadata = {
  title: "Verification Review | Arkride",
  description: "Review and decide on driver verification applications.",
  robots: { index: false, follow: false },
};

/**
 * Admin dashboard shell.
 *
 * ⚠️ SECURITY: this route is NOT protected yet (auth seam only — see
 * `src/admin/auth.ts`). Before exposing real data, add a real session check in
 * `middleware.ts` for `/admin/*` and enforce authorization server-side.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="verify-portal scheme-light">
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
