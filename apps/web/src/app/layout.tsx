import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AgentLayer",
    template: "%s | AgentLayer"
  },
  description:
    "AgentLayer scans websites, generates agent-readable files, and tests whether AI agents can complete real user journeys.",
  metadataBase: new URL("https://agentlayer.dev")
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
