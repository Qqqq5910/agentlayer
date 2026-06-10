import type { ReactNode } from "react";
import Link from "next/link";
import { FileText, Route, ShieldCheck } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { ScannerForm } from "@/components/scanner-form";

export const metadata = {
  title: "Scan"
};

export default function ScanPage() {
  const remoteScanEnabled = process.env.ENABLE_REMOTE_SCAN === "true";

  return (
    <>
      <Navigation />
      <main className="container-shell grid gap-6 py-8 lg:grid-cols-[1fr_360px]">
        <ScannerForm remoteScanEnabled={remoteScanEnabled} />
        <aside className="space-y-4">
          <div className="panel p-5">
            <h2 className="font-semibold text-slate-950">What the scan returns</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <Row
                icon={<FileText size={16} />}
                text="Generated llms.txt, facts, actions, and task report files."
              />
              <Row
                icon={<ShieldCheck size={16} />}
                text="Evidence-backed facts with confidence scores."
              />
              <Row
                icon={<Route size={16} />}
                text="Detected actions and user journey success checks."
              />
            </div>
          </div>
          <div className="panel p-5">
            <h2 className="font-semibold text-slate-950">Need a guaranteed report?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This hosted demo uses the AcmeFlow fixture. Run the CLI locally to scan real sites.
              Hosted deployments should only enable arbitrary remote scans after reviewing SSRF
              protections.
            </p>
            <Link
              className="mt-4 inline-flex rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white"
              href="/demo"
            >
              Open demo report
            </Link>
          </div>
        </aside>
      </main>
    </>
  );
}

function Row({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-cyan-700">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
