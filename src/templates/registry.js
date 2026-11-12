export const DEFAULT_TEMPLATE_KEY = "ecommerce";

const TEMPLATE_KEY_PATTERN = /^[a-z][a-z0-9-]{0,63}$/;

export class TemplateResolutionError extends Error {
  constructor(code, templateKey = "") {
    super(code === "UNKNOWN_TEMPLATE" ? "La plantilla configurada no está registrada." : "La clave de plantilla configurada no es válida.");
    this.name = "TemplateResolutionError";
    this.code = code;
    this.templateKey = templateKey;
  }
}

const definitions = {
  ecommerce: Object.freeze({
    key: "ecommerce",
    label: "Ecommerce",
    load: () => import("./ecommerce/index.js"),
  }),
};

export const TEMPLATE_REGISTRY = Object.freeze(definitions);

function requestedTemplateKey(source) {
  if (source == null) return { present: false, value: null };
  if (typeof source === "string") return { present: true, value: source };
  if (typeof source !== "object") return { present: true, value: source };

  if (Object.hasOwn(source, "template_key")) {
    return source.template_key == null
      ? { present: false, value: null }
      : { present: true, value: source.template_key };
  }
  if (source.template && Object.hasOwn(source.template, "key")) {
    return source.template.key == null
      ? { present: false, value: null }
      : { present: true, value: source.template.key };
  }
  if (source.theme && Object.hasOwn(source.theme, "template_key")) {
    return source.theme.template_key == null
      ? { present: false, value: null }
      : { present: true, value: source.theme.template_key };
  }
  return { present: false, value: null };
}

export function normalizeTemplateKey(value) {
  if (typeof value !== "string") return "";
  const normalized = value.trim().toLowerCase();
  return TEMPLATE_KEY_PATTERN.test(normalized) ? normalized : "";
}

export function resolveTemplateKey(source) {
  const requested = requestedTemplateKey(source);
  if (!requested.present) return DEFAULT_TEMPLATE_KEY;

  const normalized = normalizeTemplateKey(requested.value);
  if (!normalized) throw new TemplateResolutionError("MALFORMED_TEMPLATE_KEY");
  if (!Object.hasOwn(TEMPLATE_REGISTRY, normalized)) {
    throw new TemplateResolutionError("UNKNOWN_TEMPLATE", normalized);
  }
  return normalized;
}

export function getTemplateDefinition(source) {
  return TEMPLATE_REGISTRY[resolveTemplateKey(source)];
}

export function listTemplates() {
  return Object.values(TEMPLATE_REGISTRY).map(({ key, label }) => ({ key, label }));
}

function reportTemplateError(error, logger) {
  if (!logger || typeof logger.error !== "function") return;
  logger.error("Template configuration error", {
    event: "template_configuration_error",
    code: error.code,
    ...(error.code === "UNKNOWN_TEMPLATE" ? { template_key: error.templateKey } : {}),
  });
}

export async function loadTemplate(source, { logger = console } = {}) {
  let definition;
  try {
    definition = getTemplateDefinition(source);
  } catch (error) {
    if (error instanceof TemplateResolutionError) reportTemplateError(error, logger);
    throw error;
  }
  const template = await definition.load();
  if (!template.Layout || !template.Page || !template.contentSchema) {
    throw new Error(`La plantilla registrada '${definition.key}' está incompleta.`);
  }
  return { ...template, definition };
}
