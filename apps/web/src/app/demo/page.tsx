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
        demoNotice="This hosted demo uses the AcmeFlow fixture. Run the CLI locally to scan real sites."
        eyebrow="Hosted demo fixture"
        report={demoReport}
        title="AcmeFlow hosted demo report"
      />
    </>
  );
}
