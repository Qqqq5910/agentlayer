import type {
  AgentAction,
  AgentOperabilityReport,
  AgentTaskResult,
  ExtractedFact,
  GeneratedArtifact,
  PageSnapshot,
  Recommendation
} from "@/lib/report-types";

const scannedAt = "2026-06-10T09:20:00.000Z";
const rootUrl = "https://nimbuscrm.example";

function page(path: string, pageType: string, title: string, h1: string): PageSnapshot {
  const url = `${rootUrl}${path}`;

  return {
    url,
    finalUrl: url,
    title,
    description: `${title} on the NimbusCRM demo website.`,
    canonicalUrl: url,
    status: 200,
    pageType,
    headings: {
      h1: [h1],
      h2: ["Agent-readable overview", "Customer evidence", "Next actions"],
      h3: []
    },
    links: [
      { href: `${rootUrl}/pricing`, text: "Pricing", isExternal: false },
      { href: `${rootUrl}/docs`, text: "Docs", isExternal: false },
      { href: `${rootUrl}/security`, text: "Security", isExternal: false },
      { href: `${rootUrl}/contact`, text: "Contact sales", isExternal: false }
    ],
    forms:
      path === "/contact"
        ? [
            {
              id: "contact-sales",
              action: "/contact",
              method: "POST",
              purpose: "contact_sales",
              fields: [
                { name: "email", type: "email", label: "Work email", required: true },
                { name: "company", type: "text", label: "Company", required: true },
                { name: "team_size", type: "select", label: "Team size", required: false }
              ],
              submitText: "Request demo",
              sourceUrl: url
            }
          ]
        : [],
    jsonLd: [],
    openGraph: {
      "og:site_name": "NimbusCRM",
      "og:title": title
    },
    visibleText: `${h1}. NimbusCRM helps revenue teams qualify accounts, explain pricing, read docs, and contact support.`,
    markdown: `# ${h1}\n\nNimbusCRM helps revenue teams qualify accounts and operate customer journeys.`,
    emails: path === "/support" ? ["support@nimbuscrm.example"] : [],
    socialLinks: ["https://www.linkedin.com/company/nimbuscrm"],
    fetchedAt: scannedAt
  };
}

const facts: ExtractedFact[] = [
  {
    id: "fact-company-name",
    type: "company",
    label: "Company name",
    value: "NimbusCRM",
    sourceUrl: rootUrl,
    sourceText: "NimbusCRM revenue workspace",
    confidence: 0.92,
    updatedAt: scannedAt
  },
  {
    id: "fact-product",
    type: "product",
    label: "Primary product",
    value: "Revenue operations workspace for B2B SaaS teams",
    sourceUrl: rootUrl,
    sourceText: "Qualify accounts, route leads, and sync customer data.",
    confidence: 0.82,
    updatedAt: scannedAt
  },
  {
    id: "fact-pricing-growth",
    type: "plan",
    label: "Growth plan",
    value: "$49 per seat per month",
    sourceUrl: `${rootUrl}/pricing`,
    sourceText: "Growth starts at $49 per seat per month.",
    confidence: 0.88,
    updatedAt: scannedAt
  },
  {
    id: "fact-pricing-enterprise",
    type: "pricing",
    label: "Enterprise pricing",
    value: "Custom pricing requires sales contact",
    sourceUrl: `${rootUrl}/pricing`,
    sourceText: "Enterprise customers can request a custom quote.",
    confidence: 0.76,
    updatedAt: scannedAt
  },
  {
    id: "fact-integration-salesforce",
    type: "integration",
    label: "Salesforce integration",
    value: "Salesforce",
    sourceUrl: `${rootUrl}/integrations`,
    sourceText: "Connect Salesforce, HubSpot, Slack, and Segment.",
    confidence: 0.84,
    updatedAt: scannedAt
  },
  {
    id: "fact-docs",
    type: "docs",
    label: "Developer docs",
    value: "REST API docs and webhook guide are linked from /docs",
    sourceUrl: `${rootUrl}/docs`,
    sourceText: "API reference, webhooks, and getting started.",
    confidence: 0.8,
    updatedAt: scannedAt
  },
  {
    id: "fact-security",
    type: "security",
    label: "Security page",
    value: "SOC 2 Type II and SSO are described on the security page",
    sourceUrl: `${rootUrl}/security`,
    sourceText: "SOC 2 Type II report available under NDA. SAML SSO supported.",
    confidence: 0.71,
    updatedAt: scannedAt
  },
  {
    id: "fact-contact",
    type: "contact",
    label: "Sales contact path",
    value: "Contact form requires email and company",
    sourceUrl: `${rootUrl}/contact`,
    sourceText: "Request demo form",
    confidence: 0.9,
    updatedAt: scannedAt
  },
  {
    id: "fact-privacy",
    type: "policy",
    label: "Privacy policy",
    value: "Privacy policy found",
    sourceUrl: `${rootUrl}/privacy`,
    sourceText: "Privacy Policy",
    confidence: 0.86,
    updatedAt: scannedAt
  },
  {
    id: "fact-support",
    type: "support",
    label: "Support channel",
    value: "support@nimbuscrm.example",
    sourceUrl: `${rootUrl}/support`,
    sourceText: "Email support@nimbuscrm.example for support.",
    confidence: 0.83,
    updatedAt: scannedAt
  }
];

