# 07. Auditoría y propuesta consolidada: `(public)`, plantillas y administración por dominio

## 1. Alcance y conclusión

Esta auditoría contrasta el repositorio real, el plan revisado y el nuevo objetivo. No modifica código, rutas, dependencias ni backend.

**Conclusión:** sí conviene retirar el route group `(storefront)` y consolidar todas las páginas públicas multiempresa dentro de `(public)`, porque el proyecto todavía está en desarrollo y `(storefront)` no aporta una URL, seguridad o capacidad técnica adicional. La migración debe conservar temporalmente la ruta interna `/sites/[hostname]`, ya que `proxy.js` la usa para resolver el dominio sin mostrarla al visitante.

La estructura objetivo será:

- `(public)`: toda experiencia pública por dominio.
- `(admin)/admin`: ERP y administración del website.
- `login`: autenticación contextual al dominio.
- `templates`: diseños code-first (`ecommerce`, `corporate` y personalizados).
- Django: tenant, contenido, permisos, catálogo y publicación.

Esto no significa que la URL incluya `(public)` o `/sites`: los route groups no forman parte de la URL y el rewrite conserva `demo.com/` en el navegador.

## 2. Verificaciones del repositorio

- Repositorio auditado: `ad_frontend`.
- Rama activa: `mvp_production`.
- Stack real: Next.js `^16.0.10`, React `19.1.0`, JavaScript/JSX y App Router.
- Existe `src/proxy.js`; es la convención correcta para Next.js 16.
- `eslint-config-next` permanece en `15.5.4`, distinto de Next 16; es un riesgo de tooling, pero actualizar dependencias está fuera de esta etapa.
- El worktree contiene numerosos cambios staged, unstaged y archivos nuevos de las fases multiempresa/CMS. No deben descartarse ni sobrescribirse.
- No existe una segunda aplicación frontend activa en la raíz del workspace; el proyecto está en `ad_frontend`.

## 3. Estado real de las funcionalidades

### Implementado o avanzado

- ERP bajo `src/app/(admin)/admin` con layout administrativo compartido.
- Login bajo `src/app/login` con selección de empresa y contexto de autenticación.
- Web pública heredada bajo `(public)`.
- Resolución y normalización de hostname.
- Proxy multiempresa y rewrite a `/sites/[hostname]`.
- Storefront server-rendered con metadata, canonical, sitemap y robots.
- CMS con dashboard, páginas, banners, medios, menús, temas, SEO, settings y catálogo.
- Renderer de bloques, borradores/publicación y contratos de website.
- Catálogo multiempresa, detalle de producto, imágenes y paginación.
- Carrito scoped por website y cotización por WhatsApp.
- Pruebas de tenant, routing, bloques y carrito.

### Parcial o no alineado

- `(public)/layout.js` y `(public)/page.js` contienen nombre, colores, textos y año de Mega Ferretero Tolentino.
- `(public)/catalog` usa el catálogo heredado client-side y componentes administrativos.
- El diseño CMS actual está orientado a bloques genéricos; debe evolucionar a slots de plantillas en código.
- En dominios de empresa, `/admin` y `/login` se redirigen actualmente a un host central.
- La sesión actual selecciona empresa después del login; todavía no valida de forma integral la relación hostname–website–empresa–usuario.
- No existe aún un registry de plantillas `ecommerce`, `corporate` y personalizadas.
- No existen pedidos ecommerce persistentes, pagos ni métricas confiables de ventas/clientes.

## 4. Evaluación de `(storefront)` frente a `(public)`

### Qué hace hoy `(storefront)`

Contiene la implementación pública nueva:

```text
(storefront)/sites/[hostname]/
├── layout.js
├── [[...slug]]/page.js
├── catalog/page.js
├── productos/[slug]/page.js
├── cart/page.js
├── robots.txt/route.js
└── sitemap.xml/route.js
```

El nombre `(storefront)` no se ve en la URL. Su única función es agrupar archivos y aplicar layouts.

### Problema de mantener dos superficies públicas

Actualmente hay dos implementaciones que compiten conceptualmente:

- `(public)`: home y catálogo heredados, hardcodeados.
- `(storefront)`: web multiempresa nueva.

Esto crea duplicación de layouts, componentes de catálogo y decisiones sobre cuál es la web oficial. Como todavía no hay producción, mantener ambas superficies no ofrece una ventaja de compatibilidad suficiente.

