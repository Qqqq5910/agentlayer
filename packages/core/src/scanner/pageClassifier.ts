import { includesAny } from "../utils/text.js";

type ClassifierInput = {
  url: string;
  title?: string;
  description?: string;
  headings?: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  text?: string;
};

export function classifyPage(input: ClassifierInput): string {
  const url = new URL(input.url);
  const path = url.pathname.toLowerCase();
  const titleAndHeadings = [
    input.title ?? "",
    input.description ?? "",
    input.headings?.h1.join(" ") ?? "",
    input.headings?.h2.join(" ") ?? ""
  ]
    .join(" ")
    .toLowerCase();
  const context = [
    path,
    titleAndHeadings,
    input.text?.slice(0, 1200) ?? ""
  ]
    .join(" ")
    .toLowerCase();

  if (path === "/" || path === "") {
    return "home";
  }
  if (path.endsWith("/llms.txt")) {
    return "llms";
  }
  if (includesAny(path, ["/docs/api", "/api", "/developers"])) {
    return "api_docs";
  }
  if (includesAny(path, ["/pricing", "/plans"])) {
    return "pricing";
  }
  if (includesAny(path, ["/docs", "/documentation"])) {
    return "docs";
  }
  if (includesAny(path, ["/security", "/trust", "/compliance"])) {
    return "security";
  }
  if (includesAny(path, ["/privacy"]) || includesAny(context, ["privacy policy"])) {
    return "privacy";
  }
  if (includesAny(path, ["/terms", "/legal"]) || includesAny(context, ["terms of service", "terms and conditions"])) {
    return "terms";
  }
  if (includesAny(path, ["/demo", "/book-demo"]) || includesAny(titleAndHeadings, ["book a demo", "schedule a demo", "request demo"])) {
    return "demo";
  }
  if (includesAny(path, ["/contact", "/sales"]) || includesAny(titleAndHeadings, ["contact sales", "talk to sales", "contact us"])) {
    return "contact";
  }
  if (includesAny(path, ["/support", "/help"]) || includesAny(titleAndHeadings, ["support", "help center", "customer help"])) {
    return "support";
  }
  if (includesAny(path, ["/integrations", "/connectors"]) || includesAny(titleAndHeadings, ["integration", "integrations", "connectors", "apps marketplace"])) {
    return "integrations";
  }
  if (includesAny(path, ["/customers", "/case-studies"]) || includesAny(titleAndHeadings, ["customers", "case studies", "case study"])) {
    return "customers";
  }
  if (includesAny(titleAndHeadings, ["api reference", "developer docs"])) {
    return "api_docs";
  }
  if (includesAny(titleAndHeadings, ["documentation", "docs"])) {
    return "docs";
  }
  if (includesAny(titleAndHeadings, ["pricing", "plans", "price"])) {
    return "pricing";
  }
  if (includesAny(titleAndHeadings, ["security", "trust center", "soc 2", "compliance", "gdpr"])) {
    return "security";
  }
  if (includesAny(context, ["faq", "frequently asked questions"])) {
    return "faq";
  }

  return "unknown";
}
