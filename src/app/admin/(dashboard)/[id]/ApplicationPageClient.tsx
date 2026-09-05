"use client";

import Link from "next/link";
import { ApplicationDetail } from "@/admin/components/review/ApplicationDetail";
import { useApplication } from "@/admin/hooks";

/**
 * Client half of the review page.
 *
 * The application record still lives in the browser (see the note in
 * `applicationsStore`), so the lookup has to happen here — but `reviewerName`
 * is handed down from the server, because who is reviewing is not something
 * client code gets to decide.
 */
export function ApplicationPageClient({
  id,
  reviewerName,
}: {
  id: string;
  reviewerName: string;
}) {
  const app = useApplication(id);

  if (app === null) {
    return (
      <div className="py-24 text-center text-sm text-text-subtle" role="status">
        Loading application…
      </div>
    );
  }

  if (app === undefined) {
    return (
      <div className="py-24 text-center">
        <p className="text-[15px] font-semibold text-text">Application not found</p>
        <p className="mt-1 text-sm text-text-muted">
          It may have been removed, or the link is wrong.
        </p>
        <Link
          href="/admin"
          className="mt-4 inline-block rounded-pill text-sm font-semibold text-text underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Back to applications
        </Link>
      </div>
    );
  }

  return <ApplicationDetail application={app} reviewerName={reviewerName} />;
}
