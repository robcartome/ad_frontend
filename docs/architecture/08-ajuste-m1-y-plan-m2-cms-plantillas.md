# 08. Ajuste M1 y plan de M2: integración CMS–plantillas

## 1. Alcance

Este documento audita la integración real entre la plantilla `ecommerce`, el CMS frontend y los modelos Django. En esta tarea solo se corrigió el fallback de plantillas en frontend. No se modificó Django ni se implementaron los slots propuestos para M2.

## 2. Resultado del ajuste M1

La resolución de plantillas queda definida así:

| Entrada | Resultado |
| --- | --- |
| `template_key` ausente o `null` | Usa `ecommerce` por compatibilidad. |
| `template_key=ecommerce` | Carga la plantilla registrada. |
| Clave sintácticamente válida pero no registrada | Lanza `UNKNOWN_TEMPLATE`; no renderiza otra plantilla. |
| Clave vacía, no string, ruta, URL u otro valor malformado | Lanza `MALFORMED_TEMPLATE_KEY`. |

`loadTemplate` registra un evento sanitizado antes de propagar el error. Para claves desconocidas solo registra la clave ya normalizada; para claves malformadas nunca registra el valor recibido. No se registran el objeto website, hostname, usuario, tokens ni contenido.

## 3. Auditoría del backend existente

### `Website`

- Es `OneToOne` con `Company`, apropiado para el MVP de un website por empresa.
- Contiene identidad estructural, locale, zona horaria, moneda y estado.
- No contiene todavía `template_key`.
- Es resuelto públicamente únicamente mediante un `WebsiteDomain` activo y verificado, perteneciente a una empresa activa y a un website publicado.

### `WebsiteSettings`

- Contiene marca y apariencia: colores, logo, favicon, tipografías, radio, footer, contacto, redes, mapa y SEO predeterminado.
- Valida fuentes, colores, ownership de medios y redes permitidas.
- No debe ser dueño de `template_key`: cambiar la plantilla altera la estructura y el contrato editorial del website, no solo su apariencia.

### `WebsitePage` y `WebsiteSection`

- La página soporta `HOME`, `STANDARD` y `CONTACT`.
- Tiene `draft_version`, `published_version`, estado y control de concurrencia.
- Las secciones tienen `section_type`, `schema_version`, `position`, `enabled` y `config` JSON.
- La sustitución de secciones es transaccional, exige posiciones consecutivas y una versión esperada.
- Django valida `section_type`, versión, tipos, límites, URLs y markup inseguro.

### Publicación, preview y revisiones

- `publish_page` crea un `WebsitePageRevision` inmutable con snapshot normalizado.
- El storefront lee la revisión indicada por `published_version`, no el draft mutable.
- El preview usa un token firmado ligado a `page_id`, `website_id` y `draft_version`, con expiración.
- La publicación dispara revalidación por tags de website, página y hostname.
- Las revisiones permiten construir rollback, pero actualmente no existe un servicio/endpoint que restaure una revisión al draft. Por tanto, rollback está modelado pero no implementado como operación de usuario.

### API y permisos

- Los endpoints CMS resuelven el website desde la empresa autenticada, no desde un `company_id` arbitrario del body.
- Catálogo, medios y productos validan pertenencia al website/empresa.
- El endpoint público resuelve hostname y no entrega `company_id`.
- La respuesta pública actual incluye tema, contacto, SEO, menús, versión y catálogo, pero no `template_key`.

## 4. Auditoría del frontend CMS

### `SectionEditor`

- Está acoplado a condicionales por `section_type`.
- Edita los cuatro bloques existentes y soporta habilitar, eliminar y reordenar.
- Usa URLs de imagen como texto; todavía no integra plenamente el selector de `WebsiteMedia`.
- Debe evolucionar a formularios declarados por schema, sin crear otro editor ni otro CMS.

### `BlockRenderer`

- Implementa `hero.v1`, `image_text.v1`, `benefits.v1` y `contact.v1`.
- Ignora de forma segura un renderer desconocido, pero no deja telemetría.
- Debe mantenerse como renderer de compatibilidad para revisiones ya publicadas.

### `contentSchema.js`

