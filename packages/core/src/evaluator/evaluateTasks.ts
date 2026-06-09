import type { AgentAction, AgentTask, AgentTaskResult, ExtractedFact, PageSnapshot, SiteScan } from "../schemas.js";
import { clamp, countKeywordHits, includesAny, snippetAround, truncateText, uniqueStrings } from "../utils/text.js";
import { defaultTasks } from "./defaultTasks.js";

type Evidence = {
  urls: string[];
  snippets: string[];
};

export function evaluateTasks(
  scan: SiteScan,
  facts: readonly ExtractedFact[],
  actions: readonly AgentAction[],
  tasks: readonly AgentTask[] = defaultTasks
): AgentTaskResult[] {
  return tasks.map((task) => AgentTaskResultSchemaLike(parseTaskResult(task, scan, facts, actions)));
}

function parseTaskResult(
  task: AgentTask,
  scan: SiteScan,
  facts: readonly ExtractedFact[],
  actions: readonly AgentAction[]
): AgentTaskResult {
  switch (task.id) {
    case "find_pricing":
      return evaluateFindPricing(task, scan, facts, actions);
    case "compare_plans":
      return evaluateComparePlans(task, scan, facts);
    case "book_demo":
      return evaluateActionPath(task, scan, actions, ["book_demo", "contact_sales", "request_quote"], ["demo", "sales", "contact"]);
    case "find_docs":
      return evaluatePageAndAction(task, scan, facts, actions, ["docs", "api_docs"], ["docs", "open_api_docs", "search_docs"]);
    case "find_security":
      return evaluatePageAndAction(task, scan, facts, actions, ["security"], ["open_security_page"]);
    case "find_policies":
      return evaluatePolicies(task, scan, facts, actions);
    case "find_integrations":
      return evaluatePageAndFact(task, scan, facts, ["integrations"], ["integration"], ["integrations"]);
    case "identify_target_customer":
      return evaluateTargetCustomer(task, scan, facts);
    case "find_support":
      return evaluateActionPath(task, scan, actions, ["request_support", "contact_sales"], ["support", "help", "contact"]);
    default:
      return evaluateGenericTask(task, scan, facts, actions);
  }
}

function evaluateFindPricing(
  task: AgentTask,
  scan: SiteScan,
  facts: readonly ExtractedFact[],
  actions: readonly AgentAction[]
): AgentTaskResult {
  const pricingPages = pagesOfType(scan, ["pricing"]);
  const pricingFacts = facts.filter((fact) => fact.type === "pricing" || fact.type === "plan");
  const pricingActions = actions.filter((action) => ["view_pricing", "contact_sales", "request_quote"].includes(action.name));
  const evidence = collectEvidence([...pricingPages, ...pricingFacts, ...pricingActions], task.requiredEvidence);
  const hasPlansOrPrice = pricingFacts.some((fact) => fact.type === "plan" || /(?:\$|\bprice|\bplan)/i.test(fact.value));

  if (pricingPages.length > 0 && hasPlansOrPrice) {
    return result(task, "pass", 90, "Pricing information is discoverable with page-level evidence.", evidence);
  }
  if (pricingPages.length > 0 || pricingActions.length > 0 || pricingFacts.length > 0) {
    return result(task, "partial", 60, "A pricing path exists, but plan or price details are incomplete.", evidence, [
      "Add clear plan names, price points, or an explicit contact-sales pricing statement."
    ]);
  }

  return result(task, "fail", 0, "No pricing page, pricing fact, or quote/contact-sales pricing path was found.", evidence, [
    "Create a pricing page or add a clear pricing/contact-sales link."
  ]);
}

function evaluateComparePlans(task: AgentTask, scan: SiteScan, facts: readonly ExtractedFact[]): AgentTaskResult {
  const planFacts = facts.filter((fact) => fact.type === "plan");
  const pricingPages = pagesOfType(scan, ["pricing"]);
  const featureEvidence = pricingPages.filter((page) => includesAny(page.visibleText, ["features", "limits", "seats", "included"]));
  const evidence = collectEvidence([...planFacts, ...featureEvidence], task.requiredEvidence);

  if (planFacts.length >= 2 && featureEvidence.length > 0) {
    return result(task, "pass", 85, "Multiple plans and comparison-oriented details were found.", evidence);
  }
  if (planFacts.length > 0 || pricingPages.length > 0) {
    return result(task, "partial", 50, "Plan evidence exists, but differences are not fully machine-readable.", evidence, [
      "Add concise plan comparison copy with features, limits, and intended users."
    ]);
  }

  return result(task, "fail", 0, "No plan comparison evidence was found.", evidence, [
    "Add pricing plan names and comparison details."
  ]);
}

