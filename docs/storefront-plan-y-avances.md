# APUDIG storefront — plan y continuidad

Última actualización: 12 de noviembre de 2026 (America/Lima).

**Estado actual:** el panel Next administra la web y mantiene los catálogos laborales. `/catalog` recupera su vista anterior; `/admin/catalog_admin` no se modifica; el storefront comercial usa `/shop` y `/shop/[id]`. El editor `/admin/website` comprueba permisos dentro de la página, guarda borradores locales y no publica en `/`. Leer la entrega 3 al final, [las decisiones de rutas](admin-web-y-catalogos.md) y [el plan Django](website-cms-backend-plan.md) antes de continuar.

## Cómo retomar desde otra PC

1. Abrir este archivo antes de editar. Repositorio de trabajo: `ad_frontend`, rama comprobada `mvp_production`. No confundir con `mp_production`.
2. Revisar `git status`, cambios locales e instrucciones AGENTS.md. No cambiar rama ni sobrescribir trabajo ajeno.
3. Leer `docs/integration-matrix.md` y las secciones de decisiones y pendientes de este documento.
4. Usar Node.js 22 y `npm ci` con el lockfile existente. En PowerShell, usar `npm.cmd` si la política bloquea `npm.ps1`.
5. Configurar el entorno administrativo según `.env.example`, sin copiar secretos a documentación. El storefront demo funciona sin API.
6. Ejecutar `npm run lint`, `npm run build` y `node --test tests/commerce.test.mjs`. Iniciar con `npm run dev`.
7. Actualizar este documento después de cada entrega: archivos, pruebas realmente ejecutadas, límites y próximo paso concreto.

Los archivos deben viajar mediante Git (commit/push realizados por el usuario o por instrucción explícita) para estar disponibles en otra PC. Un documento local por sí solo no sincroniza cambios.

## Objetivo y límites autorizados

Evolucionar Next.js existente a storefront de ferretería configurable por empresa. Conservar `/admin`, `/login`, autenticación y módulos ERP. Solo frontend; sin Django, migraciones, pagos, otro CMS, despliegues ni integraciones externas.

Primera referencia: Ferretería Tolentino – La Soledad. Identidad naranja/blanco inspirada en patrones comerciales de Promart, sin copiar sus activos. El usuario reemplaza la propuesta inicial de azul marino por `#FF8000`, blanco, `#F2F2F2` y fondo `#F5F5F6`.

## Plan

| Etapa | Entrega | Estado |
| --- | --- | --- |
| A | Auditoría acotada, contratos y línea base | Completada; lint inicial correcto |
| B | Tokens públicos, configuración, header, home, footer y responsive | Implementada; revisión visual pendiente |
| C | Catálogo, ficha e integración mediante adaptador seguro | Catálogo/ficha demo implementados; API real pendiente |
| D | Carrito persistente por tienda y solicitud WhatsApp | Implementado y probado a nivel de lógica; envío bloqueado en demo |
| E | Nosotros, contacto, SEO demo y accesibilidad | Implementada base; auditoría visual/teclado pendiente |
| F | Pruebas, build, revisión visual y documentación final | Lint/build/pruebas/HTTP correctos; revisión visual pendiente |

## Hallazgos iniciales

- Next declarado `^16.0.10`, React `19.1.0`, Tailwind 4, Radix y Lucide disponibles. Mantener JavaScript y dependencias actuales.
- Home/layout tenían nombre de empresa y año fijos; home presentaba el ERP en lugar del comercio.
- `components/catalog/CatalogPage.jsx` sirve también al catálogo administrativo. Conservar su comportamiento privado.
- Filtros de marca/categoría existentes solo filtran páginas ya cargadas.
- `components/admin/ProductDetailModal.jsx` comparte caché por ID entre uso público/privado y contempla almacenes internos. El nuevo storefront no debe usar ese modal ni esa caché.
- `services/api.js` adjunta token administrativo desde localStorage. No usarlo como cliente público SSR.
- La matriz existente registra contratos administrativos faltantes. No atribuir su ausencia al storefront.
- El documento de requisitos advierte que el catálogo público podría devolver productos de varias empresas. No se ha validado con HTTP en esta entrega. No conectarlo hasta verificar aislamiento.
- No se encontró `docs/architecture/` en el frontend inspeccionado. No crear un CMS paralelo ni asumir que un CMS está integrado.