### Recomendación

Consolidar el contenido de `(storefront)/sites/[hostname]` en:

```text
(public)/sites/[hostname]
```

La ruta interna `/sites/[hostname]` se conserva inicialmente. Solo cambia el route group propietario del código.

Antes de moverla se debe reemplazar el layout hardcodeado de `(public)`. Si se mueve sin hacerlo, el sitio tendría el header/footer heredado y el header/footer multiempresa al mismo tiempo.

## 5. Árbol actual versus propuesto

### Actual

```text
src/app/
├── (admin)/
│   └── admin/...
├── (public)/
│   ├── layout.js                 # hardcode Tolentino
│   ├── page.js                   # home heredado
│   └── catalog/page.js           # catálogo heredado
├── (storefront)/
│   └── sites/[hostname]/...      # web multiempresa real
├── login/page.js
├── api/...
├── layout.js
└── globals.css
```

### Propuesto

```text
src/
├── app/
│   ├── (admin)/
│   │   └── admin/...
│   ├── (public)/
│   │   ├── sites/
│   │   │   └── [hostname]/
│   │   │       ├── layout.js
│   │   │       ├── [[...slug]]/page.js
│   │   │       ├── catalog/page.js
│   │   │       ├── productos/[slug]/page.js
│   │   │       ├── cart/page.js
│   │   │       ├── robots.txt/route.js
│   │   │       └── sitemap.xml/route.js
│   │   └── layout.js             # neutro, sin marca empresarial
│   ├── login/page.js
│   ├── api/...
│   ├── layout.js
│   └── globals.css
├── templates/
│   ├── registry.js
│   ├── ecommerce/
│   │   ├── EcommerceTemplate.jsx
│   │   ├── pages/
│   │   ├── sections/
│   │   └── contentSchema.js
│   ├── corporate/                # preparado, no implementado aún
│   └── custom/                   # solo cuando exista un caso real
├── components/
│   ├── ui/
│   ├── storefront/               # negocio público compartido
│   ├── website/                  # edición CMS
│   ├── layout/                   # ERP/admin
│   └── admin/
├── lib/
│   ├── tenant/
│   ├── cms/
│   └── cart/
└── services/
```

No se recomienda crear rutas públicas directamente como `(public)/page.js` para el website multiempresa. El App Router necesita una ruta interna distinta a la URL visible para transportar el hostname resuelto por Proxy; `/sites/[hostname]` ya cumple esa función y está probada.

## 6. Arquitectura de plantillas

### Registry estático

`templates/registry.js` tendrá una allowlist de plantillas conocidas:

```text
ecommerce -> componentes y schema ecommerce
corporate -> componentes y schema corporate
custom-*  -> plantilla específica registrada en código
```

Django entrega `template_key`; nunca entrega una ruta de importación o código ejecutable. Si la clave es inválida, el storefront falla de forma segura o usa una plantilla de fallback expresamente configurada.

### Plantilla `ecommerce`

Primera implementación. Debe incluir:

- home comercial original;
- hero, categorías, productos destacados, beneficios, marcas y contacto;
- catálogo con búsqueda y filtros server-side;
- ficha de producto;
- carrito por website;
- pedido/cotización por WhatsApp;
- estados vacíos, error y carga;
- diseño mobile-first inspirado funcionalmente, no copiado, de grandes retailers.

### Plantilla `corporate`

Se registra conceptualmente, pero no se implementa todavía. Su contrato futuro contempla servicios, proyectos, portafolio, nosotros, contacto y solicitud de cotización.

### Plantillas personalizadas

Una plantilla radicalmente distinta se crea como un módulo nuevo dentro de `templates/` y reutiliza UI/negocio compartido. No duplica la aplicación, servicios de tenant, carrito, autenticación ni CMS.

## 7. Integración con el CMS existente

No se crearán dos CMS. Los modelos y pantallas actuales se reutilizan con un cambio conceptual:

- `WebsiteSection` representa contenido para un slot permitido de la plantilla.
- La plantilla decide orden, layout y renderer.
- El CMS genera formularios de acuerdo con `contentSchema.js` y el contrato validado por Django.
- Textos, imágenes, menús, colores, redes y SEO siguen siendo configuración.
- Nuevos layouts y experiencias siguen siendo código.

