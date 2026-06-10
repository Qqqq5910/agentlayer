"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Radar, ShieldCheck } from "lucide-react";
import type { StoredReportPayload } from "@/lib/report-types";
import { reportStorageKey } from "@/lib/report-utils";

type ScanState = "idle" | "scanning" | "saving" | "error";

type ScannerFormProps = {
  remoteScanEnabled: boolean;
};

export function ScannerForm({ remoteScanEnabled }: ScannerFormProps) {
  const router = useRouter();
  const [url, setUrl] = useState("https://example.com");
  const [maxPages, setMaxPages] = useState(12);
  const [state, setState] = useState<ScanState>("idle");
  const [message, setMessage] = useState("");

  const progress = useMemo(() => {
    if (state === "scanning") {
      return 58;
    }

    if (state === "saving") {
      return 92;
    }

    return 8;
  }, [state]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!remoteScanEnabled) {
      setState("error");
      setMessage(
        "This hosted demo uses the AcmeFlow fixture. Run the CLI locally to scan real sites, or set ENABLE_REMOTE_SCAN=true for a deployment you control."
      );
      return;
    }

    setState("scanning");
    setMessage("Scanning site structure and generating agent artifacts...");

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, maxPages })
      });

      const payload = (await response.json()) as
        | { report: StoredReportPayload["report"]; artifacts: StoredReportPayload["artifacts"] }
        | { error: string };

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "Scan failed.");
      }

      setState("saving");
      setMessage("Report generated. Opening the local report view...");
      const reportId = crypto.randomUUID();
      const stored: StoredReportPayload = {
        report: payload.report,
        artifacts: payload.artifacts,
        savedAt: new Date().toISOString(),
        sourceUrl: url
      };

      localStorage.setItem(reportStorageKey(reportId), JSON.stringify(stored));
      router.push(`/reports/${reportId}`);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "The scan could not be completed.");
    }
  }

  return (
    <form className="panel p-5" onSubmit={onSubmit}>
      <div className="flex items-start gap-3">
        <div className="grid size-10 place-items-center rounded-md bg-slate-950 text-white">
          <Radar size={19} aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Scan a site</h1>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {remoteScanEnabled
              ? "No auth required. AgentLayer calls the core package and stores the report in this browser."
              : "This hosted demo uses the AcmeFlow fixture. Run the CLI locally to scan real sites."}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_160px]">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Website URL</span>
          <input
            className="focus-ring h-11 rounded-md border border-slate-300 bg-white px-3 text-slate-950"
            inputMode="url"
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com"
            required
            type="url"
            value={url}
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Max pages</span>
          <input
            className="focus-ring h-11 rounded-md border border-slate-300 bg-white px-3 text-slate-950"
            max={100}
            min={1}
            onChange={(event) => setMaxPages(Number(event.target.value))}
            type="number"
            value={maxPages}
          />
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!remoteScanEnabled || state === "scanning" || state === "saving"}
          type="submit"
        >
          {state === "scanning" || state === "saving" ? (
            <Loader2 className="animate-spin" size={17} aria-hidden="true" />
          ) : (
            <ShieldCheck size={17} aria-hidden="true" />
          )}
          Run scan
          <ArrowRight size={16} aria-hidden="true" />
        </button>
        <span className="text-sm text-slate-500">
          {remoteScanEnabled
            ? "Remote crawling can fail if a site blocks automated fetches."
            : "Run locally with pnpm agentlayer generate https://example.com --out ./agentlayer-output"}
        </span>
      </div>

      <div className="mt-6">
        <div className="h-2 rounded-full bg-slate-200">
          <div
            className="h-2 rounded-full bg-cyan-700 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        {message ? (
          <p className={`mt-3 text-sm ${state === "error" ? "text-rose-700" : "text-slate-600"}`}>
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
