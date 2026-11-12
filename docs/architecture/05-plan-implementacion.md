# 05. Plan de implementación revisado

## Cambio de dirección

El objetivo ya no es entregar un constructor genérico de páginas por bloques. APUDIG debe entregar a cada empresa una web y un ecommerce personalizados, diseñados y desarrollados en código con Next.js. Desde el panel administrativo se editan el contenido, las imágenes y la configuración que el diseño permite, pero no la estructura libre de la página ni código HTML/CSS/JavaScript.

```text
https://www.demo.com/          -> web pública de la empresa
https://www.demo.com/catalog   -> catálogo/ecommerce
https://www.demo.com/admin     -> administración APUDIG de esa empresa
https://www.demo.com/login     -> acceso administrativo en el mismo dominio
```

La arquitectura se define como **code-first + content-managed**:

- Next.js controla diseño, componentes, responsive, accesibilidad y experiencia de compra.
- Django controla empresa, dominio, permisos, textos, medios, SEO, publicación, productos, precios y stock.
- Cada tema en código expone un contrato de campos editables. El administrador modifica esos campos sin poder romper el diseño.
- El dominio identifica el website, pero nunca autoriza por sí solo al usuario.

## Estado de lo ya construido

| Base existente | Estado | Decisión |
| --- | --- | --- |
| Aislamiento de catálogo por empresa | Implementado | Conservar. |
| `Website`, dominios y resolución por hostname | Implementado | Conservar y endurecer para dominios propios. |
| Páginas, secciones, borradores y revisiones | Implementado | Reutilizar como almacenamiento de contenido, no como constructor libre. |
| Configuración, menús, medios y SEO | Implementado | Conservar. |
| Publicación de productos, precio y stock | Implementado | Conservar. |
| Carrito, cotización y WhatsApp | Implementado | Conservar. |
| Renderizador genérico de bloques | Implementado parcialmente | Mantener solo como compatibilidad transitoria. |
| `/admin` en un dominio público | No alineado: hoy redirige al host central | Cambiar para administrar en el mismo dominio. |
| Dashboard integral de ecommerce | Pendiente | Crear sobre el panel existente. |
| Pedidos, clientes y analítica comercial | Pendiente | Fase posterior; el carrito actual no persiste pedidos. |

Las fases 0 a 5 anteriores produjeron una base válida. El cambio de dirección no exige desecharla; exige cambiar la presentación, el contrato editorial y el enrutamiento administrativo.

## Principios

- Un website por empresa en el MVP.
- Ningún texto, imagen o dato comercial específico queda hardcodeado.
- El tema define qué se edita; el contenido no define componentes arbitrarios.
- Draft, preview, publicación y revisiones siguen siendo obligatorios.
- Toda consulta queda scoped por `website` y `company`.
- No exponer `/admin` en un dominio personalizado sin validar autenticación y pertenencia empresa-dominio.
- Conservar `app/(admin)/admin`; los route groups organizan código y no forman parte de la URL.
- Mantener la ruta interna `(storefront)/sites/[hostname]` evita colisiones con las rutas heredadas de `(public)`.

## Fase R0 — Inventario y diseño del primer sitio

**Objetivo:** definir la web real que se desarrollará, no un tema abstracto.

**Entregables:** mapa de páginas, wireframes, identidad visual, inventario de textos/imágenes, estados responsive, navegación y contrato de contenido por sección.

**Criterio:** diseño aprobado de inicio, catálogo, producto, contacto, cabecera y pie; cada dato editable identificado.

## Fase R1 — Temas personalizados en Next.js

**Objetivo:** construir el primer diseño como componentes seleccionables por website.

```text
src/
├── themes/
│   └── demo-v1/
│       ├── HomePage.jsx
│       ├── CatalogPage.jsx
│       ├── ProductPage.jsx
│       ├── components/
│       └── contentSchema.js
├── lib/themes/themeRegistry.js
└── app/(storefront)/sites/[hostname]/...
```

`themeRegistry` resuelve `theme_key=demo-v1` a componentes conocidos. La base de datos no puede indicar módulos ejecutables.

**Criterios:** diseño responsive y accesible; fallback seguro; sin datos empresariales hardcodeados; compatibilidad temporal con el renderer anterior.

## Fase R2 — Contrato editorial y adaptación de Django

