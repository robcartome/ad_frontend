# 04. Contratos API Django

## Estado actual verificado

La API v1 está montada bajo `/api/v1/`. Autenticación, catálogo, parte de inventario y POS existen; `companies` y `sales` no exponen contratos útiles para este CMS. No existe una app `websites` ni modelos de dominio/página/sección.

### Bloqueante de seguridad

Los siguientes endpoints son `AllowAny` y el scope de empresa es opcional:

```text
GET /api/v1/catalog/products/
GET /api/v1/catalog/products/{uuid}/detail/
GET /api/v1/products/
GET /api/v1/products/{uuid}/
```

Con solicitud anónima, `BaseCompanyAPIView.get_company_id()` retorna `None`; `inventory_selectors.get_products()` devuelve todas las empresas. Los dos últimos endpoints administrativos además usan serializadores de inventario y no deberían ser públicos.

Corrección inmediata requerida:

- Cambiar `/products/` y detalle a `IsAuthenticated` + contexto de empresa obligatorio y permisos de inventario.
- Sustituir el catálogo anónimo genérico por endpoints storefront con tenant obligatorio resuelto por dominio.
- Hacer fail-closed: si el tenant falta/no existe, 404 o 400; jamás queryset global.
- Añadir tests con dos empresas para lista y detalle.
- El público nunca devuelve `price_purchase`, costo de inventario, proveedor, cantidades/nombres de almacén ni listas no publicadas.

## Convenciones de contrato

- Base propuesta: `/api/v1/storefront/` para lectura pública y `/api/v1/websites/` para CMS autenticado.
- UUID como IDs; slugs para URL pública.
- Barras finales consistentes.
- Paginación: `{count, next, previous, results}` o conservar temporalmente `{total, limit, offset, results}`, pero no mezclar dentro del mismo namespace.
- Fechas ISO 8601 UTC; dinero como string decimal + moneda.
- Errores: `{code, detail, fields?, request_id?}`.
- ETag o `updated_at/version` para concurrencia optimista del CMS.
- OpenAPI actualizado y ejemplos sin datos privados.

## API pública storefront

### Resolver sitio

```http
GET /api/v1/storefront/resolve/?hostname=tolentino.apudig.com
```

Respuesta 200:

```json
{
  "website_id": "uuid",
  "hostname": "tolentino.apudig.com",
  "canonical_url": "https://tolentino.apudig.com",
  "name": "Ferretería Tolentino – La Soledad",
  "locale": "es-PE",
  "currency": "PEN",
  "theme": {
    "primary_color": "#0B1F3A",
    "accent_color": "#F97316",
    "logo": {"url": "https://media.apudig.com/...", "alt": "..."}
  },
  "contact": {"whatsapp": "...", "address": "..."},
  "publication_version": 3
}
```

No devolver `company_id`, RUC interno, settings operativos ni estado draft. Host desconocido/inactivo: 404 `WEBSITE_NOT_FOUND`.

### Página publicada

```http
GET /api/v1/storefront/sites/{hostname}/pages/{slug}/
```

Devuelve metadata, menú requerido y secciones publicadas ordenadas, ya validadas. `slug=home` representa inicio. Draft/archived: 404.

### Catálogo

```http
GET /api/v1/storefront/sites/{hostname}/products/?search=&category=&brand=&ordering=&limit=&offset=
GET /api/v1/storefront/sites/{hostname}/products/{product_slug}/
GET /api/v1/storefront/sites/{hostname}/categories/
GET /api/v1/storefront/sites/{hostname}/brands/
```

Producto público mínimo:

```json
{
  "id": "uuid",
  "slug": "taladro-marca-a-tal-01",
  "sku": "TAL-01",
  "name": "Taladro",
  "description": "...",
  "category": {"id": "uuid", "name": "Herramientas", "slug": "herramientas"},
  "brand": {"id": "uuid", "name": "Marca A", "slug": "marca-a"},
  "images": [{"url": "https://media.apudig.com/...", "alt": "..."}],
  "price": {"amount": "160.00", "currency": "PEN", "includes_tax": true},
  "availability": "IN_STOCK"
}
```

Reglas server-side:

1. resolver hostname activo;
2. filtrar `WebsiteProduct.website_id`;
3. verificar que producto y website comparten empresa;
4. exigir producto activo/publicado;
5. elegir solo price list configurada;
6. derivar disponibilidad de almacenes permitidos;
7. no serializar campos privados.

