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
  const pathSegments = path.split("/").filter(Boolean);
  const firstSegment = pathSegments[0] ?? "";
  const isEditorialContentPath = [
    "article",
    "articles",
    "blog",
    "blogs",
    "news",
    "resource",
    "resources"
  ].includes(firstSegment);
  const titleAndHeadings = [
    input.title ?? "",
    input.description ?? "",
    input.headings?.h1.join(" ") ?? "",
    input.headings?.h2.join(" ") ?? ""
  ]
    .join(" ")
    .toLowerCase();
  const context = [path, titleAndHeadings, input.text?.slice(0, 1200) ?? ""]
    .join(" ")
    .toLowerCase();

  if (path === "/" || path === "") {
    return "home";
  }
  if (path.endsWith("/llms.txt")) {
    return "llms";
  }
  if (
    pathStartsWith(pathSegments, ["docs", "api"]) ||
    firstPathSegmentIs(pathSegments, ["api", "developers"])
  ) {
    return "api_docs";
  }
  if (firstPathSegmentIs(pathSegments, ["pricing", "plans"])) {
    return "pricing";
  }
  if (firstPathSegmentIs(pathSegments, ["docs", "documentation"])) {
    return "docs";
  }
  if (firstPathSegmentIs(pathSegments, ["security", "trust", "compliance"])) {
    return "security";
  }
  if (includesAny(path, ["/privacy"]) || includesAny(context, ["privacy policy"])) {
    return "privacy";
  }
  if (
    includesAny(path, ["/terms", "/legal"]) ||
    includesAny(context, ["terms of service", "terms and conditions"])
  ) {
    return "terms";
  }
  if (
    includesAny(path, ["/demo", "/book-demo"]) ||
    includesAny(titleAndHeadings, ["book a demo", "schedule a demo", "request demo"])
  ) {
    return "demo";
  }
  if (
    includesAny(path, ["/contact", "/sales"]) ||
    includesAny(titleAndHeadings, ["contact sales", "talk to sales", "contact us"])
  ) {
    return "contact";
  }
  if (
    includesAny(path, ["/support", "/help"]) ||
    includesAny(titleAndHeadings, ["support", "help center", "customer help"])
  ) {
    return "support";
  }
  if (
    firstPathSegmentIs(pathSegments, ["integrations", "connectors"]) ||
    (!isEditorialContentPath &&
      includesAny(titleAndHeadings, [
        "integration",
        "integrations",
        "connectors",
        "apps marketplace"
      ]))
  ) {
    return "integrations";
  }
  if (
    includesAny(path, ["/customers", "/case-studies"]) ||
    includesAny(titleAndHeadings, ["customers", "case studies", "case study"])
  ) {
    return "customers";
  }
  if (
    !isEditorialContentPath &&
    includesAny(titleAndHeadings, ["api reference", "developer docs"])
  ) {
    return "api_docs";
  }
  if (!isEditorialContentPath && includesAny(titleAndHeadings, ["documentation", "docs"])) {
    return "docs";
  }
  if (!isEditorialContentPath && includesAny(titleAndHeadings, ["pricing", "plans", "price"])) {
    return "pricing";
  }
  if (
    !isEditorialContentPath &&
    includesAny(titleAndHeadings, ["security", "trust center", "soc 2", "compliance", "gdpr"])
  ) {
    return "security";
  }
  if (includesAny(context, ["faq", "frequently asked questions"])) {
    return "faq";
  }

  return "unknown";
}

function pathStartsWith(pathSegments: readonly string[], prefix: readonly string[]): boolean {
  return prefix.every((segment, index) => pathSegments[index] === segment);
}

function firstPathSegmentIs(pathSegments: readonly string[], values: readonly string[]): boolean {
  return values.includes(pathSegments[0] ?? "");
}
