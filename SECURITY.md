# Security Policy

AgentLayer is a scanner and generator for public sites that users are authorized to inspect.

## Safety Boundaries

- AgentLayer does not submit forms.
- AgentLayer does not send POST requests during crawling.
- AgentLayer does not bypass authentication.
- AgentLayer does not crawl private or paywalled areas.
- AgentLayer stays within the same hostname by default.
- AgentLayer respects max page limits and request timeouts.
- AgentLayer does not perform destructive actions.
- AgentLayer does not require secrets for default deterministic operation.

## Generated Manifests

Generated MCP, WebMCP, Agent Skills, and action manifest files are suggestions. Site owners must review them before production use, especially for sensitive actions such as payment, cancellation, refund, deletion, account changes, or lead submission.

Sensitive action manifests should require human confirmation.

## Reporting Issues

Please open a GitHub issue for suspected security problems in this MVP. Do not include secrets, private customer data, or credentials in public issues.