No usar el JWT del administrador en el storefront público: `apiFetch` actual agrega Bearer si existe, lo cual podría cambiar inadvertidamente la respuesta. El nuevo cliente server-only público no enviará tokens de usuario.

### Pedido WhatsApp/validación de carrito

Para el primer MVP puede generarse el enlace en cliente, pero antes de mostrar el resumen final se recomienda:

```http
POST /api/v1/storefront/sites/{hostname}/cart/quote/
```

Body: líneas `{product_id, quantity}`. Django retorna nombre, precio vigente, disponibilidad, subtotales y una versión/firma corta. El navegador no envía precios confiables. Si el MVP inicial omite esta llamada, el WhatsApp debe etiquetarse como solicitud de cotización, no pedido confirmado.

## API privada CMS

Todos los endpoints requieren JWT scoped y permiso. El website se busca por empresa del token; los IDs del body no cambian el scope.

```text
GET/PATCH  /api/v1/websites/current/
GET/POST   /api/v1/websites/current/pages/
GET/PATCH/DELETE /api/v1/websites/current/pages/{id}/
PUT        /api/v1/websites/current/pages/{id}/sections/
POST       /api/v1/websites/current/pages/{id}/preview-token/
POST       /api/v1/websites/current/pages/{id}/publish/
GET/POST   /api/v1/websites/current/domains/
POST       /api/v1/websites/current/domains/{id}/verify/
PATCH      /api/v1/websites/current/domains/{id}/primary/
GET/POST   /api/v1/websites/current/menus/
GET/POST   /api/v1/websites/current/media/
GET/PATCH  /api/v1/websites/current/settings/
GET/POST   /api/v1/websites/current/products/
PATCH/DELETE /api/v1/websites/current/products/{id}/
```

La actualización de secciones debe ser transaccional y validar una versión esperada:

```json
{
  "expected_version": 7,
  "sections": [
    {"id": "uuid-or-null", "type": "hero.v1", "position": 0, "enabled": true, "config": {}}
  ]
}
```

Conflicto: 409 `VERSION_CONFLICT`. Referencia cruzada de otra empresa: responder 404 para no revelar existencia.

### Medios

Flujo recomendado:

1. CMS solicita upload firmado/autorizado.
2. Django valida tipo/tamaño y genera key con website.
3. Cliente sube a R2 o Django procesa el archivo.
4. Django confirma checksum/dimensiones y crea `WebsiteMedia`.

Reutilizar validaciones y generación de thumbnails existentes en inventario, extrayéndolas a servicio compartido cuando corresponda.

## Webhook de revalidación

Django -> Next:

```http
POST /api/revalidate/storefront/
X-ApuDig-Timestamp: ...
X-ApuDig-Signature: hmac-sha256(...)
```

Body con `website_id`, `publication_version` y tags permitidos. Next valida timestamp, firma y allowlist; nunca acepta tags arbitrarios del navegador.

## Cambios Django por archivo/app

- Nueva `apps/websites/`: modelos, migraciones, serializers, permissions, selectors, services, views, urls y tests.
- `config/settings.py`: registrar app y secretos de webhook/dominios mediante entorno.
- `apps/api/v1/urls.py`: incluir namespaces nuevos.
- `apps/api/v1/catalog/views.py`: deprecar o cerrar endpoints inseguros.
- `apps/api/v1/inventory/views.py`: proteger productos administrativos.
- `apps/inventory/tests/test_catalog_api.py`: añadir aislamiento y regresión de campos privados.
- Semillas de permisos: incorporar permisos website respetando el patrón actual.

## Códigos de respuesta esenciales

| Caso | Código |
| --- | --- |
| Host desconocido/inactivo | 404 |
| Falta contexto requerido en endpoint interno | 400/404, nunca lista global |
| No autenticado CMS | 401 |
| Sin permiso en empresa activa | 403 |
| Recurso de otra empresa | 404 |
| Dominio duplicado | 409 |
| Config de bloque inválida | 400 con `fields` |
| Versión desactualizada | 409 |
| Rate limit público | 429 |

## Compatibilidad/migración

Mantener `/api/v1/catalog/*` solo durante la transición de la tienda actual, pero exigir un selector de tenant validado o redirigir internamente al nuevo selector. No aceptar nuevos consumidores. El frontend migra primero a `storefrontService`; después se retiran los contratos genéricos cuando métricas confirmen cero uso.
