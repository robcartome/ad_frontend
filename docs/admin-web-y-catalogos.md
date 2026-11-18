# Separación del administrador web, ERP y catálogos

Actualización18/11/2026: por solicitud del usuario, `/catalog` vuelve a mostrar en el modal las listas de precios de venta activas y el stock por almacén, igual que `/admin/catalog_admin`, sin precio de compra. Django entrega estos datos a los miembros autorizados de la empresa (incluidos SELLER/CASHIER y sin rol); conserva ámbito de sucursal, empresa activa y membresía vigente. Proveedores y compra siguen en la API administrativa; `/shop` no cambia. El modal existente ya renderiza price_list/stock_by_warehouse, por lo que no se duplicó la interfaz ni se utilizó el endpoint privado para usuarios comunes.

Cancelaciones HTTP: la limpieza de efectos de React mantiene AbortController para impedir respuestas antiguas; el transporte JSON propaga la cancelación sin console.error y el listado/modal la ignoran como resultado esperado. Se conservan status/code/fields/ETag de errores reales. Sin cambios de autenticación, modelos, migraciones o datos habituales. Tests de transporte en `tests/json-request.test.mjs`.

Dashboard compartido (17/11/2026): todos los usuarios con sesión/contexto autorizado conservan Inicio, sidebar y cabecera en `/admin`. Solo se ocultan las entradas/tarjetas restringidas: gestión de página web según permisos CMS y catálogo interno para ADMIN de empresa/superusuario. El dashboard adapta su contenido; una URL denegada conserva el panel y permite volver al inicio. Textos visibles usan APUDIG, sin tecnologías o nombres de repositorio. El registro comercial, datos de cliente y pedidos WhatsApp son el siguiente flujo previsto, aún no implementado: [detalle y validación](dashboard-y-registro-clientes.md).

Política vigente posterior al ajuste P0 (17/11/2026): `/catalog` está disponible para todos los miembros activos de la empresa, sin exigir rol, con login y empresa seleccionada. AdminLayout y Sidebar no muestran vistas/accesos administrativos de empresa a usuarios comunes, incluso por URL directa. Los permisos CMS explícitos siguen separados. Catálogo privado solo ADMIN de empresa/superusuario. El futuro registro de clientes verificados y sus precios mayoristas/distribución aún no está implementado; ver informe backend18.

Actualización P0 (17/11/2026): se conservan las rutas y presentación laboral; `/catalog` ahora exige el login existente y empresa seleccionada. `/admin/catalog_admin` obtiene datos privados únicamente para superusuario/administrador de empresa, verificados por Django. Se eliminó la caché compartida del detalle y se reinician solicitudes/datos al cambiar contexto. Los párrafos históricos siguientes describen la separación original, no una autorización anónima vigente. Entrega: `apudig_mvp/docs/architecture/website-integration/17-remediacion-p0-catalogos.md`. B4-B y comercio siguen pendientes.

Fecha: 12/11/2026 (America/Lima). Decisión solicitada por el usuario: `apudig_mvp` administra el ERP desde Django; Next.js administra la web y conserva ambos catálogos existentes.

## Responsabilidad de cada vista

| Ruta | Responsabilidad | Fuente / comportamiento |
| --- | --- | --- |
| `/admin` | Inicio de administración web | Accesos al editor y catálogos; sin tarjetas de gestión ERP |
| `/admin/website` | Administrar página web | Entrada visible para usuarios autenticados; capacidades verificadas dentro de la página |
| `/admin/website/preview` | Vista previa editorial | Protegida por sesión, empresa y permisos web |
| `/admin/catalog_admin` | Catálogo administrativo existente | Se conserva componente, flag `isAdmin`, servicios y presentación |
| `/catalog` | Catálogo habitual para trabajadores | Página y layout anteriores restaurados desde HEAD de la base; conserva búsqueda, filtros, scroll, modal y API existente |
| `/shop` | Productos del website comercial | Diseño naranja/blanco y datos demo aislados |
| `/shop/[id]` | Ficha de producto del website | Reemplaza la ruta demo `/catalog/[id]`; no se mezcla con el catálogo laboral |
| `/`, `/about`, `/contact`, `/cart` | Website comercial | Sus enlaces de productos/búsqueda/cotización apuntan a `/shop` |
| `/login` | Acceso existente | Contrato de autenticación sin cambios |

