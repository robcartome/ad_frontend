# 01. Auditoría del frontend

## Alcance y línea base

Auditoría realizada el 10 de noviembre de 2026 sobre `ad_frontend`, rama `mvp_production`, y contrastada con `apudig_mvp`, rama `develop`. Esta etapa no modifica código funcional ni configuración.

El repositorio real contiene 32 rutas `page.js`, 17 archivos bajo `src/services/` y 62 archivos marcados como Client Components. No existen los directorios `src/context/`, `src/redux/`, `src/store/` ni `src/hooks/` descritos en la estructura aproximada. Tampoco existe `middleware.js`, `proxy.js`, `vercel.json`, una configuración CI/CD o pruebas frontend.

## Configuración observada

| Área | Hallazgo | Consecuencia |
| --- | --- | --- |
| Runtime | `next` 16.0.10, React/React DOM 19.1.0, Node 20 en `Dockerfile` | App Router actual; en Next 16 la convención correcta para interceptar hosts es `proxy.js`, no `middleware.js`. |
| Estilos | Tailwind 4.1.14 vía `@tailwindcss/postcss`; `tailwind.config.js` conserva configuración y plugin de Tailwind 3 | Funciona en la línea base, pero debe validarse antes de añadir tokens de tema. No migrar durante el MVP sin necesidad. |
| UI | Radix UI, componentes estilo shadcn, Lucide, Sonner, `class-variance-authority`, `clsx`, `tailwind-merge` | Base reutilizable para el CMS. |
| Estado | React Context únicamente (`src/lib/AuthContext.jsx`) y estado local | Suficiente para sesión administrativa; el carrito necesitará un contexto/store aislado y persistencia versionada. |
| Formularios | Inputs controlados manualmente; no hay React Hook Form, Formik, Zod ni Yup | Para bloques CMS conviene validación por esquema compartido, pero no es requisito instalarla antes de definir contratos. |
| HTTP | `fetch` propio en `src/services/api.js`; autenticación y algunos servicios llaman `fetch` directamente | Hay duplicación de cabeceras, refresh y manejo de errores. |
| Build | `next build --turbopack`; Docker usa `npm install` | En CI/imagen reproducible debe preferirse `npm ci`, en una fase de infraestructura aprobada. |
| Lint | `npm run lint` pasa; solo aparece aviso de `baseline-browser-mapping` desactualizado | Línea base sintácticamente limpia. No hay script de test. |
| Dependencias | `eslint-config-next` 15.5.4 no coincide con Next 16.0.10; `framer-motion` no tiene referencias | Alinear ESLint con Next y retirar dependencias solo en un ticket de mantenimiento separado. `uuid` y `xlsx` sí se usan. |
| Entorno | Solo se observó la clave `NEXT_PUBLIC_API_V1_URL`; no se inspeccionó ni reproduce su valor | Al ser `NEXT_PUBLIC_*`, la URL queda expuesta al navegador. No contiene por sí misma un secreto. |
| Despliegue | No hay `vercel.json` ni workflows; `next.config.mjs` está vacío | La configuración real de Vercel debe auditarse en el panel antes de producción. |

Referencias: `package.json`, `package-lock.json`, `next.config.mjs`, `postcss.config.mjs`, `tailwind.config.js`, `Dockerfile`, `.env.example` y `eslint.config.mjs`.

## Estructura real y rutas

### Públicas

| Ruta | Implementación | Estado |
| --- | --- | --- |
| `/` | `src/app/(public)/page.js` | Página estática hardcodeada para “Mega Ferretero Tolentino”; reutilizable solo como prototipo. |
| `/catalog` | wrapper de `src/components/catalog/CatalogPage.jsx` | Funciona como catálogo cliente, pero no es seguro multiempresa. |
| `/login` | `src/app/login/page.js` | Login JWT y selección de empresa funcionales para el panel. |
| `/cart` | Solo existe un enlace en `src/app/(public)/layout.js` | Ruta inexistente; enlace roto. |

