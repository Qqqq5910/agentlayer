# Agent Operability Standards

AgentLayer treats standards as reviewable publishing targets, not as
box-checking claims. Generated files are deterministic drafts that should be
read, edited, and validated before they are served from production.

## llms.txt

`llms.txt` is a plain-text entry point for AI systems. AgentLayer generates a
concise site summary, important URLs, extracted facts, action paths, and policy
links. `llms-full.txt` adds fuller page context and is useful when agents need
more source material.

Publish these at the site root:

- `/llms.txt`
- `/llms-full.txt`

Use them to point agents toward authoritative public information. Do not use
them to hide missing product, pricing, security, or policy pages.

## MCP Server Card Draft

AgentLayer generates draft MCP discovery metadata at:

- `/.well-known/mcp/server-card.json`
- `/.well-known/mcp.json` as a legacy/draft alias

These files describe the site, related resources, and suggested tool-like
actions. They are not an MCP server implementation and do not imply compliance
with the latest MCP Server Card draft. Treat them as a starting point for a real
server card, then validate against the current MCP documentation before
publishing.

## API Catalog

AgentLayer generates:

- `/.well-known/api-catalog`

The catalog is inferred from public API documentation pages and related actions.
It is intentionally conservative. If your product has OpenAPI, AsyncAPI, GraphQL
SDL, Postman collections, or SDK docs, link those canonical files from the
catalog before publishing.

## Agent Skills

AgentLayer generates:

- `/.well-known/agent-skills/index.json`

The skills index maps discovered actions into reviewable agent skills. It
includes source URLs, human confirmation requirements, and sensitivity labels
where available. Review every skill before exposing it to an agent runtime,
especially anything involving forms, purchases, account changes, support
requests, or personal data.

## WebMCP

AgentLayer generates suggestions under:

- `/webmcp/suggested-webmcp-tools.json`
- `/webmcp/suggested-form-annotations.md`

These are implementation notes for teams exploring WebMCP-like affordances. They
are not active browser automation code and should not be treated as a production
WebMCP integration.

## Markdown Alternatives

AgentLayer creates Markdown snapshots for crawled pages under `/markdown/`.
Markdown alternatives make documentation, policies, pricing, support, and
integration pages easier for agents to quote and compare.

Keep Markdown snapshots synchronized with canonical pages. If your site already
has high-quality Markdown documentation, prefer linking to the canonical source
instead of publishing stale generated copies.

## Publishing Rule

Before publishing any generated artifact:

1. Confirm the source page still says what the artifact says.
2. Remove unsupported claims.
3. Mark drafts clearly when a standard is still evolving.
4. Add human confirmation for sensitive actions.
5. Re-run AgentLayer after major navigation, pricing, policy, or docs changes.
