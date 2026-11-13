# Productos y categorías del website

Entrega: 12/11/2026. La tienda continúa en modo demo. No se activaron endpoints ni se modificó Django.

## Presentación

Texto principal azul `#003366`, acciones naranja `#FF8000`, blanco y superficies claras. Tarjetas con precio anterior, porcentaje redondeado hacia abajo, ahorro, etiqueta opcional, unidad y disponibilidad. Los descuentos solo aparecen cuando el precio anterior supera al actual. Tres productos demo tienen precios anteriores ilustrativos; el aviso demo permanece visible. No se inventan reseñas ni disponibilidad.

Categorías en cuadrícula móvil de tres columnas y panel lateral accesible Radix Dialog en móvil/escritorio: Escape, foco contenido y retorno al botón. El panel muestra todas las categorías recibidas. Fotografías HTTPS opcionales de productos/categorías con respaldo SVG si fallan. Dos productos por fila en móvil; la ficha muestra la misma oferta que la tarjeta.

## Servicios preparados

`productsService.js` reexporta `createStorefrontProductsService`; `categoriesService.js` reexporta `createStorefrontCategoriesService`. Sus funciones anteriores conservan el contrato laboral. Para SSR público importar directamente los módulos `storefrontProductsService.mjs` y `storefrontCategoriesService.mjs`, evitando cargar `api.js`.

Las factorías reciben `{ baseUrl, storeId, fetchImpl? }`. El transporte usa `credentials: 'omit'`, sin token, `cache: 'no-store'`, señal de cancelación opcional, y lanza errores sin sustituirlos por demo. No se instancian con una API real. `store.js` normaliza la fuente demo al mismo DTO.

Contrato **propuesto**, pendiente de acordar y verificar en backend:

- `GET {baseUrl}/stores/{storeId}/products/?search=&category=&brand=&ordering=name&limit=24&offset=0`
- `GET {baseUrl}/stores/{storeId}/products/{id}/`
- `GET {baseUrl}/stores/{storeId}/categories/?limit=100&offset=0`

Listas: `{ store_id, count, results: [...] }`. Detalle: `{ store_id, product: {...} }`. El servicio comprueba tienda, estructura paginada e ID solicitado; el servidor debe aplicar el aislamiento real. No pasar respuestas administrativas como fuente pública.

Producto: `id`, `name`, `brand` (texto u objeto con `name`), `category` (ID u objeto con `id`), `sku`, `price`, `original_price`, `unit`, `description`, `image_url`, `image_alt`, `badge`, `availability` (`available`, `unavailable`, desconocida por defecto). Precios decimales string se convierten a números; ausentes o inválidos quedan `null`. Los campos privados se descartan mediante selección explícita.

Categoría: `id`, `name`, `description`, `icon`, `image_url`, `parent_id`. Los IDs son strings; iconos desconocidos tienen respaldo en el panel. `parentId` queda preparado como metadato; la navegación actual es plana.

## Activación pendiente

Verificar endpoints, publicación por tienda, aislamiento y 404 entre empresas. Cambiar la resolución de fuente en servidor a asíncrona y conectar consumidores, ficha y carrito con la misma fuente segura. Llevar búsqueda/filtros/orden/paginación al servidor; `StoreCatalog` aún filtra el conjunto demo completo en memoria y no debe recibir una sola página de API como si fuera el catálogo entero. Para categorías paginadas, cargar el conjunto necesario para navegación o añadir carga progresiva. Revalidar precio y disponibilidad al cotizar. Estos pasos no se consideran integración real completada.

## Verificaciones

- `npm.cmd run lint`: correcto.
- `npm.cmd run build`: correcto (Next 16.0.10; Node instalado v20.20.1).
- `node --test tests/commerce.test.mjs tests/website.test.mjs tests/admin-routes.test.mjs tests/storefront-api.test.mjs`: 21 pruebas correctas.
- `node tests/storefront-smoke.mjs http://localhost:3001`: 16 casos HTTP correctos, incluido 404 y separación de catálogos.
- Revisión visual e interacciones de navegador: **pendientes**. Browser host no disponible; Computer Use detuvo el intento porque no pudo verificar con suficiente confianza la URL activa de Chrome. No se capturaron pantallas ni se verificaron viewport, teclado, persistencia o consola.

Referencias consultadas: [Promart](https://www.promart.pe/) y [Falabella](https://www.falabella.com.pe/falabella-pe), además de las imágenes aportadas. Se tomaron patrones de navegación, categorías y jerarquía comercial, sin copiar activos.