function evaluatePolicies(
  task: AgentTask,
  scan: SiteScan,
  facts: readonly ExtractedFact[],
  actions: readonly AgentAction[]
): AgentTaskResult {
  const policyPages = pagesOfType(scan, ["privacy", "terms"]);
  const policyFacts = facts.filter((fact) => fact.type === "policy");
  const policyActions = actions.filter((action) => ["read_privacy_policy", "read_terms"].includes(action.name));
  const evidence = collectEvidence([...policyPages, ...policyFacts, ...policyActions], task.requiredEvidence);
  const policyKinds = new Set(policyPages.map((page) => page.pageType));

  if (policyKinds.has("privacy") && policyKinds.has("terms")) {
    return result(task, "pass", 85, "Privacy and terms/legal policy pages are discoverable.", evidence);
  }
  if (policyPages.length > 0 || policyFacts.length > 0 || policyActions.length > 0) {
    return result(task, "partial", 55, "Some policy evidence was found, but coverage is incomplete.", evidence, [
      "Expose privacy, terms, cancellation, and refund policies from stable URLs."
    ]);
  }

  return result(task, "fail", 0, "No privacy, terms, cancellation, or refund policy evidence was found.", evidence, [
    "Add visible policy links and machine-readable summaries."
  ]);
}

function evaluateTargetCustomer(task: AgentTask, scan: SiteScan, facts: readonly ExtractedFact[]): AgentTaskResult {
  const targetFacts = facts.filter((fact) => fact.type === "product" && /target|user|customer/i.test(fact.label));
  const targetPages = scan.pages.filter((page) =>
    includesAny(page.visibleText, ["for teams", "for developers", "for enterprises", "for founders", "use cases", "built for"])
  );
  const evidence = collectEvidence([...targetFacts, ...targetPages], task.requiredEvidence);

  if (targetFacts.length > 0 || targetPages.length > 0) {
    return result(task, "pass", targetFacts.length > 0 ? 80 : 70, "Target user evidence was found.", evidence);
  }

  return result(task, "fail", 0, "No clear target-customer language was found.", evidence, [
    "Add direct copy explaining who the product is for."
  ]);
}

function evaluateActionPath(
  task: AgentTask,
  scan: SiteScan,
  actions: readonly AgentAction[],
  actionNames: readonly string[],
  pageKeywords: readonly string[]
): AgentTaskResult {
  const matchingActions = actions.filter((action) => actionNames.includes(action.name));
  const matchingPages = scan.pages.filter((page) => includesAny(`${page.pageType} ${page.finalUrl} ${page.visibleText}`, pageKeywords));
  const hasForm = matchingActions.some((action) => action.actionType === "form");
  const evidence = collectEvidence([...matchingActions, ...matchingPages], task.requiredEvidence);

  if (hasForm) {
    return result(task, "pass", 90, "A relevant form-based action path was found.", evidence);
  }
  if (matchingActions.length > 0 || matchingPages.length > 0) {
    return result(task, "partial", 60, "A navigation path exists, but no actionable form was detected.", evidence, [
      "Expose field labels and purpose for the relevant form."
    ]);
  }

  return result(task, "fail", 0, "No matching action path was found.", evidence, [
    "Add a clear action page and form for this journey."
  ]);
}

function evaluatePageAndAction(
  task: AgentTask,
  scan: SiteScan,
  facts: readonly ExtractedFact[],
  actions: readonly AgentAction[],
  pageTypes: readonly string[],
  actionNames: readonly string[]
): AgentTaskResult {
  const pages = pagesOfType(scan, pageTypes);
  const matchingActions = actions.filter((action) => actionNames.includes(action.name));
  const matchingFacts = facts.filter((fact) => task.requiredEvidence.some((keyword) => factMatches(fact, keyword)));
  const evidence = collectEvidence([...pages, ...matchingFacts, ...matchingActions], task.requiredEvidence);

  if (pages.length > 0 && (matchingActions.length > 0 || matchingFacts.length > 0)) {
    return result(task, "pass", 85, "Relevant pages and structured evidence were found.", evidence);
  }
  if (pages.length > 0 || matchingActions.length > 0 || matchingFacts.length > 0) {
    return result(task, "partial", 60, "Some relevant evidence was found, but it is incomplete.", evidence, [
      "Add clearer page titles, headings, and stable links for this journey."
    ]);
  }

  return result(task, "fail", 0, "No relevant evidence was found.", evidence, [
    "Create a stable, discoverable page for this journey."
  ]);
}

