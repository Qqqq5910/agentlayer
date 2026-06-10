# Security Notes

AgentLayer is designed for bounded, public-site analysis. It should help teams publish clearer agent-facing artifacts without probing private systems or executing sensitive actions.

## Scanner Boundaries

- Scans public pages only.
- Stays within same-host crawling bounds.
- Honors configured page limits and request timeouts.
- Does not submit forms.
- Does not authenticate, bypass access controls, or crawl private areas.
- Does not perform destructive actions.

## Generated Artifacts

Generated files can contain public facts, links, form descriptions, policy summaries, and action paths. Review them before publishing so you do not expose stale, internal, or misleading information.

Pay special attention to:

- Contact forms and support flows.
- Security, compliance, and privacy claims.
- Pricing, plan limits, and refund terms.
- API endpoints, keys, tokens, or internal hostnames accidentally present on public pages.

## Safe Publishing Checklist

1. Review `facts.json` for unsupported claims.
2. Review `actions.json` and skill files for sensitive actions.
3. Keep `requiresHumanConfirmation` on any action that submits data, changes state, or starts a commercial process.
4. Publish draft disclaimers for MCP, WebMCP, API Catalog, and Agent Skills artifacts.
5. Add these files to normal documentation and release review when product, pricing, policy, or security pages change.

## Reporting Security Issues

Please do not open public issues for vulnerabilities. Use the process in the repository `SECURITY.md` file.