## Decisiones

- Configuración de tienda resuelta en servidor desde lista local explícita; no inferir autorización de Host o query string.
- Fuente demo única y aislada, sin fallback silencioso a API. Mostrar aviso demo y `noindex` en rutas públicas.
- Rutas públicas nuevas separadas de componentes administrativos, reutilizando UI genérica y bibliotecas instaladas.
- Colores y estilos limitados al contenedor `.storefront`; no alterar tokens globales del ERP.
- Carrito React + localStorage versionado por tienda. Persistir solo ID/cantidad; reconstruir precios y datos desde fuente actual antes de cotizar.
- Número de WhatsApp sin inventar: mantener acción deshabilitada hasta configurar un número comercial verificado. Demo no se envía a un teléfono real.
- Ilustraciones SVG locales propias como sustitutos identificados de fotografías reales; sustituir por material autorizado al integrar catálogo.

## Contrato backend pendiente (documentar, no implementar Django)

Resolución confiable de tienda publicada y dominio validado; ID estable, identidad, contacto verificado y SEO. Listado/detalle públicos filtrados en servidor por tienda y estado publicado; solo precio comercial, unidad, imágenes y disponibilidad autorizada. Sin costos, almacenes o listas privadas. Búsqueda, marca, categoría, orden y paginación con semántica global documentada. Caché separada por tenant y acceso público/privado. Verificar que un producto de otra tienda devuelve 404. Ningún token administrativo debe viajar por el cliente público.

## Archivos y rutas entregados — entrega 1 (storefront)

Modificados: `README.md`, `src/app/(public)/layout.js`, `src/app/(public)/page.js`, `src/app/(public)/catalog/page.js`.

Nuevos:
- `AGENTS.md`: indica a futuros agentes leer este registro y actualizarlo después de cada entrega.
- `src/app/(public)/storefront.css`: estilos públicos y breakpoints para móvil, tablet y escritorio.
- `src/app/(public)/error.js`: recuperación de errores de navegación pública.
- `src/app/(public)/catalog/layout.js`, `catalog/not-found.js` y `catalog/[id]/{page,not-found}.js`: ficha por identificador estable y límite de producto inexistente.
- `src/app/(public)/{cart,about,contact}/page.js`.
- `src/components/storefront/{StoreHeader,StoreFooter,StoreHome,ProductArt}.jsx`.
- `src/components/commerce/{CartProvider,ProductCard,StoreCatalog,ProductPurchase,CartPage}.jsx`.
- `src/data/demo/storefront.js`: 8 productos y 6 categorías ilustrativos.
- `src/lib/storefront/store.js`: fuente/configuración explícita solo servidor.
- `src/lib/commerce/cart.mjs`: validación, persistencia versionada, precios y mensaje de cotización.
- `tests/commerce.test.mjs` y `tests/storefront-smoke.mjs`.

Rutas: `/`, `/catalog`, `/catalog/[id]`, `/cart`, `/about`, `/contact`. Se conserva `/admin` y `/login`. Se usa ID porque no se ha verificado un slug comercial real. No se ha modificado código administrativo, servicios existentes, autenticación, backend ni dependencias.

## Verificaciones realizadas — entrega 1 (12/11/2026)

