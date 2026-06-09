import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CoreModule = {
  buildAgentLayerReport?: (options: { rootUrl: string; maxPages: number }) => Promise<unknown> | unknown;
  generateArtifacts?: (report: unknown) => Promise<unknown> | unknown;
};

const importModule = new Function("specifier", "return import(specifier)") as (
  specifier: string
) => Promise<CoreModule>;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: string; maxPages?: number };
    const rootUrl = normalizeUrl(body.url);
    const maxPages = clampMaxPages(body.maxPages);
    const core = await importModule("@agentlayer/core");

    if (typeof core.buildAgentLayerReport !== "function" || typeof core.generateArtifacts !== "function") {
      return NextResponse.json(
        {
          error:
            "@agentlayer/core does not export buildAgentLayerReport/generateArtifacts yet. Use the demo report while the core scanner package is being completed."
        },
        { status: 503 }
      );
    }

    const report = await core.buildAgentLayerReport({ rootUrl, maxPages });
    const artifacts = await core.generateArtifacts(report);

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
