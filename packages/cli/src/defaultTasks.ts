import type { AgentTask } from "./coreTypes.js";

export const DEFAULT_B2B_SAAS_TASKS: AgentTask[] = [
  {
    id: "find_pricing",
    title: "Find pricing",
    description: "Can an AI agent find the pricing page or pricing information?",
    requiredEvidence: ["pricing page", "plan", "price", "contact sales", "quote"]
  },
  {
    id: "compare_plans",
    title: "Compare plans",
    description: "Can an AI agent understand plan differences?",
    requiredEvidence: ["plan names", "features", "limits"]
  },
  {
    id: "book_demo",
    title: "Book demo or contact sales",
    description: "Can an AI agent find a path to book a demo or contact sales?",
    requiredEvidence: ["form", "demo", "sales", "contact"]
  },
  {
    id: "find_docs",
    title: "Find documentation",
    description: "Can an AI agent find docs or API documentation?",
    requiredEvidence: ["docs", "api", "developer"]
  },
  {
    id: "find_security",
    title: "Find security and trust information",
    description: "Can an AI agent find security, compliance, or trust information?",
    requiredEvidence: ["security", "trust", "soc2", "gdpr", "compliance"]
  },
  {
    id: "find_policies",
    title: "Find policies",
    description: "Can an AI agent find privacy, terms, cancellation, or refund policies?",
    requiredEvidence: ["privacy", "terms", "refund", "cancellation"]
  },
  {
    id: "find_integrations",
    title: "Find integrations",
    description: "Can an AI agent find integrations or supported platforms?",
    requiredEvidence: ["integrations", "slack", "google", "salesforce", "zapier"]
  },
  {
    id: "identify_target_customer",
    title: "Identify target customer",
    description: "Can an AI agent understand who the product is for?",
    requiredEvidence: ["for teams", "for developers", "for enterprises", "use cases"]
  }
];

export function getEmbeddedDefaultTasks(): AgentTask[] {
  return DEFAULT_B2B_SAAS_TASKS.map((task) => ({
    ...task,
    requiredEvidence: [...task.requiredEvidence]
  }));
}