- `npm.cmd run lint`: correcto antes y después de cambios.
- `npm.cmd run build`: correcto; genera rutas públicas y administrativas.
- `node --test tests/commerce.test.mjs`: 5 pruebas correctas. Cubren separación por tienda, versiones/corrupción, IDs eliminados/duplicados, cantidades inválidas, datos manipulados, mensaje y bloqueo/codificación WhatsApp.
- HTTP sobre build de producción: páginas públicas y `/login`, `/admin` responden 200; producto inexistente devuelve 404 con mensaje en payload RSC. Verificados filtro de herramientas (2 resultados), búsqueda vacía y `noindex` público. No se ejecutaron operaciones ERP autenticadas.
- `/admin` y `/login` no incluyen header comercial en su HTML. Esto comprueba separación de layouts, no reemplaza una regresión administrativa con sesión y backend.
- Aviso informativo preexistente de datos antiguos de `baseline-browser-mapping`; no se actualizaron dependencias por este aviso.
- Build inicial detectó un paréntesis sobrante de CSS; corregido. Se retiró un `loading.js` general para evitar que una respuesta de producto inexistente comenzase como 200 por streaming; carrito mantiene estado de carga propio.
- Revisión visual automatizada NO completada: el host de acceso a navegadores no estaba disponible y el fallback Windows detuvo Computer Use al no poder verificar la URL activa con suficiente confianza. No se capturaron pantallas ni se verificó consola, teclado o persistencia en navegador. No continuar esa automatización en el mismo turno.

Para repetir el smoke test: ejecutar `npm run build`, iniciar `npm start` y, en otra terminal, `node tests/storefront-smoke.mjs http://localhost:3000`.

## Próximo paso concreto y pendientes

1. Iniciar `npm run dev` y revisar visualmente `/`, catálogo, detalle y carrito en 320, 375, 768, 1024 y 1440 px. Comprobar desbordamientos, menú móvil, filtros, foco y consola.
2. Probar en navegador agregar, cantidades, eliminación, recarga, pestañas y localStorage bloqueado. La lógica tiene pruebas unitarias; las interacciones reales siguen pendientes.
3. Confirmar nombre comercial definitivo, logo/fotografías autorizadas, marcas, dirección, horarios y WhatsApp. No hay marcas comerciales ni ofertas inventadas. El banner y textos actuales son presentación demo, no CMS integrado.
4. Verificar el contrato seguro de catálogo público y documentar resultados. Reemplazar el adaptador demo con datos comerciales permitidos solo después de demostrar aislamiento entre empresas. No basta ocultar campos internos en JSX.
5. El editor local de banners/secciones ya está implementado en la entrega 2. Su conexión productiva requiere recuperar las fuentes del CMS previo y seguir `website-cms-backend-plan.md`; no crear otro CMS.
6. Al activar datos reales: revalidar contra fuente segura antes de cotizar, habilitar teléfono verificado y después revisar canonical, Open Graph, sitemap/robots y política de publicación. Actualmente todo el storefront es `noindex` y WhatsApp bloquea el modo demo.
7. Comprobar regresión administrativa con backend y usuario de prueba autorizado. Sin pagos, ventas automáticas, reservas, dominios reales ni despliegues en esta entrega.

Estado para entrega: base funcional de storefront demo implementada; validación visual e integración productiva pendientes. No se realizó commit/push ni despliegue. El usuario debe sincronizar estos archivos para retomarlos en otra PC.

## Entrega 2 — Gestión de página web (12/11/2026)

### Autorización y alcance

El usuario solicitó interfaz editorial dentro de `/admin`, banners/promociones y preparación para integrar con `apudig_mvp`, además de un plan backend. Se amplía la etapa frontend con un módulo editorial integrado al ERP; no se cambió Django, autenticación, productos, precios o inventario. No se instaló un CMS adicional ni dependencias.

### Funcionalidad implementada