const actions: AgentAction[] = [
  {
    id: "action-view-pricing",
    name: "view_pricing",
    description: "Open the public pricing page.",
    userIntent: "Compare plans and estimate cost.",
    actionType: "navigation",
    url: `${rootUrl}/pricing`,
    requiresHumanConfirmation: false,
    sensitivity: "low",
    sourceUrl: rootUrl,
    confidence: 0.92
  },
  {
    id: "action-contact-sales",
    name: "contact_sales",
    description: "Submit the contact sales form after user confirmation.",
    userIntent: "Ask sales for an enterprise demo or quote.",
    actionType: "form",
    url: `${rootUrl}/contact`,
    method: "POST",
    requiredFields: [
      { name: "email", type: "email", label: "Work email", required: true },
      { name: "company", type: "text", label: "Company", required: true }
    ],
    requiresHumanConfirmation: true,
    sensitivity: "medium",
    sourceUrl: `${rootUrl}/contact`,
    confidence: 0.86
  },
  {
    id: "action-book-demo",
    name: "book_demo",
    description: "Open the demo request flow.",
    userIntent: "Schedule time with a product specialist.",
    actionType: "form",
    url: `${rootUrl}/demo`,
    method: "POST",
    requiredFields: [
      { name: "email", type: "email", label: "Work email", required: true },
      { name: "date", type: "date", label: "Preferred date", required: false }
    ],
    requiresHumanConfirmation: true,
    sensitivity: "medium",
    sourceUrl: `${rootUrl}/demo`,
    confidence: 0.74
  },
  {
    id: "action-search-docs",
    name: "search_docs",
    description: "Navigate to docs search.",
    userIntent: "Find API or integration documentation.",
    actionType: "navigation",
    url: `${rootUrl}/docs`,
    requiresHumanConfirmation: false,
    sensitivity: "low",
    sourceUrl: `${rootUrl}/docs`,
    confidence: 0.78
  },
  {
    id: "action-open-security",
    name: "open_security_page",
    description: "Open security and trust materials.",
    userIntent: "Verify compliance and data protection claims.",
    actionType: "navigation",
    url: `${rootUrl}/security`,
    requiresHumanConfirmation: false,
    sensitivity: "low",
    sourceUrl: `${rootUrl}/security`,
    confidence: 0.81
  },
  {
    id: "action-read-terms",
    name: "read_terms",
    description: "Open the public terms of service.",
    userIntent: "Review legal terms before purchase.",
    actionType: "navigation",
    url: `${rootUrl}/terms`,
    requiresHumanConfirmation: false,
    sensitivity: "low",
    sourceUrl: `${rootUrl}/terms`,
    confidence: 0.79
  }
];