- Declara la plantilla, versión, page types, bloques compatibles y capacidades.
- Actualmente es descriptivo; no conduce los formularios del CMS ni tiene un equivalente autoritativo en Django.
- En M2 se convertirá en contrato frontend para presentación/formularios, mientras Django conserva la validación autoritativa.

## 5. Decisión sobre `template_key`

`template_key` debe pertenecer a `Website`.

Razones:

- Selecciona la estructura ejecutable del sitio completo.
- Debe ser independiente de colores/contacto de `WebsiteSettings`.
- Puede condicionar páginas, slots y capacidades.
- Debe cambiar con permisos de administración del website y auditoría explícita.
- En el futuro varias marcas de una empresa podrían tener websites con plantillas diferentes.

Propuesta Django futura:

```python
template_key = models.CharField(max_length=64, default="ecommerce")
template_schema_version = models.PositiveSmallIntegerField(default=1)
```

Django debe validar la clave contra una allowlist configurada y no aceptar rutas de módulo. El cambio de plantilla debe ejecutarse mediante una operación específica con validación de compatibilidad, no como un `PATCH` accidental junto a nombre o moneda.

## 6. Contrato de slots `ecommerce` propuesto

### Convenciones comunes

Cada sección conserva el contrato existente:

```json
{
  "section_type": "hero.v1",
  "schema_version": 1,
  "position": 0,
  "enabled": true,
  "config": {}
}
```

Para no romper datos publicados, `section_type` sigue siendo el identificador persistido. La plantilla mapea estos identificadores a slots conocidos. Los slots singleton solo pueden aparecer una vez por página HOME. `position` sigue existiendo para compatibilidad y para los grupos que admiten orden; la plantilla puede imponer un orden canónico al publicar.

Las referencias nuevas a imágenes deben usar `media_id` del mismo website y serializar su URL en el snapshot publicado. Se acepta `image_url` heredado mientras dure la migración.

### `hero.v1` — slot `home.hero`

- Campos: `eyebrow`, `title`, `subtitle`, `primary_cta`, `secondary_cta`, `media_id`, `image_url` heredado, `overlay`.
- Validaciones: título 1–120; subtítulo hasta 300; CTA label hasta 40; destino interno o HTTPS; overlay 0–80; media IMAGE del website.
- Defaults: título empresarial, CTA principal “Ver productos” a `/catalog`, overlay 35.
- Imagen: una imagen hero, recomendada 1920×800, WebP/AVIF/JPEG/PNG.
- Visibilidad: `enabled`; singleton y normalmente obligatorio para HOME publicada.
- Orden: primero; no reordenable fuera del modo legado.
- Versión: conservar `hero.v1` ampliando solo con campos opcionales compatibles; usar `hero.v2` si cambia un campo existente de forma incompatible.

### `categories.v1` — slot `home.categories`

- Campos: `title`, `subtitle`, `mode` (`automatic`/`manual`), `category_ids`, `limit`, `show_product_count`.
- Validaciones: categorías activas de la misma empresa con productos publicados; IDs únicos; límite 1–12.
- Defaults: título “Compra por categoría”, modo automático, límite 8.
- Imágenes: opcionalmente usa imagen pública de categoría; no acepta URLs libres nuevas.
- Visibilidad: opcional.
- Orden: posición canónica después de hero; las categorías manuales conservan el orden de `category_ids`.
- Versión: 1.

### `featured_products.v1` — slot `home.featured_products`

- Campos: `title`, `subtitle`, `mode` (`featured`/`manual`/`latest`), `product_ids`, `limit`, `cta_label`, `cta_url`.
- Validaciones: solo `WebsiteProduct` publicado del website; IDs únicos; límite 1–24; CTA interna o HTTPS.
- Defaults: título “Productos destacados”, modo `featured`, límite 8, CTA a `/catalog`.
- Imágenes: se toman de los productos; la sección no sube imágenes independientes.
- Visibilidad: opcional.
- Orden: canónico después de categorías; selección manual ordenada por `product_ids`.
- Versión: 1.

### `brands.v1` — slot `home.brands`

- Campos: `title`, `mode` (`automatic`/`manual`), `brand_ids`, `limit`, `display` (`logo`/`name`).
- Validaciones: marcas activas de la empresa con productos publicados; IDs únicos; límite 1–20.
- Defaults: título “Marcas que trabajamos”, automático, límite 12.
- Imágenes: logo de la marca validado; fallback textual.
- Visibilidad: opcional.
- Orden: canónico después de productos; manual conserva el orden de IDs.
- Versión: 1.

