import type { ExtractedForm, FormOperabilityFinding, FormOperabilityResult, SiteScan } from "../schemas.js";
import { clamp, includesAny } from "../utils/text.js";

type FindingStatus = FormOperabilityFinding["status"];

export function evaluateFormOperability(scan: SiteScan): FormOperabilityResult[] {
  return scan.pages.flatMap((page) => page.forms.map((form) => evaluateForm(form)));
}

function evaluateForm(form: ExtractedForm): FormOperabilityResult {
  const declaredActionUrl = stableUrl(form.action);
  const effectiveActionUrl = declaredActionUrl ?? form.sourceUrl;
  const sensitivity = sensitivityFor(form);
  const requiresHumanConfirmation =
    sensitivity !== "low" || form.method === "POST" || includesAny(form.purpose, ["contact", "demo", "quote", "support"]);
  const labels = labelStatus(form);
  const requiredFields = requiredFieldStatus(form);
  const findings: FormOperabilityFinding[] = [
    finding(
      "stable_action_url",
      form.action ? (declaredActionUrl ? "pass" : "fail") : "partial",
      form.action
        ? declaredActionUrl
          ? "Form declares a stable action URL."
          : "Form action is present but is not a stable URL."
        : "Form relies on the page URL as its implicit submission target."
    ),
    finding(
      "method",
      form.method ? "pass" : "fail",
      form.method ? `Form declares ${form.method} as its method.` : "Form does not declare a supported method."
    ),
    finding(
      "field_names",
      form.fields.length > 0 && form.fields.every((field) => field.name.trim().length > 0) ? "pass" : "fail",
      form.fields.length > 0
        ? "Fields expose deterministic names."
        : "No named fields were extracted from the form."
    ),
    finding(
      "labels_or_placeholders",
      labels,
      labels === "pass"
        ? "All fields expose labels, aria labels, or placeholders."
        : labels === "partial"
          ? "Some fields expose labels, aria labels, or placeholders."
          : "No field labels, aria labels, or placeholders were extracted."
    ),
    finding(
      "required_fields",
      requiredFields,
      requiredFields === "pass"
        ? "Required fields are marked in the extracted form."
        : requiredFields === "partial"
          ? "The form may be optional or required markers were not detected."
          : "The form has fields but no machine-readable required markers."
    ),
    finding(
      "submit_text",
      form.submitText ? "pass" : "fail",
      form.submitText ? `Submit control text is "${form.submitText}".` : "No submit control text was extracted."
    ),
    finding(
      "inferred_purpose",
      form.purpose && form.purpose !== "unknown form" ? "pass" : "partial",
      form.purpose && form.purpose !== "unknown form"
        ? `Purpose inferred as "${form.purpose}".`
        : "Purpose could not be inferred confidently."
    ),
    finding("sensitivity", "pass", `Sensitivity is classified as ${sensitivity}.`),
    finding(
      "human_confirmation",
      requiresHumanConfirmation || sensitivity === "low" ? "pass" : "fail",
      requiresHumanConfirmation
        ? "Human confirmation is required before an agent submits this form."
        : "Human confirmation is not required for this low-sensitivity form."
    )
  ];

  return {
    formId: form.id,
    sourceUrl: form.sourceUrl,
    actionUrl: effectiveActionUrl,
    method: form.method,
    purpose: form.purpose,
    score: scoreFindings(findings),
    sensitivity,
    requiresHumanConfirmation,
    fields: form.fields,
    submitText: form.submitText,
    findings,
    recommendations: recommendationsFor(findings)
  };
}

function stableUrl(value: string | undefined): string | null {
  if (!value || value === "#") {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function labelStatus(form: ExtractedForm): FindingStatus {
  if (form.fields.length === 0) {
    return "fail";
  }

  const labeled = form.fields.filter((field) => Boolean(field.label?.trim())).length;
  if (labeled === form.fields.length) {
    return "pass";
  }

  return labeled > 0 ? "partial" : "fail";
}

function requiredFieldStatus(form: ExtractedForm): FindingStatus {
  if (form.fields.length === 0) {
    return "partial";
  }

  const hasRequired = form.fields.some((field) => field.required);
  if (hasRequired) {
    return "pass";
  }

  return includesAny(form.purpose, ["search", "subscribe"]) ? "partial" : "fail";
}

function sensitivityFor(form: ExtractedForm): FormOperabilityResult["sensitivity"] {
  const context = [
    form.purpose,
    form.submitText ?? "",
    form.action ?? "",
    form.fields.map((field) => `${field.name} ${field.type} ${field.label ?? ""}`).join(" ")
  ].join(" ");

  if (includesAny(context, ["payment", "purchase", "delete", "cancel", "refund", "billing", "checkout", "password"])) {
    return "high";
  }

  if (includesAny(context, ["demo", "sales", "quote", "contact", "support", "submit", "email", "phone"])) {
    return "medium";
  }

  return "low";
}

function scoreFindings(findings: readonly FormOperabilityFinding[]): number {
  const weights: Record<string, number> = {
    stable_action_url: 16,
    method: 10,
    field_names: 16,
    labels_or_placeholders: 14,
    required_fields: 12,
    submit_text: 10,
    inferred_purpose: 10,
    sensitivity: 6,
    human_confirmation: 6
  };

  return clamp(
    Math.round(
      findings.reduce((total, item) => {
        const weight = weights[item.id] ?? 0;
        const multiplier = item.status === "pass" ? 1 : item.status === "partial" ? 0.5 : 0;
        return total + weight * multiplier;
      }, 0)
    ),
    0,
    100
  );
}

function recommendationsFor(findings: readonly FormOperabilityFinding[]): string[] {
  const recommendations: string[] = [];
  const byId = new Map(findings.map((findingItem) => [findingItem.id, findingItem.status]));

  if (byId.get("stable_action_url") !== "pass") {
    recommendations.push("Declare an explicit stable HTTP(S) form action URL.");
  }
  if (byId.get("field_names") !== "pass") {
    recommendations.push("Give every user-editable field a durable name attribute.");
  }
  if (byId.get("labels_or_placeholders") !== "pass") {
    recommendations.push("Add labels, aria labels, or placeholders for every field.");
  }
  if (byId.get("required_fields") === "fail") {
    recommendations.push("Mark required fields with the required attribute.");
  }
  if (byId.get("submit_text") !== "pass") {
    recommendations.push("Use clear submit button text that describes the action.");
  }

  return recommendations;
}

function finding(id: string, status: FindingStatus, message: string): FormOperabilityFinding {
  return { id, status, message };
}
