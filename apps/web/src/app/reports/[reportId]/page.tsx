import { Navigation } from "@/components/navigation";
import { StoredReport } from "@/components/stored-report";

export const metadata = {
  title: "Report"
};

export default async function ReportPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;

  return (
    <>
      <Navigation />
      <StoredReport reportId={reportId} />
    </>
  );
}
