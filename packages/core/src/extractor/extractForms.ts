import type { CheerioAPI } from "cheerio";

import type { ExtractedForm, ExtractedFormField } from "../schemas.js";
import { cleanText, includesAny, normalizeWhitespace, slugify } from "../utils/text.js";
import { normalizeUrl } from "../utils/urls.js";

const LEAD_KEYWORDS = ["contact", "sales", "demo", "quote", "trial", "support", "request"];
const SEARCH_KEYWORDS = ["search", "query", "docs"];
type CheerioElement = Parameters<CheerioAPI>[0];

export function extractForms($: CheerioAPI, sourceUrl: string): ExtractedForm[] {
  const forms: ExtractedForm[] = [];

  $("form").each((index, element) => {
    const form = $(element);
    const rawAction = cleanText(form.attr("action"));
    const normalizedAction = rawAction ? normalizeUrl(rawAction, sourceUrl) : null;
    const method = normalizeMethod(form.attr("method"));
    const fields = extractFormFields($, element);
    const submitText = extractSubmitText($, element);
    const purpose = inferFormPurpose($, element, normalizedAction ?? rawAction, submitText, fields);
    const idSeed = `${purpose}-${normalizedAction ?? sourceUrl}-${index}`;

    forms.push({
      id: slugify(idSeed),
      action: (normalizedAction ?? rawAction) || undefined,
      method,
      purpose,
      fields,
      submitText: submitText || undefined,
      sourceUrl
    });
  });

  return forms;
}

export function inferFormPurpose(
  $: CheerioAPI,
  element: CheerioElement,
  action: string | undefined,
  submitText: string,
  fields: readonly ExtractedFormField[]
): string {
  const form = $(element);
  const context = [
    submitText,
    action ?? "",
    form.attr("aria-label") ?? "",
    form.closest("section, main, article, div").find("h1,h2,h3,legend").first().text(),
    fields.map((field) => `${field.name} ${field.label ?? ""}`).join(" ")
  ].join(" ");

  if (includesAny(context, ["book", "demo", "schedule"])) {
    return "book demo";
  }
  if (includesAny(context, ["quote", "proposal"])) {
    return "request quote";
  }
  if (includesAny(context, ["support", "help"])) {
    return "request support";
  }
  if (includesAny(context, ["sales", "contact", "talk to us"])) {
    return "contact sales";
  }
  if (includesAny(context, SEARCH_KEYWORDS)) {
    return "search docs";
  }
  if (includesAny(context, ["newsletter", "subscribe"])) {
    return "subscribe";
  }
  if (includesAny(context, LEAD_KEYWORDS)) {
    return "lead capture";
  }

  return "unknown form";
}

function extractFormFields($: CheerioAPI, element: CheerioElement): ExtractedFormField[] {
  const fields: ExtractedFormField[] = [];

  $(element)
    .find("input, textarea, select")
    .each((_, fieldElement) => {
      const field = $(fieldElement);
      const tagName = fieldElement.tagName.toLowerCase();
      const type = (field.attr("type") ?? tagName).toLowerCase();

      if (["button", "hidden", "image", "reset", "submit"].includes(type)) {
        return;
      }

      const name = cleanText(field.attr("name") ?? field.attr("id"));
      if (!name) {
        return;
      }

      fields.push({
        name,
        type: tagName === "select" || tagName === "textarea" ? tagName : type,
        label: findFieldLabel($, fieldElement) || undefined,
        required: field.is("[required]") || undefined
      });
    });

  return fields;
}

function findFieldLabel($: CheerioAPI, element: CheerioElement): string {
  const field = $(element);
  const id = field.attr("id");
  const explicit = id ? cleanText($(`label[for="${cssEscape(id)}"]`).first().text()) : "";
  if (explicit) {
    return explicit;
  }

  const wrapping = cleanText(field.closest("label").text());
  if (wrapping) {
    return wrapping;
  }

  return cleanText(field.attr("aria-label") ?? field.attr("placeholder"));
}

function extractSubmitText($: CheerioAPI, element: CheerioElement): string {
  const submit = $(element).find('button, input[type="submit"], input[type="button"]').first();
  return normalizeWhitespace(submit.text() || submit.attr("value") || "");
}

function normalizeMethod(method: string | undefined): "GET" | "POST" | undefined {
  const upper = method?.trim().toUpperCase();
  if (upper === "POST") {
    return "POST";
  }

  if (upper === "GET" || !upper) {
    return "GET";
  }

  return undefined;
}

function cssEscape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
