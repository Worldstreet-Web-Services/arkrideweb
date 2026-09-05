import { requireAdmin } from "@/lib/api/admin";
import { ApplicationPageClient } from "./ApplicationPageClient";

/**
 * `params` is a Promise in Next 16 and has to be awaited.
 *
 * This is a Server Component so that `requireAdmin()` runs before anything
 * renders — the layout already checks, but a page that can be rendered without
 * the layout's check having passed is a page that will eventually be.
 */
export default async function AdminApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, { admin }] = await Promise.all([params, requireAdmin()]);

  return (
    <ApplicationPageClient
      id={id}
      reviewerName={admin.name || admin.email || admin.id}
    />
  );
}
