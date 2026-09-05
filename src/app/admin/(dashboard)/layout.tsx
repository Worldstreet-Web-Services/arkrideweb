import { AdminShell } from "@/admin/components/AdminShell";
import { requireAdmin } from "@/lib/api/admin";

/**
 * Admin dashboard shell.
 *
 * SECURITY: `requireAdmin()` is the authorisation boundary for everything
 * under `/admin`. It runs on the server before any child renders, and it does
 * not decide anything itself — it asks the API, which enforces the role
 * against the signed token. A forged cookie fails here.
 *
 * `src/proxy.ts` also redirects visitors with no session at all, but that is
 * only a convenience so anonymous visitors land on the sign-in page. This is
 * the check that matters, and it would still hold if the proxy were removed.
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="verify-portal scheme-light">
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
