# Matriz de integración con `apudig_mvp`

Este documento registra la compatibilidad observada entre `ad_frontend`, rama `mvp_production`, y la API Django REST Framework de `apudig_mvp`.

La API está montada bajo `/api/v1/`. La URL base del frontend se obtiene de `NEXT_PUBLIC_API_V1_URL` y usa `http://127.0.0.1:8000/api/v1` como valor predeterminado.

## Estado de compatibilidad

| Dominio | Servicio frontend | Endpoints esperados | Estado en `apudig_mvp` |
| --- | --- | --- | --- |
| Autenticación | `authService.js` | `/auth/token`, `/refresh`, `/me`, `/my-companies`, `/select-company`, `/logout` | Disponible en `apps/api/v1/users/urls.py` |
| Usuarios y permisos | `authService.js` | `/auth/users`, `/register`, `/roles`, `/roles/assign`, `/roles/remove`, `/permissions` | Disponible en `apps/api/v1/users/urls.py` |
| Sitio web CMS | `websiteService.js` | `/websites/current`, `/settings`, `/domains`, `/pages`, `/menus`, `/media`, `/publish`, `/preview-token` | Disponible, autenticado, versionado y aislado por la empresa del JWT en `apps/api/v1/websites/urls.py` |
| Páginas públicas | `getStorefrontPage.js` | `/storefront/sites/{hostname}/pages/{slug}` | Disponible; sólo devuelve revisiones publicadas o una vista previa con token firmado y vigente |
| ResoluciÃ³n de storefront | `resolveWebsite.js` | `/storefront/resolve?hostname=...` | Disponible; solo dominio activo/verificado y website publicado |
| Catálogo público | `storefrontService.js` | `/storefront/sites/{hostname}/products`, `/products/{slug}`, `/categories`, `/brands` | Disponible; sólo `WebsiteProduct` publicados, con precio efectivo y disponibilidad derivada sin cantidades internas. `/catalog/products` queda deprecado y exige `site` |
| Catálogo privado | `productsService.js` | `/catalog/private/products`, `/catalog/private/products/{id}/detail` | Disponible en `apps/api/v1/catalog/urls.py` |
| Productos administrativos | `productsService.js` | `/products`, `/products/{id}` | Disponible en `apps/api/v1/inventory/urls.py`; verificar operaciones admitidas por las vistas antes de cambios funcionales |
| Categorías | `categoriesService.js` | `/categories` | Disponible como listado; el frontend conserva un import fake sin uso |
| Marcas | `brandsService.js` | `/brands` | Disponible como listado; el frontend conserva un import fake sin uso |
| Unidades | `unitService.js` | `/units` | Disponible como listado |
| Almacenes | `warehousesService.js` | `/warehouses`, `/warehouses/{id}` | Disponible |
| Tipos de documento | `documentTypesService.js` | `/document-types` | Disponible como listado |
| Acceso a sucursales | `storeAccessService.js` | `/auth/store-access`, `/stores` | No observado en la API v1 |
| Stock | `stockService.js` | `/stocks/product/{id}` | No observado en la API v1 |
| Movimientos | `movementsService.js` | `/movements` | No observado en la API v1 |
| Clientes generales | `customersService.js`, `partnersService.js`, `salesService.js` | `/customers` | No observado como recurso general; POS tiene `/pos/customers` con contrato distinto |
| Proveedores | `suppliersService.js`, `partnersService.js` | `/suppliers` | No observado en la API v1 |
| Cotizaciones | `salesService.js` | `/sales/quotations` | No disponible; `apps/api/v1/sales/urls.py` está vacío |
| Pedidos de venta | `salesService.js` | `/sales/orders` | No disponible; namespace API de ventas vacío |
| Comprobantes | `salesService.js` | `/sales/vouchers` | No disponible; namespace API de ventas vacío |
| Series y preferencias | `salesService.js` | `/sales/series`, `/sales/settings/document-pdf` | No disponible; namespace API de ventas vacío |
| Reportes | `reportsService.js` | `/reports/stock-by-warehouse`, `/stock-by-warehouses`, `/movements`, `/kardex` | No observado en la API v1 |

`apudig_mvp` contiene funcionalidad web Django para varios de estos dominios, pero una vista web o un modelo existente no equivalen a un contrato REST disponible para este frontend.

## API adicional de `apudig_mvp`

`apudig_mvp` expone una API POS bajo `/api/v1/pos/` con bootstrap, productos, sesiones de caja, ventas, cobros, devoluciones y clientes POS. `ad_frontend` no tiene actualmente servicios dedicados para consumir ese contrato.

Los namespaces `/api/v1/sales/` y `/api/v1/companies/` no contienen endpoints en la versión inspeccionada. `/api/v2/` es un placeholder no implementado.

## Rutas de interfaz por módulo

| Módulo | Rutas principales |
| --- | --- |
| Público | `/`, `/catalog`, `/login` |
| Productos | `/admin/products`, `/admin/catalog_admin` |
| Inventario | `/admin/inventory/entries`, `/admin/inventory/exits`, `/admin/inventory/adjustments`, `/admin/inventory/movements`, `/admin/inventory/transfers` |
| Socios de negocio | `/admin/partners/customers`, `/admin/partners/suppliers` |
| Ventas | `/admin/sales/quotations`, `/admin/sales/series` |
| Reportes | `/admin/reports`, `/admin/reports/movements`, `/admin/reports/kardex`, `/admin/reports/stock-by-warehouse`, `/admin/reports/stock-by-warehouses` |
| Administración | `/admin/administration/users`, `/admin/administration/configuration` |

