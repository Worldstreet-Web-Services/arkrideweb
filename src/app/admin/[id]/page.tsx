"use client";

import Link from "next/link";
import { use } from "react";
import { ApplicationDetail } from "@/admin/components/review/ApplicationDetail";
import { useApplication } from "@/admin/hooks";

export default function AdminApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const app = useApplication(id);

  if (app === null) {
    return <div className="py-24 text-center text-sm text-neutral-400">Loading application…</div>;
  }

  if (app === undefined) {
    return (
      <div className="py-24 text-center">
        <p className="text-[15px] font-semibold text-neutral-900">Application not found</p>
        <p className="mt-1 text-sm text-neutral-500">It may have been removed or the link is wrong.</p>
        <Link
          href="/admin"
          className="mt-4 inline-block text-sm font-semibold text-neutral-900 underline underline-offset-4"
        >
          Back to applications
        </Link>
      </div>
    );
  }

  return <ApplicationDetail application={app} />;
}
