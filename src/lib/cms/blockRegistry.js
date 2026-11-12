import { ECOMMERCE_SECTIONS } from "../../templates/ecommerce/contentSchema.js";

export const BLOCK_TYPES = Object.freeze(Object.fromEntries(
  Object.entries(ECOMMERCE_SECTIONS).map(([sectionType, definition]) => [
    sectionType,
    Object.freeze({ label: definition.label, defaults: definition.defaults }),
  ]),
));

export function newBlock(sectionType) {
  const definition = ECOMMERCE_SECTIONS[sectionType];
  if (!definition) throw new Error("Tipo de bloque no soportado");
  return { section_type: sectionType, schema_version: definition.version, enabled: true, config: structuredClone(definition.defaults) };
}