Durante la migración, `BlockRenderer` puede permanecer como compatibilidad para websites antiguos. La plantilla `ecommerce` nueva no debe depender de que el administrador componga libremente la página.

## 8. `demo.com` y `demo.com/admin`

### Público

```text
demo.com/                  -> rewrite interno /sites/demo.com
demo.com/catalog           -> /sites/demo.com/catalog
demo.com/productos/x       -> /sites/demo.com/productos/x
demo.com/cart              -> /sites/demo.com/cart
```

### Administración

```text
demo.com/login             -> login contextual
demo.com/admin             -> ERP/CMS de la empresa del dominio
```

Para lograrlo, Proxy debe dejar pasar `/login` y `/admin` en vez de redirigirlos. Sin embargo, el cambio solo es aceptable cuando la aplicación valide que el usuario autenticado tiene acceso a la empresa asociada al dominio.

La administración central puede mantenerse también en `admin.apudig.com` o el host de control configurado. Ambas entradas reutilizan el mismo `(admin)/admin`; cambia la forma de resolver el contexto:

- dominio empresarial: empresa fijada por hostname;
- dominio central: selección explícita entre empresas autorizadas.

## 9. Autenticación y aislamiento

El `company_id` del navegador no es autoridad. Para cada operación administrativa:

1. Next/Django resuelven el hostname registrado.
2. Django obtiene website y empresa.
3. Se valida la sesión del usuario.
4. Se valida pertenencia y permiso en esa empresa.
5. El queryset se filtra por empresa/website.

El objetivo recomendado es una sesión mediante BFF y cookie `HttpOnly`, `Secure`, `SameSite` y host-only. No se comparten cookies entre dominios de clientes. Proxy sirve para routing y comprobaciones optimistas, no sustituye la autorización backend.

## 10. Componentes reutilizables auditados

### Reutilizar directamente

- `components/ui/*`: inputs, botones, cards, tablas, diálogos, select, skeleton y paginación.
- `components/storefront/CartProvider.jsx` y `CartControls.jsx`.
- `components/storefront/ProductImage.jsx` y `ProductGallery.jsx`.
- `components/storefront/StorefrontProductCard.jsx`.
- `components/storefront/CatalogPagination.jsx`.
- `components/storefront/CartPageClient.jsx`.
- `components/website/SectionEditor.jsx`, adaptándolo a schemas de plantilla.
- `lib/tenant/*`, `lib/cart/*`, `services/storefrontService.js` y `websiteService.js`.

### Reutilizar con adaptación

- `SiteNavigation.jsx`: separar datos/acciones compartidos de la presentación específica de plantilla.
- `BlockRenderer.jsx`: compatibilidad de CMS, no renderer principal de los nuevos temas.
- `components/catalog/CatalogPage.jsx`: aprovechar comportamiento útil, pero no mantenerlo como catálogo final.

### No usar como base pública final

- `(public)/layout.js` y `(public)/page.js`: contienen marca hardcodeada.
- `components/admin/ProductCard.jsx` y `ProductDetailModal.jsx` dentro del público: mezclan responsabilidades administrativas y storefront.
- Carga inicial por `useEffect`, filtros locales e infinite scroll del catálogo heredado como fuente principal SSR.

## 11. Riesgos y conflictos

| Riesgo | Mitigación |
| --- | --- |
| Doble layout al mover rutas a `(public)` | Neutralizar primero el layout heredado. |
| Colisión de `/` o `/catalog` entre grupos | Retirar las rutas heredadas en el mismo cambio controlado. |
| Romper imports al mover carpetas | Mover rutas sin alterar componentes y ejecutar build/tests inmediatamente. |
| Exponer admin de otra empresa | Implementar validación hostname–usuario–empresa antes de cambiar Proxy. |
| Caché cruzada | Incluir `website_id`/hostname verificado en keys y tags. |
| Carrito cruzado | Mantener persistencia versionada por `website_id` y limpiar al cambiar tenant. |
| Divergencia schema Next/Django | Contratos versionados y fixtures contractuales. |
| Cambios paralelos sin commit | Inventario previo y migración en pasos pequeños, preservando el worktree. |
| Next 16 con config ESLint 15 | Registrar deuda; actualizar solo en una tarea separada autorizada. |

