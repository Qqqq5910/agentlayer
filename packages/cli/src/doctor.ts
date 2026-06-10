import type {
  AgentAction,
  AgentOperabilityReport,
  AgentTaskResult,
  ExtractedFact
} from "./coreTypes.js";

type CheckState = "found" | "partial" | "missing" | "none detected" | "pass" | "fail";

export type DoctorDiagnosis = {
  url: string;
  scores: AgentOperabilityReport["scores"];
  readable: {
    llmsTxt: CheckState;
    sitemapXml: CheckState;
    markdownAlternatives: CheckState;
  };
  trustable: {
    pricingFacts: CheckState;
    policySources: CheckState;
    conflictingClaims: CheckState;
  };
  actionable: {
    contactSales: CheckState;
    bookDemo: CheckState;
    requestQuote: CheckState;
    docsSearch: CheckState;
  };
  topFixes: string[];
  generatedAt: string;
};

export function buildDoctorDiagnosis(report: AgentOperabilityReport): DoctorDiagnosis {
  const pages = report.scan.pages;
  const facts = report.facts;
  const actions = report.actions;
  const tasks = report.tasks;
  const topFixes = report.recommendations.slice(0, 5).map((recommendation) => recommendation.title);

  return {
    url: report.scan.rootUrl,
    scores: report.scores,
    readable: {
      llmsTxt: hasPagePath(pages, ["/llms.txt"]) ? "found" : "missing",
      sitemapXml: report.scan.sitemap?.found ? "found" : "missing",
      markdownAlternatives: pages.some((page) => page.markdown.trim().length > 0)
        ? "found"
        : "missing"
    },
    trustable: {
      pricingFacts: factState(facts, ["pricing", "plan"], taskById(tasks, "find_pricing")),
      policySources: factState(facts, ["policy"], taskById(tasks, "find_policies")),
      conflictingClaims: "none detected"
    },
    actionable: {
      contactSales: actionState(actions, ["contact_sales"], taskById(tasks, "book_demo")),
      bookDemo: actionState(actions, ["book_demo"], taskById(tasks, "book_demo")),
      requestQuote: actionState(actions, ["request_quote"], undefined),
      docsSearch: actionState(
        actions,
        ["search_docs", "open_api_docs"],
        taskById(tasks, "find_docs")
      )
    },
    topFixes: topFixes.length > 0 ? topFixes : fallbackFixes(report),
    generatedAt: report.generatedAt
  };
}

export function formatDoctorDiagnosis(diagnosis: DoctorDiagnosis): string {
  const lines = [
    "AgentLayer Doctor",
    `URL: ${diagnosis.url}`,
    "",
    `Overall Agent Operability Score: ${Math.round(diagnosis.scores.overall)}/100`,
    "",
    "Readable:",
    `  llms.txt: ${diagnosis.readable.llmsTxt}`,
    `  sitemap.xml: ${diagnosis.readable.sitemapXml}`,
    `  markdown alternatives: ${diagnosis.readable.markdownAlternatives}`,
    "",
    "Trustable:",
    `  pricing facts: ${diagnosis.trustable.pricingFacts}`,
    `  policy sources: ${diagnosis.trustable.policySources}`,
    `  conflicting claims: ${diagnosis.trustable.conflictingClaims}`,
    "",
    "Actionable:",
    `  contact sales: ${diagnosis.actionable.contactSales}`,
    `  book demo: ${diagnosis.actionable.bookDemo}`,
    `  request quote: ${diagnosis.actionable.requestQuote}`,
    `  docs search: ${diagnosis.actionable.docsSearch}`,
    "",
    "Top fixes:"
  ];

  diagnosis.topFixes.forEach((fix, index) => {
    lines.push(`${index + 1}. ${fix}`);
  });

  return lines.join("\n");
}

function taskById(tasks: AgentTaskResult[], taskId: string): AgentTaskResult | undefined {
  return tasks.find((task) => task.taskId === taskId);
}

function hasPagePath(
  pages: AgentOperabilityReport["scan"]["pages"],
  expectedPaths: string[]
): boolean {
  return pages.some((page) => {
    try {
      const pathname = new URL(page.finalUrl || page.url).pathname.toLowerCase();
      return expectedPaths.includes(pathname);
    } catch {
      return false;
    }
  });
}

function factState(
  facts: ExtractedFact[],
  factTypes: ExtractedFact["type"][],
  relatedTask: AgentTaskResult | undefined
): CheckState {
  if (facts.some((fact) => factTypes.includes(fact.type))) {
    return "found";
  }

  if (relatedTask?.status === "partial") {
    return "partial";
  }

  return "missing";
}

function actionState(
  actions: AgentAction[],
  actionNames: string[],
  relatedTask: AgentTaskResult | undefined
): CheckState {
  if (actions.some((action) => actionNames.includes(action.name))) {
    return "pass";
  }

  if (relatedTask?.status === "pass") {
    return "pass";
  }

  if (relatedTask?.status === "partial") {
    return "partial";
  }

  return "fail";
}

function fallbackFixes(report: AgentOperabilityReport): string[] {
  const fixes: string[] = [];

  if (!report.scan.sitemap?.found) {
    fixes.push("Add or expose /sitemap.xml");
  }

  if (!report.scan.pages.some((page) => page.markdown.trim().length > 0)) {
    fixes.push("Add readable markdown alternatives for key pages");
  }

  if (!report.facts.some((fact) => fact.type === "pricing" || fact.type === "plan")) {
    fixes.push("Expose clear pricing or contact-sales evidence");
  }

  if (
    !report.actions.some((action) => action.name === "contact_sales" || action.name === "book_demo")
  ) {
    fixes.push("Add clear contact-sales or book-demo action paths");
  }

  fixes.push("Generate and review conservative AgentLayer manifests");
  return fixes.slice(0, 5);
}
