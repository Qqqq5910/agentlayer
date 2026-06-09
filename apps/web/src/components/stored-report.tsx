"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ReportView } from "@/components/report-view";
import type { StoredReportPayload } from "@/lib/report-types";
import { reportStorageKey } from "@/lib/report-utils";

export function StoredReport({ reportId }: { reportId: string }) {
  const [payload, setPayload] = useState<StoredReportPayload | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(reportStorageKey(reportId));
    if (raw) {
      setPayload(JSON.parse(raw) as StoredReportPayload);
    }
    setLoaded(true);
  }, [reportId]);

  if (!loaded) {
    return (
      <main className="container-shell py-16">
        <div className="panel p-8 text-slate-600">Loading report...</div>
      </main>
    );
  }

  if (!payload) {
    return (
      <main className="container-shell py-16">
        <div className="panel max-w-xl p-8">
          <h1 className="text-2xl font-semibold text-slate-950">Report not found</h1>
          <p className="mt-3 text-slate-600">
            Scanned reports are stored locally in this browser. Open the demo report or run a new scan.
          </p>
          <div className="mt-6 flex gap-3">
            <Link className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white" href="/scan">
              Scan a site
            </Link>
            <Link className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium" href="/demo">
              View demo
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <ReportView artifacts={payload.artifacts} report={payload.report} title={payload.report.site.name} />;
}
