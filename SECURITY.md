# Security Policy

AgentLayer is a deterministic public-site scanner and artifact generator. It is not intended to
probe private networks, authenticate into protected systems, submit forms, or execute state-changing
actions.

## Supported Versions

AgentLayer is pre-1.0. Security fixes are published on the `main` branch until versioned releases
are available.

## Reporting a Vulnerability

Please do not open public GitHub issues for vulnerabilities.

Email the maintainer or use a private GitHub security advisory if available. Include:

- A short description of the issue.
- Steps to reproduce.
- The affected command, API route, or generated artifact.
- Any relevant logs or URLs, with secrets removed.

## Scanner Boundary

By default, AgentLayer rejects localhost, loopback, private, link-local, unique-local IPv6, and
cloud metadata addresses. Local fixture scans must opt in with `--allow-local`.

Generated standards artifacts are drafts for human review. Do not publish them as compliance claims
without validating them against the current specification and your site's current content.
