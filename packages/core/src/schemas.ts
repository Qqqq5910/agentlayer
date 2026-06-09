import { z } from "zod";

export const ScanOptionsSchema = z.object({
  rootUrl: z.string().url(),
  maxPages: z.number().int().positive().max(100).default(20),
  timeoutMs: z.number().int().positive().default(10000),
  respectRobotsTxt: z.boolean().default(true),
  userAgent: z
    .string()
    .default("AgentLayerBot/0.1 (+https://github.com/Qqqq5910/agentlayer)")
});

export type ScanOptions = z.infer<typeof ScanOptionsSchema>;

export const ExtractedFormFieldSchema = z.object({
  name: z.string(),
  type: z.string(),
  label: z.string().optional(),
  required: z.boolean().optional()
});

export type ExtractedFormField = z.infer<typeof ExtractedFormFieldSchema>;

export const ExtractedFormSchema = z.object({
  id: z.string(),
  action: z.string().optional(),
  method: z.enum(["GET", "POST"]).optional(),
  purpose: z.string(),
  fields: z.array(ExtractedFormFieldSchema),
  submitText: z.string().optional(),
  sourceUrl: z.string().url()
});

export type ExtractedForm = z.infer<typeof ExtractedFormSchema>;

export const PageSnapshotSchema = z.object({
  url: z.string().url(),
  finalUrl: z.string().url(),
  title: z.string().optional(),
  description: z.string().optional(),
  canonicalUrl: z.string().url().optional(),
  status: z.number().optional(),
  pageType: z.string(),
  headings: z.object({
    h1: z.array(z.string()),
    h2: z.array(z.string()),
    h3: z.array(z.string())
  }),
  links: z.array(
    z.object({
      href: z.string(),
      text: z.string(),
      isExternal: z.boolean()
    })
  ),
  forms: z.array(ExtractedFormSchema),
  jsonLd: z.array(z.unknown()),
  openGraph: z.record(z.string()),
  visibleText: z.string(),
  markdown: z.string(),
  emails: z.array(z.string()),
  socialLinks: z.array(z.string()),
  fetchedAt: z.string()
});

export type PageSnapshot = z.infer<typeof PageSnapshotSchema>;

export const SiteScanSchema = z.object({
  rootUrl: z.string().url(),
  scannedAt: z.string(),
  pages: z.array(PageSnapshotSchema),
  robotsTxt: z
    .object({
      url: z.string().url(),
      found: z.boolean(),
      text: z.string().optional()
    })
    .optional(),
  sitemap: z
    .object({
      url: z.string().url(),
      found: z.boolean(),
      urls: z.array(z.string().url()).default([])
    })
    .optional(),
  errors: z.array(
    z.object({
      url: z.string(),
      message: z.string()
    })
  )
});

export type SiteScan = z.infer<typeof SiteScanSchema>;

export const SiteProfileSchema = z.object({
  name: z.string(),
  summary: z.string(),
  rootUrl: z.string().url(),
  keyPages: z.record(z.string()),
  generatedAt: z.string()
});

export type SiteProfile = z.infer<typeof SiteProfileSchema>;

export const ExtractedFactSchema = z.object({
  id: z.string(),
  type: z.enum([
    "company",
    "product",
    "pricing",
    "plan",
    "integration",
    "policy",
    "security",
    "contact",
    "docs",
    "support",
    "other"
  ]),
  label: z.string(),
  value: z.string(),
  sourceUrl: z.string().url(),
  sourceText: z.string().optional(),
  confidence: z.number().min(0).max(1),
  updatedAt: z.string().optional()
});

export type ExtractedFact = z.infer<typeof ExtractedFactSchema>;

export const AgentActionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  userIntent: z.string(),
  actionType: z.enum(["navigation", "form", "api", "unknown"]),
  url: z.string().url(),
  method: z.enum(["GET", "POST"]).optional(),
  requiredFields: z.array(ExtractedFormFieldSchema).optional(),
  requiresHumanConfirmation: z.boolean(),
  sensitivity: z.enum(["low", "medium", "high"]),
  sourceUrl: z.string().url(),
  confidence: z.number().min(0).max(1)
});

export type AgentAction = z.infer<typeof AgentActionSchema>;

export const AgentTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  requiredEvidence: z.array(z.string())
});

export type AgentTask = z.infer<typeof AgentTaskSchema>;

export const AgentTaskResultSchema = z.object({
  taskId: z.string(),
  title: z.string(),
  status: z.enum(["pass", "partial", "fail"]),
  score: z.number().min(0).max(100),
  explanation: z.string(),
  evidenceUrls: z.array(z.string().url()),
  evidenceSnippets: z.array(z.string()),
  missingInformation: z.array(z.string()),
  recommendations: z.array(z.string())
});

export type AgentTaskResult = z.infer<typeof AgentTaskResultSchema>;

export const RecommendationSchema = z.object({
  title: z.string(),
  severity: z.enum(["high", "medium", "low"]),
  whyItMatters: z.string(),
  howToFix: z.string(),
  affectedTasks: z.array(z.string()),
  suggestedArtifact: z.string().optional()
});

export type Recommendation = z.infer<typeof RecommendationSchema>;

export const AgentOperabilityReportSchema = z.object({
  site: SiteProfileSchema,
  scan: SiteScanSchema,
  facts: z.array(ExtractedFactSchema),
  actions: z.array(AgentActionSchema),
  tasks: z.array(AgentTaskResultSchema),
  scores: z.object({
    readability: z.number().min(0).max(100),
    trustability: z.number().min(0).max(100),
    actionability: z.number().min(0).max(100),
    taskSuccess: z.number().min(0).max(100),
    overall: z.number().min(0).max(100)
  }),
  recommendations: z.array(RecommendationSchema),
  generatedAt: z.string()
});

export type AgentOperabilityReport = z.infer<typeof AgentOperabilityReportSchema>;

export const GeneratedArtifactSchema = z.object({
  path: z.string(),
  content: z.string(),
  mediaType: z.string()
});

export type GeneratedArtifact = z.infer<typeof GeneratedArtifactSchema>;

