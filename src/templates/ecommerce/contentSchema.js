function freezeDefinition(definition) {
  return Object.freeze({
    ...definition,
    defaults: Object.freeze(definition.defaults),
    fields: Object.freeze(definition.fields.map((field) => Object.freeze(field))),
  });
}

export const ECOMMERCE_SECTIONS = Object.freeze({
  "hero.v1": freezeDefinition({
    label: "Portada", slot: "home.hero", version: 1,
    defaults: { title: "Título principal", subtitle: "Describe tu propuesta", cta_label: "Ver más", cta_url: "/", image_url: "", overlay: 35 },
    fields: [
      { name: "title", label: "Título", type: "text", required: true, maxLength: 120 },
      { name: "subtitle", label: "Subtítulo", type: "textarea", maxLength: 300 },
      { name: "cta_label", label: "Texto del botón", type: "text", maxLength: 40 },
      { name: "cta_url", label: "Destino del botón", type: "url", maxLength: 1000 },
      { name: "image_url", label: "Imagen HTTPS", type: "url", maxLength: 1000, legacy: true },
      { name: "overlay", label: "Oscurecimiento (%)", type: "number", min: 0, max: 100 },
    ],
  }),
  "image_text.v1": freezeDefinition({
    label: "Imagen y texto", slot: "legacy.image_text", version: 1,
    defaults: { title: "Nuestra propuesta", body: "Agrega aquí el contenido de la sección.", image_url: "", alignment: "left" },
    fields: [
      { name: "title", label: "Título", type: "text", required: true, maxLength: 120 },
      { name: "body", label: "Contenido", type: "textarea", required: true, maxLength: 2000 },
      { name: "image_url", label: "Imagen HTTPS", type: "url", maxLength: 1000, legacy: true },
      { name: "alignment", label: "Posición de imagen", type: "select", options: [{ value: "left", label: "Izquierda" }, { value: "right", label: "Derecha" }] },
    ],
  }),
  "benefits.v1": freezeDefinition({
    label: "Beneficios", slot: "home.benefits", version: 1,
    defaults: { title: "¿Por qué elegirnos?", items: [{ title: "Atención confiable", text: "Estamos para ayudarte.", icon: "support" }] },
    fields: [
      { name: "title", label: "Título", type: "text", maxLength: 120 },
      { name: "items", label: "Beneficios", type: "benefit-list", maxItems: 6 },
    ],
  }),
  "contact.v1": freezeDefinition({
    label: "Contacto", slot: "home.contact", version: 1,
    defaults: { title: "Contáctanos", show_whatsapp: true, show_phone: true, show_address: true },
    fields: [
      { name: "title", label: "Título", type: "text", maxLength: 120 },
      { name: "show_whatsapp", label: "Mostrar WhatsApp", type: "checkbox" },
      { name: "show_phone", label: "Mostrar teléfono", type: "checkbox" },
      { name: "show_address", label: "Mostrar dirección", type: "checkbox" },
    ],
  }),
  "categories.v1": freezeDefinition({
    label: "Categorías", slot: "home.categories", version: 1,
    defaults: { title: "Compra por categoría", limit: 8 },
    fields: [{ name: "title", label: "Título", type: "text", maxLength: 120 }, { name: "limit", label: "Máximo", type: "number", min: 1, max: 24 }],
  }),
  "featured_products.v1": freezeDefinition({
    label: "Productos destacados", slot: "home.featured_products", version: 1,
    defaults: { title: "Productos destacados", limit: 8 },
    fields: [{ name: "title", label: "Título", type: "text", maxLength: 120 }, { name: "limit", label: "Máximo", type: "number", min: 1, max: 24 }],
  }),
  "brands.v1": freezeDefinition({
    label: "Marcas", slot: "home.brands", version: 1,
    defaults: { title: "Marcas que trabajamos", limit: 12 },
    fields: [{ name: "title", label: "Título", type: "text", maxLength: 120 }, { name: "limit", label: "Máximo", type: "number", min: 1, max: 24 }],
  }),
  "whatsapp_cta.v1": freezeDefinition({
    label: "WhatsApp", slot: "home.whatsapp_cta", version: 1,
    defaults: { title: "¿Necesitas ayuda?", body: "Escríbenos para solicitar una cotización.", button_label: "Escríbenos" },
    fields: [{ name: "title", label: "Título", type: "text", required: true, maxLength: 120 }, { name: "body", label: "Texto", type: "textarea", maxLength: 300 }, { name: "button_label", label: "Botón", type: "text", maxLength: 40 }],
  }),
});

const contentSchema = Object.freeze({
  key: "ecommerce",
  version: 1,
  pageTypes: Object.freeze(["HOME", "STANDARD", "CONTACT"]),
  blocks: Object.freeze(Object.keys(ECOMMERCE_SECTIONS)),
  sections: ECOMMERCE_SECTIONS,
  capabilities: Object.freeze({ catalog: true, productDetail: true, cart: true, whatsappQuote: true, onlinePayments: false }),
});

export function getEcommerceSectionDefinition(sectionType) {
  return ECOMMERCE_SECTIONS[sectionType] || null;
}

export default contentSchema;