La existencia de una ruta frontend no implica que su API esté disponible. Los módulos marcados como no observados requieren implementar o adaptar el contrato de `apudig_mvp` antes de considerarlos funcionales en producción.

## Datos simulados y residuos

| Archivo | Uso observado | Decisión para esta fase |
| --- | --- | --- |
| `src/data/fake/categories.js` | Importado por `categoriesService.js`, aunque el servicio consulta `/categories` | Mantener para no ampliar el alcance; retirar en la fase de limpieza |
| `src/data/fake/brands.js` | Importado por `brandsService.js`, aunque el servicio consulta `/brands` | Mantener para no ampliar el alcance; retirar en la fase de limpieza |
| `src/data/fake/products.js` | Sin referencias activas observadas | Mantener hasta confirmar que no exista consumo externo |
| `src/data/fake/movements.js` | Sin referencias activas observadas | Mantener hasta confirmar que no exista consumo externo |
| `src/data/fake/warehouses.js` | Sin referencias activas observadas | Mantener hasta confirmar que no exista consumo externo |
| `src/utils/fakeAuth.js` | Sin referencias activas observadas | Mantener hasta la fase de limpieza |
| `src/utils/fakeJwt.js` | Sin referencias activas observadas | Mantener hasta la fase de limpieza |

## Observaciones de contrato

- `api.js` normaliza endpoints para que terminen en `/`, preservando los query strings.
- Autenticación, reportes y parte del acceso a sucursales realizan llamadas directas con `fetch`; el resto utiliza `apiFetch`.
- Clientes y proveedores tienen funciones equivalentes en más de un servicio. Su consolidación queda fuera de la Fase 1 para evitar cambios funcionales.
- Todo cambio futuro de servicios debe contrastarse con `apps/api/v1/` de `apudig_mvp`.
- `src/proxy.js` solo decide `next`, redirect o rewrite. No consulta Django ni autoriza usuarios.
- Los hosts de tienda se reescriben internamente a `/sites/{hostname}`. El acceso externo directo a `/sites` devuelve 404.
- `serverClient.js` no lee `localStorage` ni adjunta el JWT administrativo al storefront.
- `APUDIG_CONTROL_HOSTS`, `APUDIG_ADMIN_ORIGIN` y `APUDIG_API_V1_URL` son variables server-only.

## Pendientes de la línea base

- Validar mediante pruebas HTTP los métodos y esquemas exactos de productos y almacenes que el frontend necesita modificar.
- Definir si los contratos faltantes se implementarán en `apudig_mvp` o si los módulos correspondientes se excluirán del alcance MVP.
- `next` está en la versión 16.0.10 y `eslint-config-next` en 15.5.4. La actualización requiere regenerar el lockfile mediante npm; no se debe editar `package-lock.json` manualmente.

## Fase 2 — páginas web

El editor está disponible en `/admin/website/pages` y `/admin/website/pages/{id}`. El storefront interno `/sites/{hostname}/[[...slug]]` consume instantáneas publicadas por hostname y el webhook `/api/revalidate` invalida únicamente etiquetas de sitio, página y host permitidas.

## Fase 3 — tema, menús, medios y SEO

Los módulos administrativos están disponibles bajo `/admin/website/themes`,
`/menus`, `/media`, `/seo`, `/settings` y `/banners`. La identidad pública se
obtiene del tenant resuelto, sin nombres, colores ni datos de contacto fijos en
el frontend.

El layout aplica variables CSS del tema y consume sólo snapshots publicados de
los menús. Las páginas generan canonical, robots, Open Graph y JSON-LD; los
hosts públicos exponen `/sitemap.xml` y `/robots.txt`. Un dominio alias conserva
la ruta y los parámetros al redirigir permanentemente al dominio primario.

## Fase 4 — storefront y catálogo multiempresa

El catálogo tenant-aware vive en `/sites/{hostname}/catalog` y el detalle en
`/sites/{hostname}/productos/{slug}`; el proxy los expone como `/catalog` y
`/productos/{slug}` en cada dominio público. Ambos son Server Components y
consumen `storefrontService.js` sin JWT administrativo.

Búsqueda, categoría, marca, orden y paginación se procesan en Django. Las
respuestas se cachean con `catalog:{website_id}` y `site:{website_id}`. La ruta
heredada del host de control `/catalog` conserva su implementación anterior
durante la ventana de compatibilidad.

## Fase 5 — carrito y WhatsApp

El storefront monta un `CartProvider` cliente dentro del layout resuelto en
servidor. La persistencia se particiona por `website_id` y versión. `/cart`
muestra cantidades, productos retirados y el resumen revalidado.

El navegador envía sólo IDs y cantidades al Route Handler same-origin
`/api/storefront/quote`; éste deriva el hostname de la solicitud y llama
server-side a `/storefront/sites/{hostname}/cart/quote/`. El enlace WhatsApp se
genera exclusivamente desde la respuesta vigente de Django y el número público
del website. No se registra una venta ERP.
