import type { AgentAction, ExtractedForm, PageSnapshot, SiteScan } from "../schemas.js";
import { dedupeBy, includesAny, slugify } from "../utils/text.js";

export function extractActions(scan: SiteScan): AgentAction[] {
  const actions: AgentAction[] = [];

  for (const page of scan.pages) {
    for (const form of page.forms) {
      actions.push(actionFromForm(page, form));
    }

    const navigation = navigationActionForPage(page);
    if (navigation) {
      actions.push(navigation);
    }
  }

  return dedupeBy(actions, (action) => `${action.name}:${action.url}:${action.actionType}`);
}

function actionFromForm(page: PageSnapshot, form: ExtractedForm): AgentAction {
  const name = actionNameFromPurpose(form.purpose, page);
  const sensitivity = sensitivityFor(`${form.purpose} ${form.submitText ?? ""} ${page.visibleText}`);
  const requiresHumanConfirmation =
    sensitivity !== "low" || form.method === "POST" || includesAny(form.purpose, ["contact", "demo", "quote", "support"]);

  return {
    id: slugify(`${name}-${page.finalUrl}`),
    name,
    description: descriptionForActionName(name),
    userIntent: userIntentForActionName(name),
    actionType: "form",
    url: form.action ?? page.finalUrl,
    method: form.method,
    requiredFields: form.fields,
    requiresHumanConfirmation,
    sensitivity,
    sourceUrl: form.sourceUrl,
    confidence: form.purpose === "unknown form" ? 0.55 : 0.85
  };
}

function navigationActionForPage(page: PageSnapshot): AgentAction | null {
  const name = actionNameForPageType(page);
  if (!name) {
    return null;
  }

  return {
    id: slugify(`${name}-${page.finalUrl}`),
    name,
    description: descriptionForActionName(name),
    userIntent: userIntentForActionName(name),
    actionType: "navigation",
    url: page.finalUrl,
    method: "GET",
    requiresHumanConfirmation: false,
    sensitivity: sensitivityFor(`${name} ${page.finalUrl}`),
    sourceUrl: page.finalUrl,
    confidence: 0.75
  };
}

function actionNameFromPurpose(purpose: string, page: PageSnapshot): string {
  const context = `${purpose} ${page.pageType} ${page.finalUrl}`;
  if (includesAny(context, ["book demo", "demo", "schedule"])) {
    return "book_demo";
  }
  if (includesAny(context, ["quote"])) {
    return "request_quote";
  }
  if (includesAny(context, ["support", "help"])) {
    return "request_support";
  }
  if (includesAny(context, ["search docs", "search"])) {
    return "search_docs";
  }
  if (includesAny(context, ["sales", "contact", "lead"])) {
    return "contact_sales";
  }

  return "submit_form";
}

function actionNameForPageType(page: PageSnapshot): string | null {
  switch (page.pageType) {
    case "pricing":
      return "view_pricing";
    case "docs":
      return "search_docs";
    case "api_docs":
      return "open_api_docs";
    case "security":
      return "open_security_page";
    case "privacy":
      return "read_privacy_policy";
    case "terms":
      return "read_terms";
    case "contact":
      return "contact_sales";
    case "demo":
      return "book_demo";
    case "support":
      return "request_support";
    default:
      return null;
  }
}

function sensitivityFor(context: string): "low" | "medium" | "high" {
  if (includesAny(context, ["payment", "purchase", "delete", "cancel", "refund", "billing", "checkout"])) {
    return "high";
  }

  if (includesAny(context, ["demo", "sales", "quote", "contact", "support", "submit"])) {
    return "medium";
  }

  return "low";
}

function descriptionForActionName(name: string): string {
  const descriptions: Record<string, string> = {
    book_demo: "Find the path for booking a product demo.",
    contact_sales: "Find the path for contacting sales.",
    open_api_docs: "Open API documentation.",
    open_security_page: "Open security or trust information.",
    read_privacy_policy: "Read the privacy policy.",
    read_terms: "Read terms or legal policies.",
    request_quote: "Request a quote from the site owner.",
    request_support: "Find the support request path.",
    search_docs: "Find or search documentation.",
    submit_form: "Submit an on-site form.",
    view_pricing: "View pricing information."
  };

  return descriptions[name] ?? "Perform a detected website action.";
}

function userIntentForActionName(name: string): string {
  const intents: Record<string, string> = {
    book_demo: "I want to book a product demo.",
    contact_sales: "I want to contact sales.",
    open_api_docs: "I want to read API documentation.",
    open_security_page: "I want to inspect security and trust details.",
    read_privacy_policy: "I want to read the privacy policy.",
    read_terms: "I want to read terms and legal policies.",
    request_quote: "I want to request a quote.",
    request_support: "I need support or help.",
    search_docs: "I want to find documentation.",
    submit_form: "I want to submit this form after confirmation.",
    view_pricing: "I want to understand pricing."
  };

  return intents[name] ?? "I want an agent to operate this website.";
}