`/catalog` vive en el route group `(catalog)`, con el layout anterior. `(public)` conserva el layout comercial y `/shop`. Los grupos no forman parte de las URLs. El catálogo laboral no hereda el banner de demostración, carrito ni metadata noindex de la tienda demo. El layout anterior mantiene sus propios enlaces históricos.

## Sidebar y dashboard

Menú principal: Inicio, Administrar página web, Catálogo interno. Accesos públicos en otra pestaña: Ver página web, Productos del website y Catálogo para trabajadores.

Se retiran del menú Productos, Categorías, Marcas, Almacenes, Socios, Inventario, Ventas, Reportes y Administración ERP. Se conservan sus archivos para no eliminar trabajo histórico. Si se abren sus URLs directamente, el layout muestra una vista informativa de transición a Django en lugar de montar sus formularios/listados ERP. No se inventa una URL del ERP ni se deriva automáticamente del host de la API. `/admin/catalog_admin` está expresamente excluida de esta transición.

El dashboard reemplaza las tarjetas Productos/Stock/Reportes por accesos de contenido web y catálogos. Se retira el enlace de perfil a `/admin/administration`, que correspondía al contexto ERP antiguo y no tenía una página de perfil propia.

## Permisos del editor

Mostrar el acceso no concede permiso sobre el contenido. Se conservan AuthGuard, sesión y empresa seleccionada.

| Capacidad | Comportamiento |
| --- | --- |
| Sin permisos web | El menú y la tarjeta se ven; la página muestra un estado de acceso restringido sin montar editor o preview |
| `websites.view_website` | Consultar borrador/preview; no editar ni aplicar |
| `websites.change_website` | Editar/guardar borrador; aplicar requiere permiso de publicación |
| `websites.publish_website` | Consultar/aplicar versión guardada; editar requiere permiso de edición |
| Administrador/superusuario | Mantiene las capacidades completas previstas en la implementación anterior |

Estos son controles frontend de la demo. Django deberá comprobar pertenencia de empresa y permisos de cada operación cuando se conecte la API. No se modifica el catálogo administrativo con estos permisos nuevos.

## Compatibilidad del contenido editorial local

El documento editorial pasa a `schemaVersion: 2`. Los documentos v1 se adaptan al leer: los enlaces de banners/campañas que antes apuntaban al storefront `/catalog`, sus queries o fichas cambian a `/shop`. Se mantienen textos, imágenes, productos, revisión y separación borrador/aplicada.

La lectura no sobrescribe localStorage. La siguiente escritura guarda la versión normalizada. La clave de almacenamiento `apudig:website:v1:...` permanece estable: ese v1 corresponde al contenedor local, no al esquema del documento. No se modifica el carrito ni el catálogo laboral. Los enlaces a `/catalog` que un editor cree expresamente bajo esquema v2 se respetan.

## Elementos protegidos y comprobación

Se compararon con HEAD, sin cambios:
- `src/app/(admin)/admin/catalog_admin/page.js`.
- `src/components/catalog/CatalogPage.jsx`.
- `src/components/admin/ProductCard.jsx` y `ProductDetailModal.jsx`.
- `src/services/productsService.js` y `api.js`.

La nueva página `src/app/(catalog)/catalog/page.js` y su layout son copias del contenido original de `src/app/(public)/catalog/page.js` y `src/app/(public)/layout.js` de HEAD. No se incorporaron datos demo, filtros nuevos ni cambios de API a esos componentes.

## Continuidad

Leer también `storefront-plan-y-avances.md` y `website-cms-backend-plan.md`. Las restricciones de demo editorial y la integración Django pendiente siguen vigentes. No se modifica backend, no se despliega y no se elimina el código de los módulos ERP antiguos.

Verificar manualmente con una sesión válida el sidebar en móvil/escritorio, los permisos, la transición de URLs ERP y los precios reales de `/catalog` y `/admin/catalog_admin`. Las comprobaciones de build/HTTP no prueban la respuesta del backend de producción.

Verificaciones de esta entrega: lint y build correctos, 17 pruebas de lógica correctas y smoke de 16 rutas/casos HTTP correcto. El smoke distingue layout/metadata del catálogo laboral de los del storefront. La revisión visual y la consulta real de precios con sesión/backend siguen pendientes.
