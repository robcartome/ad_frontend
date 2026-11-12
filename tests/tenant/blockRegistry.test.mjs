import assert from "node:assert/strict";
import test from "node:test";

import { BLOCK_TYPES, newBlock } from "../../src/lib/cms/blockRegistry.js";
import contentSchema, { getEcommerceSectionDefinition } from "../../src/templates/ecommerce/contentSchema.js";

test("CMS exposes only versioned, allowlisted block types", () => {
  assert.deepEqual(Object.keys(BLOCK_TYPES), ["hero.v1", "image_text.v1", "benefits.v1", "contact.v1", "categories.v1", "featured_products.v1", "brands.v1", "whatsapp_cta.v1"]);
  assert.throws(() => newBlock("html.v1"), /no soportado/);
});

test("new blocks do not share mutable defaults", () => {
  const first = newBlock("hero.v1");
  const second = newBlock("hero.v1");
  first.config.title = "Cambio";
  assert.equal(second.config.title, "Título principal");
  assert.equal(first.schema_version, 1);
  assert.equal(first.enabled, true);
});

test("CMS and ecommerce template share one section contract", () => {
  assert.deepEqual(Object.keys(BLOCK_TYPES), contentSchema.blocks);
  assert.equal(getEcommerceSectionDefinition("hero.v1").slot, "home.hero");
  assert.equal(getEcommerceSectionDefinition("contact.v1").fields.at(-1).name, "show_address");
  assert.equal(getEcommerceSectionDefinition("html.v1"), null);
});