## 12. Migración incremental propuesta

### M0 — Congelar contrato y obtener baseline

- Inventariar cambios actuales y ejecutar tests existentes.
- Documentar rutas, respuestas públicas y comportamiento del catálogo.
- No mover archivos hasta tener baseline reproducible.

### M1 — Introducir plantillas sin mover rutas

- Crear `templates/registry.js` y `templates/ecommerce`.
- Hacer que las rutas actuales de `(storefront)` rendericen `ecommerce`.
- Mantener URLs y Proxy intactos.

### M2 — Adaptar CMS a slots

- Mapear bloques existentes a slots de `ecommerce`.
- Mantener preview, draft, publicación y rollback.
- Validar contenido faltante y media por tenant.

### M3 — Consolidar en `(public)`

- Neutralizar `(public)/layout.js`.
- Mover `sites/[hostname]` desde `(storefront)` a `(public)`.
- Retirar en el mismo corte las rutas públicas heredadas que colisionan.
- Mantener `/sites/[hostname]` y Proxy sin cambios funcionales.
- Eliminar `(storefront)` únicamente cuando quede vacío y las pruebas pasen.

### M4 — Administración por dominio

- Implementar contexto hostname–website–empresa.
- Endurecer sesión/CSRF y permisos.
- Cambiar Proxy para dejar pasar `/login` y `/admin`.
- Mantener el host administrativo central como alternativa.

### M5 — QA visual, dominios y salida

- Probar ecommerce en móvil, tablet y desktop.
- Validar DNS, TLS, canonical, sitemap, robots y headers.
- Ejecutar pruebas E2E con al menos dos dominios/empresas.

## 13. Pruebas obligatorias

### Routing

- host de control no se reescribe;
- dominio verificado se reescribe al website correcto;
- `/admin` y `/login` conservan el dominio cuando M4 esté listo;
- acceso externo directo a `/sites` se bloquea;
- host desconocido falla cerrado.

### Aislamiento

- A no consulta páginas, medios, productos, carrito, drafts ni admin de B;
- IDs y slugs de B producen 404/403 bajo A;
- caché, revalidación y carrito incluyen website;
- usuario multiempresa queda fijado al dominio activo.

### CMS

- schema inválido se rechaza;
- draft no aparece públicamente;
- publicación es atómica;
- rollback recupera una revisión;
- media y productos pertenecen al tenant.

### Ecommerce

- solo aparecen productos publicados para el website;
- precios y disponibilidad se revalidan server-side;
- el WhatsApp procede de `WebsiteSettings`;
- cambiar de dominio no conserva productos del carrito anterior;
- metadata, canonical y datos estructurados son correctos.

### Regresión técnica

- `npm run test:tenant`;
- lint, cuando se resuelva la compatibilidad de versiones;
- build de producción;
- E2E por dos hosts locales o de preview;
- Lighthouse y axe en vistas principales.

## 14. Plan definitivo

El plan válido combina las bases ya construidas con estas decisiones:

1. Mantener Django y la infraestructura multiempresa existente.
2. Adoptar plantillas en código con `ecommerce` como predeterminada.
3. Convertir el CMS por bloques en edición de slots sin crear otro CMS.
4. Consolidar todo el sitio público dentro de `(public)`.
5. Mantener `/sites/[hostname]` como detalle interno del rewrite.
6. Conservar `(admin)/admin` para ERP y CMS.
7. Servir `/admin` en el dominio empresarial solo después de asegurar la sesión contextual.
8. Mantener un host central administrativo para usuarios multiempresa y soporte.
9. Implementar primero WhatsApp; pedidos/pagos y analítica quedan para fases posteriores.

## 15. Referencias técnicas

- Next.js Route Groups: https://nextjs.org/docs/app/api-reference/file-conventions/route-groups
- Next.js Proxy: https://nextjs.org/docs/app/getting-started/proxy
- Next.js multi-tenant guide: https://nextjs.org/docs/app/guides/multi-tenant
- Next.js Backend for Frontend: https://nextjs.org/docs/app/guides/backend-for-frontend
- Shopify theme editor: https://help.shopify.com/en/manual/online-store/themes/customizing-themes/theme-editor
- Odoo multiple websites: https://www.odoo.com/documentation/20.0/applications/websites/website/configuration/multi_website.html