El layout público contiene marca, colores, copyright 2025 y nombre de empresa hardcodeados. No genera metadata por tenant ni canonical. El catálogo es un Client Component, por lo que carga productos después de hidratar y ofrece peor SEO que una carga inicial desde Server Components.

### Administrativas

- Base: `/admin` y `/admin/catalog_admin`.
- Maestros: `/admin/products`, `/admin/categories`, `/admin/brands`, `/admin/warehouses`.
- Inventario: entradas, salidas, ajustes, transferencias, movimientos y edición de movimiento.
- Socios: clientes y proveedores con listado, alta y edición.
- Ventas: cotizaciones (listado, alta y detalle) y series.
- Reportes: índice, stock por almacén, stock comparativo, movimientos y kardex.
- Administración: configuración y usuarios.

`src/app/(admin)/admin/layout.js` monta `AdminLayout`, que protege todo el grupo con `AuthGuard`. La protección es exclusivamente cliente: durante la carga se consulta `localStorage` y se redirige con `router.replace`. Sirve como control de navegación, no como frontera de seguridad.

Varias rutas administrativas dependen de APIs que no existen en `apudig_mvp` v1: movimientos, stock puntual, clientes/proveedores generales, cotizaciones, pedidos/comprobantes, series y reportes. Deben clasificarse como **UI existente con integración pendiente**, no como funcionalidad de producción ni como obsoletas sin una decisión de producto. `docs/integration-matrix.md` ya enumera esos desfases.

## Autenticación y alcance multiempresa

Flujo real:

1. `/auth/token/` retorna access/refresh y empresas accesibles.
2. El usuario elige empresa y `/auth/select-company/` emite un access token con `company_id`, roles y permisos.
3. `access_token`, `refresh_token` y `selected_company` se guardan en `localStorage` (`src/services/authService.js`).
4. `AuthContext` restaura sesión, refresca token y deriva roles/permisos decodificando el JWT sin verificarlo, solo para UI.
5. Django valida que el usuario tenga `UserCompanyAccess` antes de emitir el token con alcance (`apps/api/v1/users/views.py`).

Aspectos reutilizables:

- Selección de empresa y token scoped emitido por Django.
- Roles/permisos por empresa ya incluidos en el JWT.
- `AuthGuard`, `AdminLayout`, `Sidebar` y `Topbar` como base visual del CMS.

Riesgos:

- Un XSS puede extraer access y refresh tokens de `localStorage`. Para el CMS se recomienda migrar gradualmente a sesión BFF con cookies `HttpOnly`, `Secure`, `SameSite=Lax/Strict`; no mezclar esta migración con el primer parche de aislamiento.
- `logout()` llama al backend sin `await` efectivo y el endpoint Django es un noop stateless: el refresh token sigue válido hasta expirar.
- La renovación obtiene primero un token genérico y luego reestablece el scope. En fallos intermedios puede quedar un token sin empresa.
- `selectedCompany` y `selectedStore` locales son preferencias de UI, no autorización. Django debe ignorarlas para permisos.
- `StoreSelector` no tiene consumidores actuales y sus endpoints no existen en API v1.
- El panel no está protegido en servidor; cualquier dato sensible debe seguir protegido por permisos DRF.

CSRF no es el riesgo principal mientras se use Bearer en cabecera y `CORS_ALLOW_CREDENTIALS=False`. Si se adopta cookie BFF, deberán incorporarse protección CSRF y validación de origen. XSS sí es crítico hoy por el almacenamiento local.

## Servicios y acceso a API

`src/services/api.js` normaliza barra final, agrega Bearer, refresca tokens expirados y traduce errores. No define timeouts, cancelación, reintentos, deduplicación ni caché. La mayoría de páginas administrativas son Client Components y cargan datos con `useEffect`.

Problemas concretos:

- `authService.js`, `storeAccessService.js`, `reportsService.js` y otros realizan `fetch` fuera del cliente común.
- No se codifican con `URLSearchParams` los términos de búsqueda en `productsService.js`.
- El refresh concurrente puede generar varias solicitudes simultáneas.
- No hay política de `cache`, `next.revalidate` ni tags porque las llamadas ocurren en cliente.
- Clientes y proveedores tienen operaciones solapadas en varios servicios.
- `categoriesService.js` y `brandsService.js` conservan imports fake; `src/data/fake/*`, `fakeAuth.js` y `fakeJwt.js` son residuos candidatos a retiro tras confirmar referencias.

Recomendación incremental: mantener los servicios ERP existentes y crear un cliente **server-only** separado para storefront/CMS público. No refactorizar todos los módulos antes del MVP.

## Auditoría del catálogo

El público y el administrativo reutilizan `CatalogPage` cambiando `isAdmin`. También reutilizan `ProductCard` y `ProductDetailModal`, aunque estos viven incorrectamente bajo `components/admin/`.

Flujo público actual:

1. `getCatalogProducts()` llama `/api/v1/catalog/products/` sin tenant.
2. Django usa `AllowAny`.
3. `BaseCompanyAPIView.get_company_id()` no encuentra token/sesión y retorna `None`.
4. `inventory_selectors.get_products(company_id=None)` no filtra empresa.

Por tanto, el endpoint lista productos activos de todas las empresas. El detalle permite recuperar cualquier producto activo por UUID. Los tests existentes verifican forma, imágenes y ocultamiento de `price_purchase`, pero no crean dos empresas ni prueban aislamiento (`apps/inventory/tests/test_catalog_api.py`).

Además:

- La API pública oculta `price_purchase`, correctamente.
- El detalle público sí expone listas de precios, stock total y stock por almacén; para ecommerce conviene publicar solo precio comercial y disponibilidad derivada, no nombres/cantidades internas por almacén.
- Categoría y marca se filtran localmente solo sobre páginas ya cargadas, por lo que los filtros son incompletos con scroll infinito.
- `hasMore` queda verdadero si la última página tiene algún resultado; causa una llamada extra.
- `loadProducts` no captura errores y omite `isAdmin` en dependencias del callback.
- Los componentes de catálogo están demasiado acoplados a modales/admin y a etiquetas “Productos MFT”.

## Reutilizar, estabilizar o retirar

| Decisión | Elementos |
| --- | --- |
| Reutilizar | App Router y route groups; componentes `ui`; `AdminLayout`; login/selección de empresa; cliente HTTP como referencia; tarjetas, galería e imagen de producto; servicios de productos/categorías/marcas tras adaptar contratos; R2 y thumbnails del backend. |
| Extraer/adaptar | `CatalogPage`, `ProductCard`, `ProductDetailModal` hacia `components/storefront`; filtros al servidor; carga inicial SSR; tema por CSS variables; errores/loading; autorización CMS por permiso. |
| Mantener fuera del alcance | Módulos ERP administrativos. El CMS debe enlazar productos, no reimplementar inventario, ventas o compras. |
| Marcar integración pendiente | Rutas que consumen endpoints ausentes según `docs/integration-matrix.md`. |
| Retirar luego de verificar | `fakeAuth.js`, `fakeJwt.js`, datos fake sin referencias, import fake en marcas/categorías, import no usado de `ProductsTable` en `/admin`, componentes de layout sin referencias y `framer-motion`. |
| Corregir pronto | Enlace `/cart` inexistente, hardcodes públicos, ruta de perfil inexistente `/admin/administration`, desfase `eslint-config-next`, falta de pruebas. |

## Conclusión

La base administrativa y visual es aprovechable, pero el storefront actual es un prototipo monotienda, client-side y sin resolución de tenant. La primera dependencia de cualquier CMS/ecommerce es corregir en Django el aislamiento de los endpoints públicos y definir un contrato de resolución por dominio. Hasta entonces no debe publicarse un segundo tenant.
