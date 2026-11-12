import test from "node:test";
import assert from "node:assert/strict";

import { DEFAULT_TEMPLATE_KEY, TEMPLATE_REGISTRY, TemplateResolutionError, getTemplateDefinition, listTemplates, loadTemplate, normalizeTemplateKey, resolveTemplateKey } from "../../src/templates/registry.js";
import contentSchema from "../../src/templates/ecommerce/contentSchema.js";

test("ecommerce es la plantilla predeterminada y está registrada", () => {
  assert.equal(DEFAULT_TEMPLATE_KEY, "ecommerce");
  assert.equal(resolveTemplateKey(), "ecommerce");
  assert.equal(resolveTemplateKey(null), "ecommerce");
  assert.equal(resolveTemplateKey({}), "ecommerce");
  assert.equal(resolveTemplateKey({ template_key: null }), "ecommerce");
  assert.deepEqual(listTemplates(), [{ key: "ecommerce", label: "Ecommerce" }]);
  assert.equal(getTemplateDefinition("ecommerce"), TEMPLATE_REGISTRY.ecommerce);
});

test("template_key se resuelve desde el contrato público conocido", () => {
  assert.equal(resolveTemplateKey({ template_key: "ECOMMERCE" }), "ecommerce");
  assert.equal(resolveTemplateKey({ template: { key: " ecommerce " } }), "ecommerce");
  assert.equal(resolveTemplateKey({ theme: { template_key: "ecommerce" } }), "ecommerce");
});

test("una clave desconocida no usa silenciosamente la plantilla predeterminada", () => {
  assert.throws(
    () => resolveTemplateKey("corporate"),
    (error) => error instanceof TemplateResolutionError && error.code === "UNKNOWN_TEMPLATE" && error.templateKey === "corporate",
  );
});

test("claves malformadas o peligrosas se rechazan de forma controlada", () => {
  assert.equal(normalizeTemplateKey("../../custom"), "");
  assert.equal(normalizeTemplateKey("corporate"), "corporate");
  for (const source of ["", "../../custom", { template_key: "https://evil.example/x" }, { template_key: 42 }]) {
    assert.throws(
      () => resolveTemplateKey(source),
      (error) => error instanceof TemplateResolutionError && error.code === "MALFORMED_TEMPLATE_KEY" && error.templateKey === "",
    );
  }
});

test("la carga registra errores sanitizados sin intentar importar otra plantilla", async () => {
  const entries = [];
  const logger = { error: (...args) => entries.push(args) };

  await assert.rejects(
    loadTemplate({ template_key: "corporate" }, { logger }),
    (error) => error.code === "UNKNOWN_TEMPLATE",
  );
  await assert.rejects(
    loadTemplate({ template_key: "../../secret" }, { logger }),
    (error) => error.code === "MALFORMED_TEMPLATE_KEY",
  );

  assert.deepEqual(entries, [
    ["Template configuration error", { event: "template_configuration_error", code: "UNKNOWN_TEMPLATE", template_key: "corporate" }],
    ["Template configuration error", { event: "template_configuration_error", code: "MALFORMED_TEMPLATE_KEY" }],
  ]);
});

test("el contrato ecommerce declara las capacidades ya implementadas", () => {
  assert.equal(contentSchema.key, "ecommerce");
  assert.equal(contentSchema.capabilities.catalog, true);
  assert.equal(contentSchema.capabilities.cart, true);
  assert.equal(contentSchema.capabilities.whatsappQuote, true);
  assert.equal(contentSchema.capabilities.onlinePayments, false);
  assert.ok(contentSchema.blocks.includes("hero.v1"));
});