- Acceso **Página web** en sidebar y tarjeta del dashboard, para administradores/superusuarios o permisos `websites.view_website`, `websites.change_website`, `websites.publish_website` según acción. AuthGuard existente conserva sesión y empresa. Son controles frontend; Django deberá aplicar la autorización real.
- `/admin/website`: resumen, identidad visual, banners, campañas, secciones, contacto y SEO.
- Banners: alta/baja, visibilidad, orden, textos, botón, enlaces internos, URLs de imagen móvil/escritorio, alt y fallback ilustrado. Sin subida de archivos todavía.
- Campañas: textos, enlaces, productos demo relacionados, visibilidad y vigencia en hora Lima, sin modificar precios ni aplicar descuentos.
- Secciones: orden, título y visibilidad. Identidad: nombre, logo, color y barra informativa. Contacto y datos SEO editables.
- Borrador separado de snapshot aplicado a demo. Guardado local versionado por empresa/web, actividad local, validación, conflictos entre pestañas y recuperación de la versión aplicada al formulario.
- Vista previa inline del último formulario válido, más rutas protegidas de borrador guardado y versión aplicada. Se reutilizan Home, header/footer, banners y tarjetas. Contenido visual inerte: no permite comprar ni seguir enlaces dentro de la preview. El iframe conserva autenticación y no incluye el sidebar ERP.
- PostMessage de vista previa valida origen, ventana y empresa; no contiene tokens. Cambio de empresa remonta editor/preview para no compartir formulario.
- `createDjangoWebsiteRepository` prepara métodos/request de contrato futuro. No se instancia ni hace llamadas a endpoints inexistentes.

### Archivos de esta entrega

Nuevos:
- `src/app/(admin)/admin/website/{layout,page}.js`, `website-editor.css` y `preview/page.js`.
- `src/components/admin/website/WebsiteEditor.jsx`, `WebsiteFields.jsx`, `WebsiteAccess.jsx`, `WebsitePreview.jsx`, `WebsiteAdminEntry.jsx`, `useWebsiteAccess.js`.
- `src/components/storefront/StoreHero.jsx`.
- `src/lib/website/content.mjs` y `src/services/websiteRepository.mjs`.
- `tests/website.test.mjs` y `docs/website-cms-backend-plan.md`.

Modificados:
- Dashboard `src/app/(admin)/admin/page.js`, `components/layout/Sidebar.jsx` y `AdminLayout.jsx` (solo acceso al módulo y chrome de preview; conserva AuthGuard).
- `StoreHome.jsx`, `StoreHeader.jsx`, `StoreFooter.jsx` y `src/app/(public)/storefront.css` para renderizar contenido estructurado reutilizable. La home pública usa defaults demo en servidor; no lee borradores de localStorage.
- `tests/storefront-smoke.mjs`, README, AGENTS y este registro.

### Backend verificado y plan

Inspección de solo lectura: existen Company/Store/CompanyBranding y las bases de API por empresa. La carpeta `apudig_mvp/apps/websites` contiene únicamente artefactos `__pycache__` en este checkout, sin fuentes de sus modelos/servicios/migraciones. El namespace editorial no está montado en `apps/api/v1/urls.py`. No asumir que las clases o contratos históricos están disponibles.

Plan detallado en `website-cms-backend-plan.md`: fase 0 recuperar/conciliar CMS previo; fase 1 dominio/permisos; fase 2 API y concurrencia transaccional; fase 3 media/campañas; fase 4 storefront público y Next SSR; fase 5 pruebas y activación gradual. Incluye esquema DTO, endpoints propuestos, ETag/If-Match, errores, aislamiento y criterios de aceptación. Los enlaces de Odoo/Strapi consultados están incluidos allí.

### Verificaciones de esta entrega

- Rama comprobada: `mvp_production`; se conservaron cambios anteriores sin commit.
- `npm.cmd run lint`: correcto después de todos los cambios.
- `npm.cmd run build`: correcto, incluye `/admin/website` y `/admin/website/preview`.
- `node --test tests/commerce.test.mjs tests/website.test.mjs`: **14 pruebas correctas** (5 carrito + 9 contenido/repositorios). Aislamiento, snapshots, corrupción, cuotas, conflictos, URLs, accesibilidad de media, fechas Lima, referencias y precondiciones HTTP del adaptador propuesto.
- Smoke sobre build de producción: **13 rutas/casos correctos**. Nuevas rutas editoriales responden 200 con la protección cliente existente; no se realizó login ni se verificó una sesión autenticada en navegador. Catálogo inexistente responde 404; filtros y noindex demo siguen correctos. El servidor temporal del smoke se cerró.
- Inspección visual pendiente: host de acceso a navegadores no disponible; la ventana de catálogo detectada estaba minimizada y no pudo capturarse. No se eludió autenticación, no se alteraron sesiones y no se validaron responsive, iframe, teclado o consola mediante navegador en esta entrega.
- Se mantiene el aviso informativo preexistente de `baseline-browser-mapping`, sin actualizar dependencias.