### `benefits.v1` — slot `home.benefits`

- Campos: `title`, `items[]` con `icon`, `title`, `text`.
- Validaciones: 1–6 items; títulos hasta 80; texto hasta 240; icono de allowlist.
- Defaults: conservar los actuales de `BLOCK_TYPES`.
- Imágenes: no; solo iconos registrados.
- Visibilidad: opcional.
- Orden: items ordenables; sección en posición canónica posterior a productos/marcas.
- Versión: mantener `benefits.v1` y ampliar solo con campos opcionales.

### `contact.v1` — slot `home.contact`

- Campos: `title`, `body`, `show_whatsapp`, `show_phone`, `show_email`, `show_address`, `show_hours`, `show_map`.
- Validaciones: no duplica datos de contacto; solo decide qué campos de `WebsiteSettings` mostrar.
- Defaults: conservar WhatsApp/teléfono/dirección activos; resto según datos disponibles.
- Imágenes: ninguna.
- Visibilidad: opcional.
- Orden: hacia el final de HOME.
- Versión: conservar `contact.v1`; los campos nuevos son opcionales.

### `whatsapp_cta.v1` — slot `home.whatsapp_cta`

- Campos: `title`, `body`, `button_label`, `prefilled_message`, `style`.
- Validaciones: requiere WhatsApp configurado en `WebsiteSettings`; textos limitados; `style` en allowlist. Nunca acepta un número alternativo dentro del bloque.
- Defaults: “¿Necesitas ayuda?”, botón “Escríbenos por WhatsApp”.
- Imágenes: fondo opcional mediante `media_id` del website.
- Visibilidad: opcional; si no hay teléfono válido el renderer no muestra el CTA y registra configuración incompleta.
- Orden: antes de contacto/footer.
- Versión: 1.

## 7. Compatibilidad con bloques existentes

| Bloque existente | Decisión |
| --- | --- |
| `hero.v1` | Se conserva y pasa a representar `home.hero`. Campos nuevos opcionales. |
| `benefits.v1` | Se conserva como `home.benefits`. |
| `contact.v1` | Se conserva como `home.contact`. |
| `image_text.v1` | Se conserva como bloque legacy y para páginas STANDARD. En HOME puede renderizarse durante transición, pero no forma parte del orden canónico nuevo. |

Las revisiones publicadas nunca se reescriben. `BlockRenderer` continúa renderizando sus snapshots. La migración solo afecta el draft siguiente y requiere publicación explícita.

## 8. Contratos API propuestos

### Resolución pública

Agregar campos no sensibles:

```json
{
  "website_id": "uuid",
  "template_key": "ecommerce",
  "template_schema_version": 1,
  "publication_version": 4,
  "theme": {},
  "contact": {},
  "catalog": {}
}
```

`template_key` debe ser siempre explícito cuando el backend actualizado esté desplegado. La compatibilidad con ausencia es temporal.

### Página pública

```json
{
  "template_key": "ecommerce",
  "template_schema_version": 1,
  "page": {
    "slug": "home",
    "page_type": "HOME",
    "published_version": 4
  },
  "sections": []
}
```

El backend devuelve solo el snapshot publicado, ordenado y validado contra la plantilla/version vigentes en el momento de publicar.

### CMS website

`GET /api/v1/websites/current/` debe incluir:

```json
{
  "id": "uuid",
  "template_key": "ecommerce",
  "template_schema_version": 1,
  "available_templates": [
    {"key": "ecommerce", "label": "Ecommerce", "schema_version": 1}
  ]
}
```

El listado puede venir de un endpoint de capacidades en lugar de repetirse, pero Django debe ser autoritativo sobre qué plantillas están habilitadas.

### Sustitución de secciones

Conservar concurrencia optimista y añadir contexto de plantilla:

```json
{
  "expected_version": 7,
  "template_key": "ecommerce",
  "template_schema_version": 1,
  "sections": []
}
```

Django rechaza:

- template distinto al website;
- tipo de sección no permitido por la plantilla/página;
- singleton duplicado;
- referencias a producto/categoría/marca/media de otra empresa;
- orden inválido;
- schema version no soportada.

