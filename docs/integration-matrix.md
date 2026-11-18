# Matriz de integración con `apudig_mvp`

B4-C4 (18/11/2026): validación, no reimplementación. Ver informe backend23 y evidencias b4c4*.json.64 Node/186 PostgreSQL acotados/24 HTTP correctos;727 globales con113 fallos históricos idénticos. Guardado/publicación CMS demostrados además desde Chrome; permisos de política CMS ocultos. Visual parcial y R2 real pendiente (credenciales/bucket ausentes). Website demo.localhost válido pero sin publicaciones/política comercial; no se crean fixtures allí. commerceEnabled=false; quote CTA de Home se dirige ahora al catálogo y el editor distingue borrador pendiente de publicación. El flujo laboral posterior al ajuste de listas/almacenes se conserva. B4-D solo propuesta, no registro/cuentas/pedidos.

B4-C17–18/11/2026: K0–K3 conectados por hostname en SSR no-store; K4–K7 en el editor Website con JWT y ETag comercial independiente del CMS. Política/listas/overrides/almacenes solo según canManagePolicy del servidor. 412/428 conservan formularios y requieren recarga explícita. Home consulta productos vivos con descriptores CMS publicados; P1 conserva secciones comerciales y filtra referencias propias publicadas. Sin datos comerciales en snapshots ni productos demo. commerceEnabled=false: lectura pública autorizada sí; pedidos/carrito/WhatsApp operativo no.59 tests Node,167 PostgreSQL acotados y17 checks HTTP reales correctos. QA visual/autenticada y R2 real pendientes; suite ERP global conserva113 fallos/errores, sin nuevos casos frente a B4-B. Ver informe backend22 para archivos, evidencias, límites y reproducción. Se conservan catálogos laborales y autenticación; no hay registro de clientes implementado. Las notas siguientes describen etapas anteriores.

B4-B17/11/2026: API comercial K0–K7 implementada en backend; integración visual B4-C pendiente. Público: `/storefront/sites/{hostname}/products/`, detalle, categories y brands. Administración: `/websites/{websiteId}/catalog-product-options/`, catalog-settings y products; ETag comercial obligatorio al escribir. Consultar informe backend21/OpenAPI: el transporte Next preparado todavía usa `/stores/{id}` y no está conectado a esos contratos. No activar commerceEnabled. Catálogo laboral, permisos privados y dashboard se conservan. Registro de clientes y WhatsApp permanecen como diseño, con propuesta /cuenta aún sin crear rutas.

Política vigente (ajuste posterior17/11/2026): las lecturas básicas `catalog/products` y detalle permiten todos los miembros activos de la empresa, sin rol ni permiso ERP de productos. `products` conserva su permiso ERP; privado conserva ADMIN de empresa/superusuario. JWT, Company activa, membresía y sucursal vigente siguen obligatorios. La navegación administrativa se filtra por perfil del servidor. Ver informe backend18; no hay acceso mayorista de clientes implementado.

Actualización P0 (17/11/2026): `/catalog` ahora requiere sesión y empresa. Las seis lecturas `catalog/products`, `catalog/private/products` y `products` (listado/detalle) exigen JWT, empresa activa y acceso vigente. Los campos privados requieren superusuario/administrador de empresa; el catálogo básico los omite. Las URLs y paginación se conservan. El antiguo nombre «catálogo público» corresponde al catálogo laboral básico, **ya no anónimo**. El público comercial Website sigue pendiente; ver informe backend17. Validación visual autenticada pendiente; lint/build,45 tests Node y smoke16 rutas correctos.

Actualizacion B3: Website editorial E0/E1-E6/M0-M2 y lectura publica P0/P1 implementados e integrados. Ver docs/storefront-plan-y-avances.md y apudig_mvp/docs/architecture/website-integration/11-entrega-b3.md; R2 real y revision visual siguen pendientes. Los contratos comerciales B4/B5 contin?an pendientes.

Este documento registra la compatibilidad observada entre `ad_frontend`, rama `mvp_production`, y la API Django REST Framework de `apudig_mvp`.

La navegación actual concentra Next en administración web y catálogos; los módulos ERP de esta matriz son antecedentes de integración y ahora muestran una transición a Django. `/catalog` y `/admin/catalog_admin` se conservan; los productos comerciales están en `/shop`. Ver [rutas y responsabilidades actuales](admin-web-y-catalogos.md). No usar esta matriz histórica como instrucción para reactivar módulos ERP en Next.

La API está montada bajo `/api/v1/`. La URL base del frontend se obtiene de `NEXT_PUBLIC_API_V1_URL` y usa `http://127.0.0.1:8000/api/v1` como valor predeterminado.

## Estado de compatibilidad

| Dominio | Servicio frontend | Endpoints esperados | Estado en `apudig_mvp` |
| --- | --- | --- | --- |
| Autenticación | `authService.js` | `/auth/token`, `/refresh`, `/me`, `/my-companies`, `/select-company`, `/logout` | Disponible en `apps/api/v1/users/urls.py` |
| Usuarios y permisos | `authService.js` | `/auth/users`, `/register`, `/roles`, `/roles/assign`, `/roles/remove`, `/permissions` | Disponible en `apps/api/v1/users/urls.py` |
| Catálogo laboral básico | `productsService.js` | `/catalog/products`, `/catalog/products/{id}/detail` | JWT + empresa + membresía vigente, sin rol; sin campos privados |
| Catálogo laboral privado | `productsService.js` | `/catalog/private/products`, `/catalog/private/products/{id}/detail` | JWT + empresa + superusuario/administrador de empresa |
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
| Público | `/`, `/login` |
| Catálogo laboral autenticado | `/catalog`, `/admin/catalog_admin` |
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

## Pendientes de la línea base

- Validar mediante pruebas HTTP los métodos y esquemas exactos de productos y almacenes que el frontend necesita modificar.
- Definir si los contratos faltantes se implementarán en `apudig_mvp` o si los módulos correspondientes se excluirán del alcance MVP.
- `next` está en la versión 16.0.10 y `eslint-config-next` en 15.5.4. La actualización requiere regenerar el lockfile mediante npm; no se debe editar `package-lock.json` manualmente.
- El entorno local inspeccionado no contiene `xlsx` dentro de `node_modules`, aunque está declarado en `package.json` y `package-lock.json`. Una instalación completa con `npm ci` debe restaurarlo antes del build.