### Próximo paso al retomar

1. Con una sesión administrativa existente y empresa seleccionada, abrir `/admin/website`. Revisar escritorio y móvil y confirmar funcionamiento de editor/iframe.
2. Cambiar un banner, guardar borrador, aplicar a demo y revisar `source=published`; editar de nuevo y comprobar que la versión aplicada permanece igual. Recargar, cambiar de empresa y probar conflictos de pestañas/cuota de almacenamiento.
3. Revisar también roles de solo lectura, edición y publicación; no introducir bypasses de AuthGuard para visualizar el módulo.
4. Recuperar fuentes autorizadas de `apps/websites` y conciliar migraciones antes de iniciar backend. No crear modelos duplicados a partir de los `.pyc`.
5. Conectar repositorio Django y SSR público solo después de pruebas de tenant. Entonces sustituir etiquetas demo, adaptar estados/errores/descubrimiento del website ID, habilitar media e indexación según publicación real.

**Limitación vigente:** guardar/aplicar en el editor modifica únicamente datos de este navegador y su preview protegida. No modifica `/`, no sincroniza otros equipos y no publica en Internet. La funcionalidad editorial real compartida depende del backend planificado. Mantener esta distinción visible al usuario hasta integrar Django.

## Entrega 3 — Admin web y conservación de catálogos (12/11/2026)

### Solicitud y decisiones actuales

El usuario aclara que el ERP se trabaja desde Django/apudig_mvp, pide limpiar el administrador Next, mostrar siempre el acceso al editor y controlar contenido por permisos dentro de la página. **No modificar `/admin/catalog_admin` ni sustituir la vista anterior de `/catalog`, usada en producción por trabajadores.** Crear otra ruta para productos del website.

Implementado:
- Sidebar reducido a Inicio, Administrar página web y Catálogo interno; accesos públicos separados a `/`, `/shop` y `/catalog`. Cierre móvil al navegar, indicador de ruta activa y etiquetas accesibles en modo compacto.
- Entrada editorial visible para usuarios autenticados incluso sin permisos web; `WebsiteAccess` mantiene la restricción antes de montar editor o preview. Lectura/edición/aplicación conservan sus permisos separados.
- Dashboard dedicado a contenido web y catálogos, sin tarjetas de Productos/Stock/Reportes ERP. Se retira el enlace de perfil que apuntaba al contexto de administración antiguo.
- Los módulos ERP anteriores salen del menú. Sus archivos permanecen; el layout muestra una vista de transición a Django al visitar sus URLs, sin montar los formularios antiguos. `/admin/catalog_admin` y las rutas web están excluidas expresamente.
- `/catalog` vuelve a usar página y layout anteriores copiados de HEAD, bajo `src/app/(catalog)/`. No hereda layout comercial ni noindex demo.
- El catálogo comercial y sus fichas se trasladan a `src/app/(public)/shop/`, URLs `/shop` y `/shop/[id]`. Home, búsqueda, categorías, carrito, relacionados y enlaces del editor se actualizan a esa ruta.
- Documento editorial `schemaVersion: 2`, con adaptación de versiones locales v1 para cambiar sus destinos de storefront antiguos a `/shop`. No se pierden textos, referencias o separación de borrador/aplicada. La lectura no sobrescribe localStorage; links laborales creados explícitamente en v2 se mantienen.

### Archivos principales

Nuevo layout/página laboral: `src/app/(catalog)/layout.js`, `src/app/(catalog)/catalog/page.js`. Rutas comerciales movidas: `src/app/(public)/shop/{page,layout,not-found}.js` y `[id]/{page,not-found}.js`.

