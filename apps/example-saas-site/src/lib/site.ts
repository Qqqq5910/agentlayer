export const navItems = [
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/integrations", label: "Integrations" },
  { href: "/security", label: "Security" },
  { href: "/customers", label: "Customers" },
  { href: "/support", label: "Support" }
];

export const plans = [
  {
    name: "Starter",
    price: "$49",
    cadence: "per month",
    description: "For small revenue teams organizing repeatable onboarding work.",
    features: ["5 workspaces", "CRM sync", "Shared playbooks", "Email support"]
  },
  {
    name: "Growth",
    price: "$149",
    cadence: "per month",
    description: "For growing SaaS teams that need handoff automation and reporting.",
    features: ["25 workspaces", "Slack alerts", "Workflow approvals", "Priority support"]
  },
  {
    name: "Enterprise",
    price: "Contact sales",
    cadence: "annual contracts",
    description: "For larger organizations with governance and security review needs.",
    features: ["Unlimited workspaces", "SSO/SAML", "Audit exports", "Security review packet"]
  }
];

export const integrations = [
  "Salesforce",
  "HubSpot",
  "Slack",
  "Google Workspace",
  "Microsoft Teams",
  "Zapier",
  "Segment",
  "Snowflake"
];

export const apiExamples = [
  "GET /v1/accounts",
  "POST /v1/workflows",
  "GET /v1/events",
  "POST /v1/webhooks/test"
];
