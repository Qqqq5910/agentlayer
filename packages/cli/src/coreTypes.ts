export type ExtractedFormField = {
  name: string;
  type: string;
  label?: string;
  required?: boolean;
};

export type ExtractedForm = {
  id: string;
  action?: string;
  method?: "GET" | "POST";
  purpose: string;
  fields: ExtractedFormField[];
  submitText?: string;
  sourceUrl: string;
};

export type PageSnapshot = {
  url: string;
  finalUrl: string;
  title?: string;
  description?: string;
  canonicalUrl?: string;
  status?: number;
  pageType: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  links: Array<{
    href: string;
    text: string;
    isExternal: boolean;
  }>;
  forms: ExtractedForm[];
  jsonLd: unknown[];
  openGraph: Record<string, string>;
  visibleText: string;
  markdown: string;
  emails: string[];
  socialLinks: string[];
  fetchedAt: string;
};

export type SiteScan = {
  rootUrl: string;
  scannedAt: string;
  pages: PageSnapshot[];
  robotsTxt?: {
    url: string;
    found: boolean;
    text?: string;
  };
  sitemap?: {
    url: string;
    found: boolean;
    urls: string[];
  };
  errors: Array<{
    url: string;
    message: string;
  }>;
};

export type SiteProfile = {
  name: string;
  summary: string;
  rootUrl: string;
  keyPages: Record<string, string>;
  generatedAt: string;
};

export type ExtractedFact = {
  id: string;
  type:
    | "company"
    | "product"
    | "pricing"
    | "plan"
    | "integration"
    | "policy"
    | "security"
    | "contact"
    | "docs"
    | "support"
    | "other";
  label: string;
  value: string;
  sourceUrl: string;
  sourceText?: string;
  confidence: number;
  updatedAt?: string;
};

export type AgentAction = {
  id: string;
  name: string;
  description: string;
  userIntent: string;
  actionType: "navigation" | "form" | "api" | "unknown";
  url: string;
  method?: "GET" | "POST";
  requiredFields?: ExtractedFormField[];
  requiresHumanConfirmation: boolean;
  sensitivity: "low" | "medium" | "high";
  sourceUrl: string;
  confidence: number;
};

export type AgentTask = {
  id: string;
  title: string;
  description: string;
  requiredEvidence: string[];
};

export type AgentJourneyStep = {
  id: string;
  title: string;
  status: "pass" | "partial" | "fail";
  explanation: string;
  evidenceUrls: string[];
  evidenceSnippets: string[];
};

export type AgentTaskResult = {
  taskId: string;
  title: string;
  status: "pass" | "partial" | "fail";
  score: number;
  explanation: string;
  evidenceUrls: string[];
  evidenceSnippets: string[];
  missingInformation: string[];
  recommendations: string[];
  journeySteps: AgentJourneyStep[];
};

export type FormOperabilityFinding = {
  id: string;
  status: "pass" | "partial" | "fail";
  message: string;
};

export type FormOperabilityResult = {
  formId: string;
  sourceUrl: string;
  actionUrl?: string;
  method?: "GET" | "POST";
  purpose: string;
  score: number;
  sensitivity: "low" | "medium" | "high";
  requiresHumanConfirmation: boolean;
  fields: ExtractedFormField[];
  submitText?: string;
  findings: FormOperabilityFinding[];
  recommendations: string[];
};

export type Recommendation = {
  title: string;
  severity: "high" | "medium" | "low";
  whyItMatters: string;
  howToFix: string;
  affectedTasks: string[];
  suggestedArtifact?: string;
};

export type AgentOperabilityReport = {
  site: SiteProfile;
  scan: SiteScan;
  facts: ExtractedFact[];
  actions: AgentAction[];
  forms: FormOperabilityResult[];
  tasks: AgentTaskResult[];
  scores: {
    readability: number;
    trustability: number;
    actionability: number;
    taskSuccess: number;
    overall: number;
  };
  recommendations: Recommendation[];
  generatedAt: string;
};

export type GeneratedArtifact = {
  path: string;
  content: string;
  mediaType: string;
};