const tasks: AgentTaskResult[] = [
  {
    taskId: "find-pricing",
    title: "Can an agent find pricing?",
    status: "pass",
    score: 92,
    explanation: "Pricing is linked in the primary navigation and has clear plan names.",
    evidenceUrls: [`${rootUrl}/pricing`],
    evidenceSnippets: ["Growth starts at $49 per seat per month."],
    missingInformation: [],
    recommendations: ["Publish the same pricing facts in facts.json."]
  },
  {
    taskId: "understand-plan-differences",
    title: "Can an agent understand plan differences?",
    status: "partial",
    score: 68,
    explanation: "Plan names and starting prices are visible, but overage rules are not machine-readable.",
    evidenceUrls: [`${rootUrl}/pricing`],
    evidenceSnippets: ["Growth, Business, and Enterprise plan cards were found."],
    missingInformation: ["Usage limits", "Billing overage rules"],
    recommendations: ["Add structured plan comparison rows to site-profile.json."]
  },
  {
    taskId: "contact-sales",
    title: "Can an agent contact sales or book a demo?",
    status: "pass",
    score: 84,
    explanation: "Contact and demo forms are discoverable with required fields detected.",
    evidenceUrls: [`${rootUrl}/contact`, `${rootUrl}/demo`],
    evidenceSnippets: ["Request demo form includes email and company fields."],
    missingInformation: [],
    recommendations: ["Expose the form schema in .well-known/agents.json."]
  },
  {
    taskId: "find-docs",
    title: "Can an agent find docs or API docs?",
    status: "pass",
    score: 80,
    explanation: "Docs and API pages are discoverable from navigation.",
    evidenceUrls: [`${rootUrl}/docs`, `${rootUrl}/docs/api`],
    evidenceSnippets: ["API reference, webhooks, and getting started."],
    missingInformation: [],
    recommendations: ["Add markdown snapshots for high-value docs."]
  },
  {
    taskId: "verify-security",
    title: "Can an agent verify security information?",
    status: "partial",
    score: 63,
    explanation: "Security claims exist, but compliance evidence is gated behind an NDA.",
    evidenceUrls: [`${rootUrl}/security`],
    evidenceSnippets: ["SOC 2 Type II report available under NDA."],
    missingInformation: ["Public trust center metadata", "Evidence freshness date"],
    recommendations: ["Publish non-sensitive trust metadata with source timestamps."]
  },
  {
    taskId: "find-policies",
    title: "Can an agent find cancellation and legal policies?",
    status: "partial",
    score: 58,
    explanation: "Privacy and terms are linked, but cancellation policy is not explicit.",
    evidenceUrls: [`${rootUrl}/privacy`, `${rootUrl}/terms`],
    evidenceSnippets: ["Terms of Service", "Privacy Policy"],
    missingInformation: ["Cancellation policy", "Refund policy"],
    recommendations: ["Add cancellation and refund links to policy metadata."]
  },
  {
    taskId: "identify-integrations",
    title: "Can an agent identify integrations?",
    status: "pass",
    score: 78,
    explanation: "Common integrations are listed on a dedicated page.",
    evidenceUrls: [`${rootUrl}/integrations`],
    evidenceSnippets: ["Connect Salesforce, HubSpot, Slack, and Segment."],
    missingInformation: [],
    recommendations: ["Represent integration names as facts with source URLs."]
  },
  {
    taskId: "determine-audience",
    title: "Can an agent determine who the product is for?",
    status: "pass",
    score: 83,
    explanation: "Target users are named across the homepage and case studies.",
    evidenceUrls: [rootUrl, `${rootUrl}/customers`],
    evidenceSnippets: ["Built for B2B SaaS revenue teams."],
    missingInformation: [],
    recommendations: ["Add target_user facts to the profile."]
  },
  {
    taskId: "find-support",
    title: "Can an agent find support information?",
    status: "partial",
    score: 65,
    explanation: "Support email is present, but support hours and escalation path are absent.",
    evidenceUrls: [`${rootUrl}/support`],
    evidenceSnippets: ["Email support@nimbuscrm.example for support."],
    missingInformation: ["Support hours", "Escalation policy"],
    recommendations: ["Expose support expectations in facts.json."]
  }
];

const recommendations: Recommendation[] = [
  {
    title: "Publish /llms.txt and /llms-full.txt",
    severity: "high",
    whyItMatters: "Agents need concise and complete machine-readable context before operating on behalf of users.",
    howToFix: "Ship generated llms.txt files at the site root and link important pages with short descriptions.",
    affectedTasks: ["find-docs", "determine-audience"],
    suggestedArtifact: "llms.txt"
  },
  {
    title: "Add a machine-readable action manifest",
    severity: "high",
    whyItMatters: "Agents can identify the demo form, but they need field requirements and confirmation rules before acting.",
    howToFix: "Publish .well-known/agents.json with contact_sales and book_demo schemas.",
    affectedTasks: ["contact-sales"],
    suggestedArtifact: ".well-known/agents.json"
  },
  {
    title: "Clarify cancellation and refund policy",
    severity: "medium",
    whyItMatters: "A buyer agent cannot answer common procurement questions without explicit policy evidence.",
    howToFix: "Add policy links to the footer and include a cancellation fact with source text.",
    affectedTasks: ["find-policies"],
    suggestedArtifact: "facts.json"
  },
  {
    title: "Expose public trust metadata",
    severity: "medium",
    whyItMatters: "Security pages are useful to humans, but agents need evidence freshness and non-sensitive compliance metadata.",
    howToFix: "Add last-reviewed dates and public summaries for SOC 2, SSO, encryption, and data retention.",
    affectedTasks: ["verify-security"],
    suggestedArtifact: "site-profile.json"
  }
];

