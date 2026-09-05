import { DriverQueue } from "@/admin/components/DriverQueue";
import { requireAdmin, partitionByStatus } from "@/lib/api/admin";

/**
 * The driver verification queue — the real one.
 *
 * This page used to render `useApplications()`, a browser-local store seeded
 * with six fictional applicants. So an admin could pass a genuine
 * server-enforced gate and then review people who do not exist, while the
 * actual drivers waiting on approval — the ones the API knows about and who
 * cannot work until someone clicks approve — were nowhere on the screen.
 *
 * `requireAdmin()` already fetches the driver list to prove the caller is an
 * admin, so rendering it here costs nothing extra.
 *
 * The document-review portal still lives at /admin/applications. It has to
 * stay browser-local for now: the API has no file upload and no place to store
 * a KYC submission, so the scans exist only on the device that produced them.
 */
export default async function AdminDriverQueuePage() {
  const { drivers } = await requireAdmin();
  const groups = partitionByStatus(drivers);

  return <DriverQueue drivers={drivers} groups={groups} />;
}
