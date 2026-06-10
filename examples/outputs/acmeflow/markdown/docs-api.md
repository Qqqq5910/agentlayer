# API Docs | AcmeFlow

Source: http://localhost:3001/docs/api

API docs

# REST API and webhooks for AcmeFlow workflows.

Developers can read account, workflow, event, and webhook resources. Production API credentials are
managed by admins.

## Authentication

API requests use bearer tokens created by an account admin. Tokens can be scoped to read-only or
workflow write access.

## Example endpoints

GET /v1/accounts POST /v1/workflows GET /v1/events POST /v1/webhooks/test