function evaluatePageAndFact(
  task: AgentTask,
  scan: SiteScan,
  facts: readonly ExtractedFact[],
  pageTypes: readonly string[],
  factTypes: readonly string[],
  keywords: readonly string[]
): AgentTaskResult {
  const pages = pagesOfType(scan, pageTypes);
  const matchingFacts = facts.filter((fact) => factTypes.includes(fact.type) || keywords.some((keyword) => factMatches(fact, keyword)));
  const evidence = collectEvidence([...pages, ...matchingFacts], task.requiredEvidence);

  if (pages.length > 0 && matchingFacts.length > 0) {
    return result(task, "pass", 80, "Relevant page and fact evidence were found.", evidence);
  }
  if (pages.length > 0 || matchingFacts.length > 0) {
    return result(task, "partial", 55, "Some relevant evidence was found, but details are incomplete.", evidence, [
      "Add clearer structured facts and links for this topic."
    ]);
  }

  return result(task, "fail", 0, "No relevant evidence was found.", evidence, [
    "Add a discoverable page and structured content for this topic."
  ]);
}

function evaluateGenericTask(
  task: AgentTask,
  scan: SiteScan,
  facts: readonly ExtractedFact[],
  actions: readonly AgentAction[]
): AgentTaskResult {
  const pageMatches = scan.pages.filter(
    (page) => countKeywordHits(`${page.title ?? ""} ${page.visibleText} ${page.finalUrl}`, task.requiredEvidence) > 0
  );
  const factMatchesForTask = facts.filter((fact) =>
    task.requiredEvidence.some((keyword) => factMatches(fact, keyword))
  );
  const actionMatches = actions.filter((action) =>
    countKeywordHits(`${action.name} ${action.description} ${action.url}`, task.requiredEvidence) > 0
  );
  const evidence = collectEvidence([...pageMatches, ...factMatchesForTask, ...actionMatches], task.requiredEvidence);
  const score = clamp(Math.round((evidence.snippets.length / Math.max(1, task.requiredEvidence.length)) * 100), 0, 100);

  return result(
    task,
    score >= 70 ? "pass" : score > 0 ? "partial" : "fail",
    score,
    score > 0 ? "Keyword evidence was found for this custom task." : "No keyword evidence was found for this custom task.",
    evidence,
    score > 0 ? [] : ["Add stable pages and structured evidence for this task."]
  );
}

function pagesOfType(scan: SiteScan, pageTypes: readonly string[]): PageSnapshot[] {
  return scan.pages.filter((page) => pageTypes.includes(page.pageType));
}

function collectEvidence(items: readonly (PageSnapshot | ExtractedFact | AgentAction)[], keywords: readonly string[]): Evidence {
  const urls: string[] = [];
  const snippets: string[] = [];

  for (const item of items) {
    if ("finalUrl" in item) {
      urls.push(item.finalUrl);
      snippets.push(snippetAround(`${item.title ?? ""} ${item.visibleText}`, keywords));
    } else if ("sourceUrl" in item && "confidence" in item && "label" in item) {
      urls.push(item.sourceUrl);
      snippets.push(truncateText(`${item.label}: ${item.value}${item.sourceText ? ` - ${item.sourceText}` : ""}`, 240));
    } else if ("url" in item) {
      urls.push(item.url);
      snippets.push(truncateText(`${item.name}: ${item.description}`, 180));
    }
  }

  return {
    urls: uniqueStrings(urls),
    snippets: uniqueStrings(snippets.filter(Boolean)).slice(0, 5)
  };
}

function result(
  task: AgentTask,
  status: "pass" | "partial" | "fail",
  score: number,
  explanation: string,
  evidence: Evidence,
  recommendations: string[] = []
): AgentTaskResult {
  return {
    taskId: task.id,
    title: task.title,
    status,
    score,
    explanation,
    evidenceUrls: evidence.urls,
    evidenceSnippets: evidence.snippets,
    missingInformation: status === "pass" ? [] : missingInformationFor(task),
    recommendations
  };
}

function missingInformationFor(task: AgentTask): string[] {
  return task.requiredEvidence.map((item) => `Evidence for "${item}"`);
}

function factMatches(fact: ExtractedFact, keyword: string): boolean {
  return includesAny(`${fact.type} ${fact.label} ${fact.value} ${fact.sourceText ?? ""}`, [keyword]);
}

function AgentTaskResultSchemaLike(resultValue: AgentTaskResult): AgentTaskResult {
  return resultValue;
}
