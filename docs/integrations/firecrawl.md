# Firecrawl Integration Notes

AgentLayer and Firecrawl solve adjacent problems.

Firecrawl is useful for turning web pages into clean LLM-ready content and crawling sites at scale. AgentLayer focuses on agent operability: whether a site exposes enough sourced facts, policy clarity, action boundaries, and task paths for agents to read, trust, and operate it.

## When To Use Firecrawl

Use Firecrawl when you need:

- Hosted crawling infrastructure.
- Markdown extraction for many pages.
- Search or crawl APIs for ingestion pipelines.
- Content retrieval as part of an LLM application.

## When To Use AgentLayer

Use AgentLayer when you need:

- `llms.txt` and related agent-facing artifacts.
- `.well-known` discovery drafts.
- Sourced facts and action manifests.
- Deterministic task checks for pricing, docs, policies, support, integrations, and demo/contact flows.
- A local report that explains what to fix before publishing agent-facing files.

## Combined Workflow

1. Use Firecrawl or your existing crawler to collect source content when you need hosted crawling.
2. Run AgentLayer against the public site or representative local fixture.
3. Review generated facts, actions, and standards drafts.
4. Publish only the artifacts you have validated.

AgentLayer does not currently require Firecrawl. A future adapter could let teams bring Firecrawl crawl results into AgentLayer's extraction and evaluation pipeline.