**Objetivo:** transformar el CMS por bloques en un gestor de contenido para el tema.

Se reutilizan `WebsitePage`, `WebsiteSection`, `WebsiteMedia` y revisiones. Cada sección pasa a representar un **slot conocido**, por ejemplo `home.hero`, `home.benefits` o `home.featured_products`; su posición y renderer los decide el código.

```text
home.hero:
  eyebrow, title, description, image, primary_cta, secondary_cta
```

**Backend:** añadir o confirmar `theme_key`, validar slots por tema, impedir duplicados, mantener snapshots y devolver un payload normalizado.

**Criterios:** el editor cambia textos e imágenes, pero no inserta scripts, HTML libre o secciones incompatibles; el draft no altera producción y existe rollback.

## Fase R3 — Administración en el mismo dominio

**Objetivo:** atender `www.demo.com/admin` y `www.demo.com/login` en el dominio empresarial.

**Enrutamiento:** `src/proxy.js` deja pasar `/admin`, `/login`, assets y APIs necesarios; las demás rutas se reescriben al storefront interno.

**Seguridad:** Django valida que el usuario tenga acceso a la empresa del dominio. Como objetivo, usar un BFF de Next.js y cookies `HttpOnly`, `Secure` y host-only, sin compartir cookies entre dominios de clientes.

**Criterios:** A no administra B aunque cambie URL, ID o hostname; dominio desconocido falla cerrado; `/admin` exige sesión; pruebas E2E cubren dos empresas.

## Fase R4 — Dashboard y editor de contenido

**Objetivo:** una administración ecommerce organizada sobre el panel existente.

- estado del sitio, dominio y publicación;
- preview y acceso a “Ver sitio”;
- accesos a inicio, imágenes, menús, productos, SEO y configuración;
- formularios para slots del tema;
- selector de medios scoped;
- preview desktop/tablet/móvil y publicación explícita;
- catálogo, carrito y WhatsApp existentes.

No se mostrarán cifras ficticias de pedidos, clientes, devoluciones o ventas. Esas tarjetas se habilitan cuando existan `WebOrder`, estados y analítica confiable.

## Fase R5 — Ecommerce y migración de la web heredada

**Objetivo:** integrar el tema con catálogo, producto, búsqueda, carrito y cotización, y retirar hardcodes públicos.

`app/(public)` contiene una experiencia heredada específica. No debe ser la fuente multiempresa ni duplicar `/` con otra route group. Se reservará para una portada institucional de APUDIG o se retirará tras migrar al storefront por hostname.

**Criterios:** todas las páginas usan el website resuelto; carrito y caché nunca cruzan empresas; precios se revalidan en Django; SEO corresponde al dominio primario.

## Fase R6 — Dominio, endurecimiento y salida

Incluye verificación DNS/TXT, hosting, TLS, canonical/aliases, CSP, rate limits, observabilidad, backups, runbook, Lighthouse/axe y E2E.

## Fase R7 — Pedidos y analítica (posterior)

Requiere `WebOrder` o integración explícita con órdenes de venta, idempotencia, snapshots de precio/impuesto, revalidación/reserva de stock y auditoría. No se simula con el carrito local o WhatsApp.

## Orden recomendado

1. Aprobar diseño e inventario del sitio piloto (R0).
2. Implementar `themeRegistry` y `demo-v1` (R1).
3. Restringir el CMS existente a slots (R2).
4. Implementar juntos routing y seguridad del admin en el mismo dominio (R3).
5. Construir dashboard/editor y preview (R4).
6. Integrar ecommerce y migrar hardcodes (R5).
7. Activar dominio real y endurecer (R6).
8. Incorporar pedidos y analítica (R7).

## Primer ticket revisado

**Título:** `feat(storefront): crear tema code-first demo-v1 y contrato de contenido editable`.

1. Crear `themeRegistry` con allowlist.
2. Crear `themes/demo-v1` para inicio, header y footer.
3. Definir slots editables y mapear datos publicados existentes.
4. Añadir `theme_key` al contrato backend si falta y validarlo.
5. Renderizar el tema por hostname con fallback seguro.
6. Probar tema, contenido faltante y aislamiento de dos websites.

No incluye cambiar todavía `/admin` en producción. Eso se implementa en R3 junto con la validación sesión-empresa-dominio, evitando abrir una superficie administrativa incompleta.
