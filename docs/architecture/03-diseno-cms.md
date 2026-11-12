# 03. CMS de contenido para temas en código

## Alcance revisado

`/admin/website/` no será un page builder libre. El diseño se desarrolla en Next.js y el CMS actualiza únicamente el contenido y las opciones declaradas por ese diseño.

Son editables títulos, textos, botones, imágenes, banners, beneficios, contacto, menús, redes, SEO y productos destacados. No son editables desde el CMS la estructura React, CSS/JavaScript, HTML libre o componentes no registrados.

## Modelo reutilizado

- `Website` y `WebsiteDomain`: identidad, estado y dominio.
- `WebsiteSettings`: marca, contacto y configuración.
- `WebsitePage`: página, SEO y workflow.
- `WebsiteSection`: contenido de un slot conocido, no layout arbitrario.
- `WebsitePageRevision`: snapshot y rollback.
- `WebsiteMedia`: imágenes scoped.
- `WebsiteMenu`: navegación.
- `WebsiteCatalogSettings` y `WebsiteProduct`: ecommerce.

Se añade o consolida `theme_key`. La allowlist y los componentes viven en Next.js.

## Contrato de tema

| Slot | Campos editables | Regla de diseño |
| --- | --- | --- |
| `home.hero.v1` | etiqueta, título, texto, imagen, CTA | composición fija en React |
| `home.benefits.v1` | icono, título y texto | máximo definido por tema |
| `home.featured_products.v1` | título, modo o productos | tarjetas existentes |
| `home.brand_story.v1` | título, texto e imagen | responsive en código |
| `global.contact.v1` | teléfono, WhatsApp, correo, dirección | compartido con footer |

Django valida tipos, límites, URLs y ownership. Next.js omite de forma segura un slot desconocido. La base de datos nunca decide qué módulo importar.

## Flujo editorial

1. El editor abre una página del tema.
2. El panel genera formularios según el schema.
3. Django valida empresa, permisos y contrato.
4. El draft se previsualiza con `no-store` y token corto.
5. Un publicador crea una revisión atómica.
6. Se revalidan tags del website/página.
7. El público recibe solo lo publicado.

## Panel

```text
/admin/website/dashboard
/admin/website/content/home
/admin/website/pages
/admin/website/media
/admin/website/menus
/admin/website/products
/admin/website/theme
/admin/website/seo
/admin/website/domains
/admin/website/settings
```

El dashboard toma como referencia funcional los ERPs ecommerce: preview, dominio, publicación y accesos rápidos. Reutiliza el layout existente. No replica una plantilla de terceros ni muestra ventas/pedidos hasta tener modelos confiables.

## Preview y medios

- Preview desktop/tablet/móvil en origen controlado o pestaña firmada.
- Draft privado y no indexable.
- Medios filtrados por website/empresa.
- Alt text y dimensiones sugeridas por slot.
- Sin `dangerouslySetInnerHTML` salvo contenido sanitizado con allowlist.

## Permisos

- `read.website`
- `manage.website`
- `publish.website`
- `manage.website.domains`
- `manage.website.media`
- `manage.website.products`
- `read.website.orders`
- `manage.website.orders`

Django impone permisos y scope. Un editor modifica drafts; un publicador activa revisiones.

## Migración

1. Crear `demo-v1`.
2. Mapear bloques publicados a slots.
3. Revisar contenido faltante en preview.
4. Publicar una revisión nueva.
5. Mantener rollback al renderer anterior durante el corte.
6. Retirar composición libre en websites migrados.

## Fuera del MVP

- Constructor tipo Elementor.
- HTML, CSS o JavaScript libre.
- Marketplace de temas/plugins.
- Colaboración en tiempo real y A/B testing.
- Pedidos, pagos y fulfillment hasta implementar su dominio transaccional.
