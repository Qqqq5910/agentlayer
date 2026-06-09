import { Navigation } from "@/components/navigation";
import { ReportView } from "@/components/report-view";
import { demoArtifacts, demoReport } from "@/lib/demo-report";

export const metadata = {
  title: "Demo Report"
};

export default function DemoReportPage() {
  return (
    <>
      <Navigation />
      <ReportView
        artifacts={demoArtifacts}
        eyebrow="Local fixture report"
        report={demoReport}
        title="NimbusCRM agent operability report"
      />
    </>
  );
}