export const demoReport: AgentOperabilityReport = {
  site: {
    name: "NimbusCRM",
    summary:
      "NimbusCRM is a fictional B2B SaaS revenue workspace used to demonstrate AgentLayer scanning, fact extraction, actions, and task checks.",
    rootUrl,
    keyPages: {
      homepage: rootUrl,
      pricing: `${rootUrl}/pricing`,
      docs: `${rootUrl}/docs`,
      security: `${rootUrl}/security`,
      contact: `${rootUrl}/contact`,
      terms: `${rootUrl}/terms`,
      privacy: `${rootUrl}/privacy`
    },
    generatedAt: scannedAt
  },
  scan: {
    rootUrl,
    scannedAt,
    pages: [
      page("", "homepage", "NimbusCRM revenue workspace", "Revenue operations for B2B SaaS"),
      page("/pricing", "pricing", "NimbusCRM pricing", "Simple pricing for growing revenue teams"),
      page("/docs", "docs", "NimbusCRM docs", "Build with the NimbusCRM API"),
      page("/security", "security", "NimbusCRM security", "Security and compliance"),
      page("/integrations", "integrations", "NimbusCRM integrations", "Connect your revenue stack"),
      page("/contact", "contact", "Contact NimbusCRM sales", "Request a NimbusCRM demo"),
      page("/terms", "policy", "NimbusCRM terms", "Terms of service"),
      page("/privacy", "policy", "NimbusCRM privacy", "Privacy policy"),
      page("/support", "support", "NimbusCRM support", "Customer support")
    ],
    robotsTxt: {
      url: `${rootUrl}/robots.txt`,
      found: true,
      text: "User-agent: *\nAllow: /"
    },
    sitemap: {
      url: `${rootUrl}/sitemap.xml`,
      found: true,
      urls: [
        rootUrl,
        `${rootUrl}/pricing`,
        `${rootUrl}/docs`,
        `${rootUrl}/security`,
        `${rootUrl}/contact`
      ]
    },
    errors: []
  },
  facts,
  actions,
  tasks,
  scores: {
    readability: 76,
    trustability: 68,
    actionability: 72,
    taskSuccess: 74,
    overall: 73
  },
  recommendations,
  generatedAt: scannedAt
};

export const demoArtifacts: GeneratedArtifact[] = [
  {
    path: "llms.txt",
    mediaType: "text/plain",
    content:
      "# NimbusCRM\n\nNimbusCRM is a B2B SaaS revenue workspace.\n\nImportant pages:\n- Pricing: https://nimbuscrm.example/pricing\n- Docs: https://nimbuscrm.example/docs\n- Security: https://nimbuscrm.example/security\n- Contact: https://nimbuscrm.example/contact\n"
  },
  {
    path: "llms-full.txt",
    mediaType: "text/plain",
    content:
      "# NimbusCRM full agent context\n\nPricing, docs, integrations, support, security, and policies were scanned. Some cancellation/refund details were not found.\n"
  },
  {
    path: "site-profile.json",
    mediaType: "application/json",
    content: JSON.stringify(demoReport.site, null, 2)
  },
  {
    path: "facts.json",
    mediaType: "application/json",
    content: JSON.stringify(facts, null, 2)
  },
  {
    path: "actions.json",
    mediaType: "application/json",
    content: JSON.stringify(actions, null, 2)
  },
  {
    path: "tasks-report.json",
    mediaType: "application/json",
    content: JSON.stringify(tasks, null, 2)
  },
  {
    path: "recommendations.json",
    mediaType: "application/json",
    content: JSON.stringify(recommendations, null, 2)
  },
  {
    path: ".well-known/agents.json",
    mediaType: "application/json",
    content: JSON.stringify(
      {
        name: "NimbusCRM agent actions",
        actions: actions.map((action) => ({
          name: action.name,
          type: action.actionType,
          url: action.url,
          requiresHumanConfirmation: action.requiresHumanConfirmation,
          sensitivity: action.sensitivity
        }))
      },
      null,
      2
    )
  },
  {
    path: "markdown/pricing.md",
    mediaType: "text/markdown",
    content:
      "# NimbusCRM pricing\n\nGrowth starts at $49 per seat per month. Enterprise pricing requires sales contact.\n"
  }
];
