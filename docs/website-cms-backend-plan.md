# Administración web — contrato frontend y plan Django

Actualización: 12/11/2026, America/Lima. Estado: frontend local implementado; backend **propuesto, no implementado**. Repositorio frontend `ad_frontend`; backend futuro `apudig_mvp`. Este documento complementa `storefront-plan-y-avances.md`.

La navegación Next está dedicada a la web y catálogos. `/catalog` y `/admin/catalog_admin` se conservan para uso laboral; los productos comerciales se muestran en `/shop` y `/shop/[id]`. Ver `admin-web-y-catalogos.md`. No rediseñar ni sustituir los contratos del catálogo laboral al integrar el nuevo storefront.

## Decisión de producto

Incorporar **Página web** al panel APUDIG, sin instalar otro CMS ni crear un segundo administrador. Edición de contenido estructurado: identidad, banners, campañas, orden/visibilidad de secciones, contacto y SEO. Sin HTML arbitrario, JavaScript editorial, editor drag-and-drop, motor de descuentos, pagos ni modificación de inventario.

Referencias consultadas:
- [Odoo: bloques](https://www.odoo.com/documentation/18.0/applications/websites/website/web_design/building_blocks.html) y [visibilidad](https://www.odoo.com/documentation/19.0/applications/websites/website/web_design/visibility.html): contenido dividido en secciones con configuración y visibilidad. Adoptamos bloques limitados, no su editor completo.
- [Strapi: Draft & Publish](https://docs.strapi.io/cms/features/draft-and-publish) y [Preview](https://docs.strapi.io/cms/features/preview): borrador independiente de contenido publicado y previsualización antes de publicar. Adoptamos el flujo sin incorporar Strapi.

## Estado verificado del backend actual

- `apps/companies/models.py` contiene `Company` con UUID, `Store` ligado a empresa y `CompanyBranding` 1:1 con logos/colores. Distinguir identidad del ERP/documentos de identidad comercial de cada web: usar valores heredados, no sobrescribir branding fiscal desde el editor web.
- Existe el directorio `apps/websites`, pero la revisión encontró solamente `__pycache__` y artefactos compilados de modelos, servicios, bloques, media y migraciones históricas. No se encontraron fuentes `.py` ni pruebas fuente en esa carpeta. Esto **no confirma un CMS operativo** y tampoco autoriza reconstruir modelos a partir de los nombres de los `.pyc`.
- `apps/api/v1/urls.py` no monta un namespace web editorial en las fuentes inspeccionadas.
- Existen `BaseCompanyAPIView` e `IsCompanyUser`; requieren revisión para su uso editorial. La presencia de un contexto no prueba membresía ni autorización sobre un website específico. Un company_id faltante debe provocar denegación antes de consultar; no permitir un queryset sin filtro.
- Las vistas públicas de catálogo inspeccionadas declaran `AllowAny`, `company_required=False` y toman un contexto que puede faltar. No reutilizarlas como contrato seguro de tienda publicada sin revisar selectores/serializadores y pruebas de aislamiento.

Antes de diseñar migraciones, recuperar la rama/commit autorizado que contenga las fuentes del CMS previo, revisar esquema y migraciones existentes contra la base real. No borrar tablas ni generar migraciones sustitutivas sin esta conciliación. No ejecutar migraciones ni editar Django durante esta entrega.

## Flujo disponible en frontend

Rutas:
- `/admin/website`: editor bajo el AuthGuard existente y la empresa seleccionada.
- `/admin/website/preview`: vista previa protegida del borrador guardado.
- `/admin/website/preview?source=published`: versión aplicada a la demo local.
- El iframe del editor usa `?embedded=1`, la misma autenticación, y recibe contenido válido del formulario con postMessage validando origen, ventana emisora y empresa. No se envían tokens por mensajes ni por URL.

Acciones: guardar borrador, aplicar versión a demo local, recuperar la versión aplicada en el formulario, reordenar/ocultar/agregar/eliminar banners y campañas, y revisar actividad local. Recuperar o recargar pide confirmar la pérdida de cambios en el formulario. No hay publicación real.

Persistencia actual: localStorage versionado con empresa y web. Los borradores no modifican la versión aplicada. Una revisión detecta escrituras obsoletas entre pestañas; es una comprobación de mejor esfuerzo, **no** un bloqueo transaccional distribuido. Fallos de cuota o datos corruptos no informan éxito ni sobrescriben silenciosamente.

**La página pública `/` continúa usando la configuración demo del servidor.** Un navegador no puede actualizar SSR compartido con localStorage. Esta separación es intencional hasta implementar el contrato Django; los cambios editoriales se reflejan en las vistas previas. No hay sincronización entre PC, dominio real, subida de archivos ni programación de publicación en servidor.

Las campañas son mensajes y enlaces a productos, no reglas de descuento. Sus fechas filtran la vista previa con hora del navegador, ingresadas en Lima (UTC−05) y almacenadas en UTC. La autoridad de vigencia real será el servidor Django.

## Contrato propuesto

`src/lib/website/content.mjs` define el documento frontend, sus defaults y validación. `src/services/websiteRepository.mjs` separa persistencia local y adaptador HTTP propuesto. La UI no consume endpoints CMS existentes ni futuros todavía.

Interfaz asíncrona: `load(scope, initial)`, `saveDraft(scope, document, revision, initial)`, `publish(scope, revision, initial)`. `initial` se usa solo en local. Las capacidades distinguen modo local/API y disponibilidad futura de media/publicación. Para integrar, inyectar un cliente autenticado que conserve errores estructurados; el `apiFetch` actual necesita adaptación de errores para mapear status/campos sin cambiar su comportamiento para el resto del ERP.

Documento JSON `schemaVersion: 2` (v1 local se adapta al leer para mover enlaces del storefront de `/catalog` a `/shop`):

| Campo | Contenido / reglas |
| --- | --- |
| `identity` | name (100), shortName (40), location (100), primaryColor (#RRGGBB), logoUrl, announcement (180) |
| `contact` | phone, whatsapp (8–15 dígitos con país), address, hours |
| `seo` | title (70), description (180); indexación la controla estado publicado en servidor |
| `banners[]` | id, enabled, eyebrow (60), title (100), description (300), ctaLabel (40), href, imageUrl, mobileImageUrl, imageAlt, art |
| `promotions[]` | id, enabled, eyebrow, title, description, ctaLabel, href, startsAt, endsAt, productIds[] |
| `sections[]` | type, enabled, title; exactamente una de benefits/categories/featured/promotions/about; posición dada por el array |

Hasta 12 banners y 12 campañas; enlaces internos; imágenes de URL HTTPS o rutas locales; alt requerido si hay imagen. Texto plano. `art` es un fallback visual demo. Al integrar media, traducir `logoUrl`/`imageUrl` a referencias autorizadas y URLs públicas derivadas; no confiar en URLs enviadas por un editor como prueba de pertenencia del archivo.

Respuesta editorial normalizada:

```json
{
  "schemaVersion": 2,
  "companyId": "uuid-servidor",
  "websiteId": "uuid-servidor",
  "revision": 4,
  "draft": { "schemaVersion": 2 },
  "published": null,
  "updatedAt": "2026-11-12T15:00:00.000Z",
  "publishedAt": null,
  "events": []
}
```

`draft`/`published` contienen el documento completo de la tabla anterior (abreviados en el ejemplo). Publicación devuelve una copia inmutable y `publishedAt`. Actividad normalizada con `action`, `at`, `revision`; el backend deberá agregar actor/resultado y permitir paginación en un endpoint de auditoría. El frontend actual distingue `save` y `apply-demo`; el adaptador deberá normalizar la acción real `publish` y su etiqueta para evitar mostrar una publicación como demo.

Endpoints **propuestos**, bajo `/api/v1` (no están implementados):

| Método / ruta | Permiso y comportamiento |
| --- | --- |
| GET `/websites/` | Listar webs de la empresa activa; no listar empresas ajenas |
| GET `/websites/{id}/editor/` | Leer documento editorial y revisión; `websites.view_website` |
| PUT `/websites/{id}/draft/` | Validar y guardar borrador; `websites.change_website`; If-Match obligatorio |
| POST `/websites/{id}/publish/` | Publicar snapshot validado; `websites.publish_website`; If-Match obligatorio |
| POST `/websites/{id}/restore/` | Copiar revisión histórica a borrador; sin publicación implícita |
| GET `/websites/{id}/revisions/` | Historial paginado autorizado |
| POST `/websites/{id}/media/` | Subir imagen a almacenamiento gestionado; permiso de media |
| POST `/websites/{id}/preview-token/` | Futuro preview remoto: token firmado de corta vida y alcance limitado |
| GET `/storefront/bootstrap/` | Identidad/configuración **publicada** de tienda resuelta confiablemente |
| GET `/storefront/products/` y `/storefront/products/{id}/` | Solo productos publicados de esa web, datos comerciales permitidos |

El adaptador frontend contempla `{id}=default` como alias que Django deberá resolver dentro de la empresa autenticada, o reemplazar por el UUID devuelto por el listado. No resolver ese alias globalmente. No enviar `company_id` editorial desde el formulario como mecanismo de autorización.

PUT y publicación llevan `If-Match: "4"`. Django devuelve ETag y revisión 5. Usar **428** si falta precondición, **412** si quedó obsoleta, **400** para errores de documento, **401/403** para sesión/permisos, **404** para una web de otra empresa. El adaptador mapeará 412 al error de conflicto mostrado por la interfaz. Estructura de error propuesta: `{code, message, fields: {"banners.0.title": "..."}}`.

## Plan de implementación Django

### Fase 0 — Recuperar y conciliar CMS existente

Inventariar fuentes, ramas autorizadas, migraciones aplicadas y tablas de `apps.websites`. Revisar cómo se relacionan con Company, CompanyBranding y Store. Recuperar pruebas previas. Documentar qué existe realmente y qué requiere extensión; no crear un segundo modelo Website en paralelo. Entrega: inventario de modelos/contratos y migración incremental acordada.

### Fase 1 — Dominio y permisos

Reutilizar o extender las entidades del CMS recuperado para representar Website (empresa, plantilla, estado, dominios verificados, zona horaria), documentos/revisiones editoriales y referencias de media/productos. Un website pertenece siempre a una empresa; una sucursal ERP no equivale necesariamente a un website.

Preferir bloques tipados y un documento validado con revisión para esta primera plantilla. Si ya existen Page/Block/Menu/Theme, transformar el DTO frontend a esas entidades mediante un servicio; no duplicar todo en otra tabla JSON. Conservar borrador y snapshot publicado, autor, timestamps y auditoría. Definir constraints de unicidad por empresa/slug/dominio y máximo de bloques. Crear permisos de lectura, edición, publicación y media con autorización en servidor y concesión explícita a roles existentes.

Entregas: modelos reconciliados, migraciones incrementales, servicios/selectores y pruebas de permisos. La UI actual respeta roles admin/superadmin y codenames propuestos; esto no sustituye validación DRF.

Entidades candidatas, **solo si no existen en las fuentes recuperadas**:

| Entidad | Responsabilidad y restricciones |
| --- | --- |
| Website | UUID, Company FK, slug por empresa, plantilla, estado y referencias a revisiones borrador/publicada; company no editable desde el DTO |
| WebsiteDomain | Website FK, hostname normalizado único, fecha de verificación y estado activo; ningún dominio se activa solo por recibir un Host |
| WebsiteRevision | Website FK, número de revisión único por web, documento validado, esquema, actor y fechas; snapshot publicado inmutable |
| WebsiteMedia | Company/Website FK, archivo gestionado, MIME, tamaño, dimensiones, hash y alt; validar pertenencia al referenciar |
| WebsiteAuditEvent | Website, actor, operación, revisión anterior/nueva y timestamp; append-only, sin almacenar tokens |

Las campañas y secciones pueden ser bloques tipados del documento en esta fase. No crear otra entidad Campaign si ya hay un modelo comercial/CMS equivalente. Si se normalizan productos de campaña en relaciones, imponer validación de empresa y estado publicable tanto en API como en servicio de publicación.

### Fase 2 — API editorial y concurrencia

Añadir serializers y vistas en `apps/api/v1/websites/`, montadas en v1. Servicios del dominio en `apps/websites/services.py`, lecturas en selectors, siguiendo las convenciones del monolito. Resolver empresa del token/sesión y comprobar membresía, permiso y pertenencia del website antes de cada operación.

Guardar/publicar mediante `transaction.atomic` y bloqueo o actualización condicional por revisión. Publicar valida referencias, copia snapshot consistente, incrementa revisión, escribe auditoría y notifica invalidación después del commit. No almacenar borradores en caché pública. Recuperar una revisión solo modifica borrador. Publicación de contenido no equivale a un despliegue de código.

Entregas: OpenAPI, DTO y errores compatibles, ETag/If-Match y pruebas de carrera entre dos editores.

### Fase 3 — Media y campañas

Validar MIME por contenido, extensión permitida, dimensiones y tamaño; nombres generados y ownership por empresa. Rechazar SVG/HTML activos en la primera versión. Guardar desktop/mobile/alt y servir URLs apropiadas sin rutas privadas. No hacer fetch de URLs arbitrarias desde el servidor. No borrar una imagen todavía referenciada por una versión publicada.

Campañas: activación, posiciones, referencias a productos publicados de la misma empresa y periodo UTC (`inicio <= ahora < fin`, fin exclusivo). No introducir lógica de descuento fiscal/precio en el CMS. Resolver vigencia con reloj del servidor; la publicación puede ser inmediata primero. Si se requiere publicación futura automática, evaluar el scheduler disponible antes de añadir infraestructura. Invalidar caché en límites de campaña o limitar TTL al próximo cambio de vigencia.

### Fase 4 — Storefront público seguro y conexión Next.js

Resolver dominio desde registro verificado de websites y un proxy confiable; normalizar host, rechazar desconocidos, no confiar en cabeceras arbitrarias. Esto selecciona contenido público publicado y no autoriza acceso a datos privados. Retornar 404 para tienda desactivada/no publicada. El DTO público excluye borradores, eventos internos, costos, almacenes, listas privadas y configuración interna.

Next.js obtendrá la configuración publicada en servidor mediante cliente público sin token administrativo. Adaptar `src/lib/storefront/store.js`, metadata y contenido Home a la respuesta normalizada. Claves de caché por website/idioma/revisión, invalidación autenticada después de publicar y política explícita de errores sin fallback a otra empresa. Canonical, OG y sitemap solo al disponer de dominio/estado reales. Para preview remoto: sesión editorial o token firmado, no-cache y noindex; no aceptar `?draft=1` como autorización.

Conectar la interfaz editorial al adaptador Django, descubrir el website ID, mapear errores y cambiar textos/acciones de demo solo después de pruebas integradas. La aplicación pública deberá mostrar la versión publicada y conservarla mientras cambia el borrador.

### Fase 5 — Pruebas y activación gradual

- Empresa A no puede leer, editar, subir media, vincular productos o publicar contenido de B. Sin contexto no existe consulta global.
- Lectura sin edición y edición sin publicación respetan permisos reales.
- Guardar borrador no cambia el bootstrap público. Publicar es atómico; una revisión vieja falla sin sobrescribir.
- Restauración no publica automáticamente; auditoría identifica actor/empresa/revisión.
- Archivos inválidos, media de otra empresa y referencias de producto no publicado fallan.
- Reloj/zonas y límites exactos de campañas; caché deja de servir campañas vencidas.
- Host desconocido no filtra datos; caché y metadata nunca cruzan websites.
- Auth/login y módulos ERP mantienen comportamiento; pruebas Django focalizadas y suite completa antes de integrar.

Activar primero una tienda de prueba con contenido autorizado. Mantener demo/noindex hasta superar pruebas de contrato y separación. Sin pagos ni despliegues en el alcance de esta entrega frontend.

## Criterios para considerar lista la integración

Dos navegadores/PC ven la misma versión guardada por API; la tienda pública ve solo el snapshot publicado; media y productos están aislados por tenant; errores y conflictos se recuperan sin pérdida silenciosa; y los permisos se verifican en Django. Hasta entonces, las acciones locales no se presentan como una integración de producción.
