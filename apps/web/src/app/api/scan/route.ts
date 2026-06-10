import { NextResponse } from "next/server";
import {
  assertPublicHttpUrlResolved,
  buildAgentLayerReport,
  generateArtifacts
} from "@agentlayer/core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REMOTE_SCAN_DISABLED_MESSAGE =
  "Remote scanning is disabled in the hosted demo. Run the CLI locally to scan real sites.";

type ScanRequestBody = {
  url?: unknown;
  maxPages?: unknown;
};

export async function POST(request: Request) {
  try {
    if (process.env.ENABLE_REMOTE_SCAN !== "true") {
      return NextResponse.json(
        {
          error: REMOTE_SCAN_DISABLED_MESSAGE
        },
        { status: 403 }
      );
    }

    const body = (await request.json()) as ScanRequestBody;
    const rootUrl = normalizeScanUrl(body.url);
    const maxPages = clampMaxPages(body.maxPages);
    await assertPublicHttpUrlResolved(rootUrl, { allowLocal: false });

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

function normalizeScanUrl(input: unknown) {
  if (typeof input !== "string" || input.trim().length === 0) {
    throw new Error("A website URL is required.");
  }

  const trimmed = input.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withProtocol);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https URLs can be scanned.");
  }

  return url.toString();
}

function clampMaxPages(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 20;
  }

  return Math.max(1, Math.min(100, Math.round(value)));
}