Nuevos: `src/lib/admin/routes.mjs`, `src/components/admin/ErpModuleNotice.jsx`, `tests/admin-routes.test.mjs`, `docs/admin-web-y-catalogos.md`.

Actualizados: Sidebar, Topbar, AdminLayout, dashboard/metadata administrativos, entrada/estado de permisos del editor, enlaces de componentes storefront/commerce y páginas informativas, modelo/repositorio editorial, tests website/smoke, README, AGENTS y documentación.

### Verificaciones

- Comparación con HEAD confirma que **no cambiaron** la página `/admin/catalog_admin`, `CatalogPage`, `ProductCard`/`ProductDetailModal` administrativos ni `productsService.js`/`api.js`. La página y layout de `/catalog` son copias exactas de la base (normalizando solo finales de línea en la comprobación de archivos existentes).
- `npm.cmd run lint`: correcto. `npm.cmd run build`: correcto, rutas `/catalog`, `/shop` y `/shop/[id]` separadas.
- `node --test tests/commerce.test.mjs tests/website.test.mjs tests/admin-routes.test.mjs`: **17 pruebas correctas**. Incluyen compatibilidad de documentos editoriales v1 y exclusión de los catálogos de la transición ERP.
- Smoke: **16 rutas/casos HTTP correctos**, con vista laboral y branding anteriores en `/catalog`, sin banner demo ni noindex, y catálogo comercial en `/shop`. No se prueba la respuesta real de la API de producción ni una sesión administrativa con estas comprobaciones HTTP.
- No se realizó revisión visual/autenticada en navegador en esta entrega. Mantener pendiente responsive real, permisos de cuenta y verificación de precios con backend disponible.
- No se cambió Django, autenticación, datos de productos, precios o almacenes. No se desplegó, no se cambió de rama ni se alteró el índice Git con los cambios que el usuario ya tenía preparados.

### Próximo paso

1. Validar con la sesión habitual el sidebar y permisos del editor; comprobar transición al abrir una URL ERP antigua.
2. Con backend disponible, revisar precios/modal/filtros en `/catalog` y `/admin/catalog_admin`. No rediseñar ni mover sus APIs al integrar `/shop`.
3. Revisar `/shop`, búsqueda, fichas y carrito, además de borradores locales previos con enlaces adaptados.
4. Continuar el plan Django editorial recuperando primero sus fuentes históricas. La integración productiva corresponde al storefront nuevo, sin sustituir el catálogo laboral.

## Entrega 4 — Tarjetas y categorías mobile first (12/11/2026)

Rama observada: `mvp_website`, árbol limpio al inicio; no se cambió de rama. Nueva prioridad del usuario: contraste azul `#003366` sobre naranja `#FF8000` y blanco. Se actualizaron tarjetas, categorías, panel lateral Radix, imágenes con respaldo, ofertas en ficha y datos demo de descuentos. Catálogos laborales conservados.

Se añadieron DTOs públicos y factorías de servicios reexportadas desde `productsService.js` y `categoriesService.js`. No se conectó la tienda a endpoints existentes ni se modificaron las funciones laborales. El contrato propuesto, archivos, límites y activación pendiente están en [storefront-catalog-api.md](storefront-catalog-api.md).

Verificado: lint/build correctos, 21 pruebas correctas (incluidas 4 nuevas de DTO/transporte público), 16 casos HTTP correctos en puerto 3001. Advertencia preexistente de baseline-browser-mapping sin actualizar dependencias.

Revisión visual NO completada: host de navegador no disponible y Computer Use detuvo el intento al no poder verificar la URL activa de Chrome. No afirmar validación visual móvil ni interacciones. Pendiente revisar 320/375/768/1024/1440 px, panel/Escape/foco, imágenes y carrito. API real, paginación remota, permisos, CMS Django y demás pendientes anteriores siguen abiertos. No hubo commit, push ni despliegue.
