import { NextResponse } from "next/server";
import { buildAgentLayerReport, generateArtifacts } from "@agentlayer/core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (process.env.ENABLE_REMOTE_SCAN !== "true") {
      return NextResponse.json(
        {
          error:
            "Remote scanning is disabled on this hosted demo. Run the CLI locally, or set ENABLE_REMOTE_SCAN=true for a deployment you control."
        },
        { status: 403 }
      );
    }

    const body = (await request.json()) as { url?: string; maxPages?: number };
    const rootUrl = normalizeUrl(body.url);
    const maxPages = clampMaxPages(body.maxPages);
    const report = await buildAgentLayerReport({
      rootUrl,
      maxPages,
      timeoutMs: 10000,
      respectRobotsTxt: true,
      allowLocal: false,
      crawler: "local",
      userAgent: "AgentLayerBot/0.1 (+https://github.com/Qqqq5910/agentlayer)"
    });
    const artifacts = generateArtifacts(report);

    return NextResponse.json({ report, artifacts });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "AgentLayer scan failed."
      },
      { status: 400 }
    );
  }
}

function normalizeUrl(input: string | undefined) {
  if (!input) {
    throw new Error("A website URL is required.");
  }

  const withProtocol = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  const url = new URL(withProtocol);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https URLs can be scanned.");
  }

  return url.toString();
}

function clampMaxPages(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return 20;
  }

  return Math.max(1, Math.min(100, Math.round(value ?? 20)));
}