### Cambio de plantilla

Proponer un endpoint explícito:

```http
POST /api/v1/websites/current/template/
```

```json
{
  "template_key": "ecommerce",
  "expected_updated_at": "ISO-8601"
}
```

Requiere permiso de administración del website, valida compatibilidad y crea/audita el cambio. No publica automáticamente ni destruye secciones.

### Rollback futuro

Proponer:

```http
POST /api/v1/websites/current/pages/{id}/revisions/{version}/restore/
```

Restaura el snapshot como un nuevo draft e incrementa `draft_version`; no cambia producción hasta publicar nuevamente. Nunca modifica la revisión histórica.

## 9. Componentes a reutilizar en M2

- `SectionEditor`: convertir a dispatcher de fields por schema.
- `BlockRenderer`: compatibilidad con revisiones antiguas.
- `BLOCK_TYPES` y `newBlock`: fuente transitoria de defaults; después adaptador hacia schemas de plantilla.
- Páginas CMS existentes de pages, media, settings, catalog y themes.
- `WebsiteMedia` y selector/biblioteca de medios.
- `StorefrontProductCard`, `ProductImage`, `ProductGallery` y catálogo server-side.
- `CartProvider`, `CartPageClient` y cotización WhatsApp.
- `getStorefrontPage`, `resolveWebsite`, `websiteService` y `storefrontService`.

## 10. Plan M2 incremental

1. **Contrato compartido documentado:** congelar nombres, versiones y payloads de los siete slots.
2. **Backend — plantilla:** añadir `template_key` y versión a `Website`, serializer CMS y manifest público, con migración default `ecommerce`.
3. **Backend — validación:** extender el registro de bloques con categorías/productos/marcas/WhatsApp y reglas de ownership; conservar validadores legacy.
4. **Backend — publicación:** validar compatibilidad de todas las secciones con plantilla/page type antes del snapshot.
5. **Frontend — schemas:** enriquecer `contentSchema.js` con fields/defaults/constraints sin duplicar la autoridad backend.
6. **Frontend — editor:** convertir `SectionEditor` en formularios por schema e integrar selectores scoped de media, categorías, productos y marcas.
7. **Frontend — renderers:** agregar renderers nuevos dentro de `templates/ecommerce`; mantener `BlockRenderer` legacy.
8. **Migración de draft:** ofrecer una acción explícita para crear slots faltantes a partir de contenido existente; no tocar revisiones publicadas.
9. **Preview/publicación:** probar tokens, invalidación y snapshots con ambas representaciones durante la transición.
10. **Rollback:** implementar restauración a draft como ticket independiente antes de prometer rollback en UI.

Cada paso debe tener pruebas backend/frontend y poder desplegarse sin obligar a migrar inmediatamente todos los websites.

## 11. Riesgos y pruebas necesarias

### Riesgos

- Drift entre schema frontend y validación Django.
- Cambiar plantilla dejando secciones incompatibles.
- Duplicar slots singleton.
- Referenciar media/productos de otra empresa mediante IDs pegados.
- Reescribir snapshots históricos durante una migración.
- Publicar un draft con template version distinta a la esperada.
- Ocultar una mala configuración con fallback silencioso; corregido en M1 para claves presentes.
- Errores de plantilla revelando payloads en logs; el logger M1 solo registra códigos y claves seguras.

### Pruebas mínimas

- Ausente/null, registrada, desconocida y malformada para `template_key`.
- Dos websites con plantillas/configuración independientes.
- Validación de cada slot, límites y campos desconocidos.
- Singleton duplicado y orden canónico.
- Media, producto, categoría y marca cruzados entre empresas.
- Draft invisible públicamente y preview ligado a website/version.
- Publicación atómica y revalidación con tags del tenant.
- Revisión antigua con los cuatro bloques legacy sigue renderizando.
- Restauración crea draft nuevo sin mutar revisión ni producción.
- Catálogo/carrito/WhatsApp permanecen scoped al website.
- Build de Next con carga estática de cada plantilla registrada.

## 12. Fuera de esta tarea

- Cambiar modelos o endpoints Django.
- Implementar los siete slots y su diseño visual.
- Modificar rutas, `(public)`, `/admin` o `/login`.
- Implementar M3, M4 o M5.
