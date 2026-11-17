# APUDIG storefront — plan y continuidad

Dashboard compartido (17/11/2026, posterior al ajuste de miembros): `/admin` conserva sidebar/cabecera/Inicio para todos los usuarios con sesión y empresa autorizada. Menú y tarjetas «Administrar página web»/«Catálogo interno» se filtran por permisos; acceso directo no autorizado muestra aviso dentro del mismo panel. Inicio adapta descripción/tarjetas, con catálogo de productos y enlace al Website para usuarios comunes. Retiradas menciones visibles a Django/apudig_mvp también del editor y avisos de gestión; usar APUDIG y lenguaje de negocio en el producto. Lint/build y50 tests Node correctos; revisión visual autenticada pendiente. Ver [dashboard y futura cuenta de cliente](dashboard-y-registro-clientes.md): registro desde Website, datos de cliente, verificación/aprobación mayorista y preparación de pedidos WhatsApp quedan definidos como siguiente funcionalidad, sin implementación comercial ni activación de comercio. Esta entrada actualiza la restricción anterior que reemplazaba por completo el dashboard de usuarios comunes.

Actualización posterior P0 (17/11/2026): `/catalog` permite cualquier miembro activo de la empresa, incluidos SELLER/CASHIER y usuarios sin rol; conserva login, contexto y membresía vigente. Solo el catálogo laboral básico prescinde de `read.inventory.products`; `/products/` mantiene el permiso ERP. Los datos privados siguen exclusivos de ADMIN de Company/superusuario. Sidebar y AdminLayout ocultan accesos/vistas administrativos a usuarios comunes; el perfil `/auth/me/` incluye el estado real de superusuario y roles vigentes de empresa. Se conservan permisos CMS explícitos separados. Lint/build y49 tests Node correctos; evidencia backend en informe18. Requisito futuro documentado: registro web de clientes no concede acceso laboral ni mayorista automáticamente; requiere aprobación/verificación y listas autorizadas por empresa. Sin implementar registro comercial, precios mayoristas, B4 o comercio.

Actualización P0 (17/11/2026): `/catalog` requiere AuthGuard, login APUDIG y empresa seleccionada por decisión expresa del usuario. Django revalida JWT, empresa/sucursal, membresía y lectura vigente en las seis rutas catálogo/productos. Datos privados solo para superusuario/administrador de empresa; los endpoints básicos omiten costos/proveedores/listas/almacenes. Se conserva diseño/rutas/paginación; CatalogPage se remonta por usuario/empresa/sucursal/modo y cancela respuestas antiguas. ProductDetailModal ya no comparte caché por ID; tarjetas/modal no inventan costos ausentes. Lint/build y45 tests Node correctos, smoke16 rutas correcto;156 pruebas Django/PostgreSQL acotadas correctas. Comparación ERP completa y límites en `apudig_mvp/docs/architecture/website-integration/17-remediacion-p0-catalogos.md`. QA visual autenticada pendiente: la alternativa nativa se detuvo por no poder verificar la URL de Chrome. R2 real sigue pendiente. No se activó comercio, ni se implementó B4-B/C/D; sin cambios de `.env`, datos reales o migraciones. Las actualizaciones siguientes son antecedentes históricos, no el estado posterior al parche.

Continuación B3-A y revisión previa a B4-B (16/11/2026): demo.localhost ya se observa ACTIVE/verificado; Django P1 y Next por localhost/Host registrado devuelven200 con identidad/SEO publicados, y Host desconocido404. commerceEnabled sigue false. El agente no atestiguó ni activó el dominio. Navegador automatizable y R2 real siguen pendientes. Informes backend15/16 documentan consumidores exactos del catálogo heredado, caché compartida del modal, diagnóstico PostgreSQL sintético con cinco brechas, remediación P0 separada, política comercial y contratos/tests K0–K7 propuestos. No hay cambios funcionales en esta entrega; no se inició B4-B/C/D ni se modificaron datos reales, variables o migraciones. Revisar las decisiones de anonimato laboral, permisos privados y opt-in comercial antes de implementar.

Actualización B3-A/B4-A (16/11/2026): repositorios verificados en backend `websites_backend@9e9eaf5` y frontend `mvp_website@83eb3ac`. La configuración local usa demo.localhost; ese dominio sigue PENDING aunque su Website tenga estado publicado, por lo que el 404 público es correcto. Faltan navegador y R2 real; B3-A no está aceptado integralmente. Pasan 45 tests Node y 133 Django/PostgreSQL acotados, sin aprobar por ello la suite ERP global. Diseño B4-A documentado en `apudig_mvp/docs/architecture/website-integration/14-auditoria-catalogo-b4-a.md`, con validación actual en 13: catálogo/precios/stock separados del snapshot CMS, reutilización de WebsiteProduct/WebsiteCatalogSettings, riesgos del legado, contratos propuestos y decisiones pendientes. No se activó comercio ni se cambió código funcional; `/catalog` laboral y `/shop` comercial conservan sus responsabilidades actuales. Próximo paso: activar el dominio mediante su operador autorizado, completar QA visual/medios y aprobar políticas comerciales antes de B4-B.

Actualización 16/11/2026: `WEBSITE_DEV_HOSTNAME` permite resolver `localhost` exclusivamente con Next en desarrollo y un dominio publicado configurado de forma explícita. Guía y preparación aislada: [Website local](website-desarrollo-local.md). Las pruebas Node y lint pasan; la validación de navegador y R2 real sigue pendiente.

## Entrega B3 (15/11/2026): CMS Django y contenido publicado

Estado vigente: editor conectado a Website descubierto por JWT/empresa; borrador/publicacion/preview/restauracion y biblioteca de medios usan Django. Publico SSR por hostname, snapshot publicado, no-store y comercio deshabilitado hasta B4. No se importan ni eliminan borradores locales previos. Se conserva el diseno y los catalogos laborales.

Archivos: servicios websiteRepository/api, WebsiteAccess/useWebsiteAccess/WebsiteEditor/WebsitePreview/EditorialImageField, WebsiteMediaContext, errors.mjs, storefront/store.js y public-website.mjs, layouts/paginas publicas y guards de carrito/header; tests Website/publico/HTTP/smoke. Configuracion: NEXT_PUBLIC_API_V1_URL (cliente/build) y WEBSITE_API_V1_URL (solo servidor), mismo backend autorizado; no secretos en Next publico.

Verificacion: lint/build correctos, 43 pruebas Node correctas, smoke de 16 casos y flujo HTTP Next-Django-PostgreSQL con dos empresas correctos. Backend: 102 pruebas Website correctas; global 669 vs baseline B2 659, mismos 84 fallos y 36 errores heredados. No es una suite ERP global aprobada.

Pendiente: Computer Use se detuvo al no poder verificar la URL de Chrome; no se valido interaccion visual, responsive, teclado ni dos navegadores. R2 fue simulado por instruccion expresa; falta CDN/carga real. B3 tiene aceptacion parcial y no debe iniciarse B4 hasta resolver esos puntos. Sin commits, push ni despliegue; base habitual intacta. Informe completo: apudig_mvp/docs/architecture/website-integration/11-entrega-b3.md. Las entregas locales historicas siguientes describen el estado anterior y no sustituyen esta actualizacion.

Última actualización: 13 de noviembre de 2026 (America/Lima).

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

## Entrega 5 — Filas horizontales y CTA compactos (13/11/2026)

### Prioridad visual actual

El usuario reemplaza la indicación anterior de letras azul marino sobre naranja: **CTA naranja `#FF8000` con texto/iconos blancos `#FFFFFF`**. Mantener azul marino para texto sobre blanco o superficies claras. Referencias: capturas de Promart/Sodimac aportadas por el usuario; no se copiaron activos.

Rama comprobada: `mvp_website`. Había un cambio local de formato en `src/app/(public)/page.js`; se conservó sin editar. No cambiar de rama ni atribuir ese cambio a esta entrega.

### Cambios

- Categorías de inicio más pequeñas y minimalistas: iconos Lucide con círculo claro y nombre, sin tarjetas grandes, descripción ni enlace redundante. Una sola fila con overflow horizontal tanto móvil como escritorio; scrollbar cuando el contenido supera el ancho disponible.
- Nuevo `HorizontalRail`: scroll nativo, snap suave, flechas anterior/siguiente con límites, foco de teclado y navegación con flechas; respeta preferencia de movimiento reducido. Sin nueva biblioteca de carousel ni autoplay.
- Sección destacada convertida a «Ofertas y recomendados» por defecto, filtrable por categoría. Productos en fila horizontal, móvil/escritorio. Las ofertas con precio anterior válido aparecen primero; no hay calificaciones, métricas de popularidad ni descuentos inventados. Estado vacío si una categoría no tiene productos.
- Títulos personalizados, visibilidad y orden siguen bajo el documento editorial existente. No se agrega un segundo CMS ni se altera el esquema de datos guardados.
- CTA naranja y buscador con texto/icono blanco. Marca/carrito con iconos/texto blancos cuando llevan fondo naranja. Hero lateral con fondo marino y texto claro, evitando el anterior título blanco sobre gris claro.
- CTA de producto: contorno/texto `#FF8000` y fondo transparente en reposo; naranja/blanco al hover, foco o cuando el producto ya está en el carrito. Icono de carrito al agregar, confirmación cuando está incluido y etiqueta móvil «Cotizar». Estado derivado del carrito real, no de una selección visual aislada.
- Tarjetas móviles más bajas: imágenes de 100 px, nombre de dos líneas, marca en una línea, espacios reducidos, sin alturas vacías para ahorro/precio anterior ausentes; conserva unidad, disponibilidad, precio y aviso demo.

### Archivos

Nuevos: `components/storefront/CategoryIcon.jsx`, `CategoryProducts.jsx`, `HorizontalRail.jsx` y `storefront-rails.css` (bajo `src/`).

Actualizados: `StoreHome.jsx`, `components/commerce/ProductCard.jsx`, estilos públicos, layouts público y editorial para compartir estilos de preview, helper `lib/commerce/catalog.mjs`, título inicial en `lib/website/content.mjs`, prueba de selección por categoría y documentación.

### Verificaciones

- `npm.cmd run lint`: correcto.
- `npm.cmd run build`: correcto.
- `node --test tests/commerce.test.mjs tests/website.test.mjs tests/admin-routes.test.mjs tests/storefront-api.test.mjs`: **22 pruebas correctas**; nueva prueba de filtro por categoría, ofertas válidas, categoría vacía y fuente sin mutaciones.
- Smoke de producción temporal en puerto 3110: **16 casos HTTP correctos**. Servidor temporal cerrado al terminar.
- Comparación con HEAD: sin cambios en páginas/layout laboral `/catalog`, `/admin/catalog_admin`, `CatalogPage`, tarjetas/modal administrativos y servicios laborales de productos/categorías.
- Revisión visual **no completada**: se intentó Computer Use; el control de Windows detuvo la operación al no poder verificar con suficiente confianza la URL activa de Chrome. No se continuó con acciones de navegador ni se eludió la restricción. No afirmar validación visual/interactiva de los carruseles.
- Sin Django, dependencias nuevas, cambios de autenticación, commit/push ni despliegue. Continúa el aviso informativo preexistente de baseline-browser-mapping.

### Próximo paso

Revisar visualmente `/` y `/shop` en 320/375/768/1024/1440 px: una sola fila de categorías, overflow sin desbordamiento de página, navegación por categorías, flechas/scroll, CTA outline/hover/agregado y altura móvil. Comprobar con teclado y movimiento reducido; probar agregar desde el carrusel y su persistencia en `/cart`. La conexión de datos reales y los pendientes Django de entregas anteriores siguen sin activar.

## Entrega 6 — Slider editable y especiales seleccionados (13/11/2026)

### Funcionalidad

- Nuevo bloque **Avisos (slider)**, independiente del banner hero: hasta 8 avisos, incluyendo ocultos. Tarjetas de imagen cuadrada, título, badge opcional superpuesto en cualquiera de las cuatro esquinas y enlace propio. Scroll horizontal y flechas con `HorizontalRail`; CTA centrado debajo «Ver más productos», editable junto con su destino.
- Nuevo bloque **Destacados y ofertas especiales**, con hasta 4 productos elegidos del catálogo. Reutiliza la tarjeta comercial y sus precios/ofertas vigentes; selección y orden explícitos, sin inventar descuentos. Scroll horizontal si no caben. Sin selección, el bloque no aparece.
- Nuevas opciones en `/admin/website`: **Avisos (slider)** y **Ofertas especiales**. Se mantienen permisos de lectura/edición/aplicación. En «Secciones» se controlan título, orden y visibilidad de ambos bloques.
- Avisos: agregar/eliminar/ocultar/reordenar, elegir imagen de PC o URL, texto alternativo, badge libre (ej. OFERTA POR DÍAS) y posición. Los archivos PNG/JPEG/WebP de hasta 8 MB se optimizan localmente a un máximo de 150 KB antes de guardarse en el documento demo. No se suben a servidores.
- La home de referencia muestra 4 avisos ilustrativos y 4 productos seleccionados por defecto. No se copian imágenes de las referencias del usuario. Los títulos/textos guardados anteriores se conservan.
- Documento `schemaVersion: 3`. Las versiones v1/v2 se adaptan al leer, tanto borrador como snapshot aplicado, sin sobrescribir localStorage ni incrementar revisión. Se añaden los bloques nuevos; los documentos antiguos comienzan sin productos especiales elegidos, evitando asumir referencias de otra tienda.

### Archivos de esta entrega

Nuevos: `components/admin/website/ShowcaseEditor.jsx`, `components/storefront/AnnouncementSlider.jsx`, `components/storefront/SpecialProducts.jsx`, `lib/website/local-image.mjs` (todos bajo `src/`).

Actualizados: modelo/validación editorial y repositorio local, WebsiteEditor/WebsitePreview/WebsiteFields, StoreHome, estilos de carruseles/editor y pruebas de límites, media y migración. Se amplía el contrato de `docs/website-cms-backend-plan.md` con avisos/especiales y pasos de subida de media en Django.

### Verificaciones

- `npm.cmd run lint`: correcto.
- `npm.cmd run build`: correcto.
- Suite Node de commerce/website/admin-routes/storefront-api: **26 pruebas correctas**. Nuevas pruebas para límites 8/4, IDs duplicados/ajenos, orden editorial, accesibilidad/enlaces/badges, formatos/tamaño inline y compatibilidad de borradores/aplicados v2.
- Smoke de producción en puerto 3110: **16 casos HTTP correctos**. Comprobación adicional del HTML de `/`: 4 avisos, CTA «Ver más productos» y 4 tarjetas de especiales. Servidor temporal cerrado.
- Comparación con HEAD confirma páginas/layout de `/catalog`, `/admin/catalog_admin`, componentes administrativos y servicios laborales sin cambios.
- No se realizó revisión visual ni interacción con selector de archivos, canvas, editor o carruseles en navegador en esta entrega. Límite ya observado de Computer Use en la sesión; no afirmar validación visual por las pruebas HTTP.
- Rama `mvp_website`. Se preservaron los cambios de la entrega 5 y el cambio de formato preexistente de `src/app/(public)/page.js`. Sin cambios en Django, autenticación, dependencias, commit/push o despliegue.

### Alcance local y próximo paso

El editor sigue guardando por empresa en este navegador y mostrando sus cambios en la vista previa protegida. **No actualiza automáticamente la página pública `/` ni sincroniza archivos entre PC** hasta implementar el backend editorial. La home usa defaults del servidor para mostrar la nueva composición.

Al retomar: seleccionar archivo real, comprobar su preview/alt/badge, guardar/aplicar y recargar; probar límite 8 avisos y selección/reordenamiento de 4 productos; confirmar que el quinto no puede elegirse. Revisar móvil/escritorio y roles de solo lectura. Implementar media Django con ownership y sustituir data URLs por referencias autorizadas antes de conectar la API productiva. No modificar catálogos laborales.

## Entrega 7 — Categorías en store-navigation (13/11/2026)

- Título inicial de `sf-category-products`: **Encuentra lo mejor para tu proyecto**. Sigue editable desde Secciones; no se sobrescriben títulos personalizados guardados.
- Categorías movidas a `#store-navigation`: icono Lucide y nombre en la misma línea. Se elimina `slice(0, 4)` y se renderiza todo el array recibido, preparado para el catálogo público futuro.
- Barra visible en móvil/escritorio, una sola fila con overflow horizontal, scrollbar fino y categorías sin encogerse. En móvil el botón «Todas las categorías» se compacta a icono; conserva etiqueta accesible y apertura del panel Radix.
- Se retira la fila independiente de categorías en Home. El tipo editorial `categories` permanece en el documento v3 por compatibilidad, pero ya no renderiza una sección ni controla la navegación. En el editor aparece una explicación en lugar de controles inactivos de título/visibilidad. No fue necesario cambiar versión de esquema ni borrar datos.
- Iconos unificados entre navegación, panel lateral y filtros por categoría mediante `CategoryIcon`; fallback para tipos desconocidos. No se implementaron subcategorías ficticias ni llamadas nuevas al backend.
- Archivos: StoreHeader, StoreHome, CategoryProducts, stylesheet de carruseles/navegación, título inicial del documento y WebsiteFields.

Verificaciones: lint/build correctos, **26 pruebas correctas**, **16 casos HTTP correctos**. Comprobación adicional en HTML: 6 categorías con sus iconos dentro de `store-navigation`, nuevo título y ausencia de la fila independiente. Páginas/componentes/servicios laborales comparados con HEAD sin cambios. Servidor temporal cerrado. Sin revisión visual/interacciones de navegador; comprobar manualmente overflow/foco en móvil y con muchas categorías. Se mantuvieron rama `mvp_website` y cambios locales previos. Sin Django, despliegue ni cambios de autenticación.

## Entrega 8 — Accesos en header y footer de contacto (13/11/2026)

- **Nosotros** y **Contacto** pasan al header junto al carrito, con iconos y etiquetas visibles, también en móvil. Se retiran de la fila horizontal de categorías. Se conserva el acceso al panel de categorías desde la propia barra; se retira su trigger duplicado del header para dejar espacio en móvil.
- Footer rediseñado: franja de atención comercial, identidad/ubicación/horarios, teléfonos y correo, enlaces de tienda/categorías, redes sociales y copyright. Enlaces de teléfono/correo cuando son válidos; WhatsApp continúa bloqueado en demo.
- Redes con iconos: Facebook, Instagram, TikTok, YouTube y X. Solo perfiles HTTPS del proveedor indicado. Sin perfiles, la demo muestra iconos atenuados no interactivos y un texto de datos por confirmar. No se inventaron cuentas, números, correo, suscripciones, políticas ni métodos de pago.
- `/admin/website` → **Contacto** incorpora teléfono adicional, correo comercial y URLs de redes sociales. Se conservan permisos y persistencia local. Nuevos campos opcionales dentro de documento v3; borradores anteriores sin esos campos siguen siendo válidos, sin nueva migración ni pérdida de contenido.
- `previewStore` expone únicamente redes conocidas con URLs válidas. La fuente pública demo tiene campos vacíos; los datos locales del editor aparecen en preview protegida, no automáticamente en `/`.
- `/contact` contempla teléfono adicional y correo comercial de la fuente de tienda, con enlaces seguros.

Archivos: StoreHeader, StoreFooter, nuevo `SocialIcon.jsx`, nuevo `storefront-contact.css` compartido con preview, `lib/website/contact.mjs`, modelo editorial/fuente demo, campos de contacto del editor y página Contacto. Pruebas en `tests/contact.test.mjs`.

Verificaciones: lint/build correctos; **29 pruebas correctas** (incluye emails/links de teléfono, dominios HTTPS de redes, compatibilidad de borradores y selección explícita de campos); **16 casos HTTP correctos** y comprobación adicional de accesos de header/categorías/footer sin links ficticios. Comparación con HEAD mantiene páginas/layout/componentes/servicios laborales sin cambios. Servidor temporal cerrado. No se realizó validación visual en navegador; revisar alineación móvil 320/375/768, correo largo, 0/1/2 teléfonos y todas/algunas/ninguna red configurada. Se preservaron rama y cambios anteriores. Sin backend, autenticación, nuevas dependencias ni despliegues.

Al retomar: introducir datos oficiales en Contacto, comprobar preview, guardar/aplicar y recargar; validar roles de lectura/edición. Integrar luego el DTO publicado de Django para que los datos reales aparezcan compartidos en `/`. La integración y límites de demo de entregas anteriores siguen vigentes.

## Entrega 9 — Hero automático y avisos con CTA propio (13/11/2026)

### Implementado

- `sf-hero-main` pasa a ser cada diapositiva de un carrusel con scroll snap nativo. Reproducción automática (6 segundos por defecto), flechas, indicadores, pausa/reanudación y deslizamiento táctil. Solo usa banners visibles; con cero no se muestra y con uno no rota. No se añadió dependencia.
- Se conserva la composición desktop junto a `sf-hero-side`. En móvil se usa un banner compacto con indicio de la siguiente diapositiva; si hay fotografía, ocupa el fondo y el mensaje/CTA se superponen con un degradado para contraste. Sin fotografía conserva la ilustración demo.
- Cada banner mantiene su CTA naranja/blanco. La rotación se suspende al pasar el mouse, ocultar la pestaña o interactuar; después de navegación manual se reanuda expresamente. Se respeta movimiento reducido. Las diapositivas inactivas quedan fuera del foco/accesibilidad.
- En Banners del admin: activar/desactivar autoplay e intervalo de 3 a 15 segundos. Imágenes de escritorio y móvil elegibles desde la PC o URL, texto alternativo, mensajes, CTA, destino, orden y visibilidad. Selector reutilizado con los avisos; prepara PNG/JPEG/WebP localmente, hasta 150 KB por imagen.
- `sf-announcements`: título, descripción opcional, CTA propio y badge sobre cada imagen, con degradado para legibilidad. Etiqueta/destino del CTA editables por aviso; máximo 8 incluyendo ocultos. No se copian imágenes ni datos comerciales de las referencias.
- `sf-showcase-cta` movido al encabezado de `sf-category-products`, reemplazando «Ver todos los productos». Conserva texto/destino configurados en `announcements.ctaLabel/href` para no perder borradores. En Avisos se explica que ese botón general se muestra en productos por categoría.
- Panel lateral público: accesos rápidos a productos/cotización/nosotros/contacto, categorías en filas con icono y descripción, sección de ayuda. Conserva Radix, cierre al navegar y categorías de la fuente existente. No incorpora funcionalidades bancarias de la referencia ni modifica el sidebar ERP.
- Documento sigue en v3: `heroSlider` y `announcements.items[].ctaLabel/description` opcionales para compatibilidad. Borradores sin esos campos siguen válidos (autoplay 6000 ms y CTA «Conoce más»). Nuevos documentos demo tienen 3 banners; no se inyectan banners en documentos existentes.

### Archivos principales

`src/components/storefront/StoreHero.jsx`, `AnnouncementSlider.jsx`, `CategoryProducts.jsx`, `StoreHeader.jsx`, `StoreHome.jsx` y `storefront-rails.css`; `src/components/admin/website/EditorialImageField.jsx`, `ShowcaseEditor.jsx`, `WebsiteFields.jsx`, `WebsiteEditor.jsx`; `src/lib/website/content.mjs`, nuevo `slider.mjs`; pruebas y contrato backend actualizado.

### Verificación real

- Lint y build de producción correctos.
- **32 pruebas Node correctas**: incluye compatibilidad de opciones ausentes, límites de intervalo/textos, CTAs y conservación de media/opciones en borrador y snapshot aplicado.
- **16 casos HTTP correctos** con servidor temporal de producción en 3110. Comprobación adicional del HTML: 3 diapositivas, 4 CTAs individuales y CTA general dentro del encabezado por categoría. Se corrigió el script de inspección para eliminar scripts HTML completos en lugar de truncar antes del contenido. Servidor temporal cerrado.
- **8 archivos de catálogo protegidos comparados con HEAD sin cambios**, incluidos layouts/páginas laborales, componentes y servicios. Rama `mvp_website`; sin cambios de backend/auth, instalación de dependencias, commit/push ni despliegue.
- Computer Use pudo leer el sitio en `localhost:3000` y capturar los avisos en escritorio: mensajes/CTAs superpuestos visibles y CTA general en su nueva sección. Se observaron distintas diapositivas activas entre lecturas. Se corrigió después el ancho de las imágenes de avisos para que no invadan el espacio entre tarjetas. **No se completó revisión móvil, interacción de controles ni revisión visual posterior al ajuste**, porque las acciones del control nativo no produjeron el cambio de vista esperado y el host de acceso browser está indisponible. No dar por validados esos casos.

### Límites y siguiente paso

El editor sigue usando almacenamiento local por empresa y preview protegido. **Guardar/aplicar no actualiza `/` ni sincroniza imágenes/configuración entre PC**. La home muestra defaults del servidor. El plan de Django documenta los nuevos campos; falta implementar API editorial/media/publicación. Las data URLs solo sirven a esta demo y deben sustituirse por archivos/IDs autorizados al conectar Django.

Al retomar: probar en navegador móvil 320/375/640 y escritorio, con imágenes desktop/mobile reales; comprobar flechas, dots, swipe, pausa, reanudación, foco/teclado, movimiento reducido, pestaña oculta y cambios de tamaño. Probar 0/1/varios banners, títulos/descripciones largos y badges en cuatro esquinas; elegir archivos, guardar/aplicar/recargar con permisos de lectura/edición. Verificar cuota local con muchas imágenes. Continuar integración Django según el contrato sin alterar `/catalog` ni `/admin/catalog_admin`.

## Entrega 10 — Filtros y ordenamiento de /shop (13/11/2026)

### Cambios

- Cuadrícula comercial más densa: 4 columnas en escritorio desde 1101 px, 5 desde 1500 px, 3 en tamaños intermedios y 2 hasta 600 px; contenedor de /shop ampliado hasta 1440 px. Página de hasta 24 productos (antes 6). Tarjetas compactas conservan CTA outline y carrito de cotización.
- Botones con fondo naranja de /shop/paneles usan texto e iconos blancos; categoría activa en navegación usa naranja/blanco. Categoría seleccionada en filtros usa fondo naranja claro, radio y texto destacado.
- Filtros desktop en columna izquierda; hasta 900 px se abren en un panel lateral izquierdo Radix. Ordenamiento siempre mediante panel derecho, tanto móvil como PC, con disparador en la parte superior izquierda de resultados.
- Paneles con título accesible, descripción, cierre y botón «Ver resultados»; Radix conserva foco/modal/Escape. Cambiar opciones dentro de un panel no aplica hasta confirmar; cerrar cancela el orden pendiente. Los filtros de móvil se reinician desde la URL al abrir.
- Filtros seleccionados como chips removibles, acción limpiar todo, búsqueda por nombre/SKU, categoría con selección marcada y cantidades, marcas/líneas con búsqueda y selección múltiple, rango de precio con campos desde/hasta y sliders accesibles (`FilterRange`). Restablecer limpia la selección pendiente; Ver resultados la aplica.
- Orden: nombre A–Z/Z–A, menor/mayor precio y mayor descuento porcentual real. No se inventan ventas, fecha de incorporación, valoraciones ni un ranking de recomendados. Productos sin precio van al final en ambos órdenes de precio; al aplicar rango se omiten. Precio cero y extremos inclusivos contemplados.
- URL conserva búsqueda, categoría, múltiples `brand`, `min`, `max`, `sort` y página. Cambiar filtros/orden reinicia página; los links de paginación mantienen filtros. Enlaces antiguos con una marca siguen válidos. Valores no válidos se normalizan; rangos invertidos recibidos por URL se intercambian. El formulario pide corregir rangos invertidos antes de aplicar.
- Se tomó el patrón de grupos/chips/marcas/precio del HTML adjunto y capturas del usuario. No se incorporan promesas de entrega, stock por sede ni logos ajenos.

### Archivos

`src/components/commerce/StoreCatalog.jsx`, nuevos `FilterRange.jsx` y `shop.css`; `src/lib/commerce/shop-filters.mjs`; `src/app/(public)/shop/page.js`; `src/components/storefront/CategoryNavLink.jsx` y `StoreHeader.jsx`; `tests/shop-filters.test.mjs`. Categoría activa usa `useSearchParams` dentro de Suspense con fallback de enlace, sin convertir el layout completo a render dinámico.

### Verificación

- Lint y build de producción correctos.
- **36 pruebas Node correctas**; 4 nuevas para combinación de filtros, cero/precio desconocido, orden/descuento, query inválida y conservación de URL/paginación.
- **16 casos HTTP correctos** con servidor temporal 3110. Adicionales: categoría Herramientas + rango S/160–200 + precio descendente devuelve un producto, conserva chips y orden; dos marcas/líneas combinadas devuelven 3 productos. Servidor temporal cerrado.
- 8 archivos protegidos de catálogos laborales, componentes y servicios comparados con HEAD, sin cambios. Se mantuvo rama `mvp_website` y trabajo previo. Sin backend/auth/dependencias/commit/push/despliegue.
- Computer Use leyó la URL `localhost:3000/shop` y sus controles nuevos en accesibilidad. El intento de abrir Ordenar falló con `coordinate input geometry is unavailable`; el host de browser sigue indisponible. **No se comprobó visualmente la cuadrícula ni la interacción de paneles, foco, rangos o tamaños móviles**. Una lectura de controles/HTML no sustituye esas pruebas. El inspector tenía un contador de error previo cuyo contenido no se pudo inspeccionar; no afirmar consola limpia.

### Continuidad

El filtrado funciona sobre el catálogo demo completo en memoria, sin cambios del ERP. Marcas actuales son líneas ilustrativas de la fuente demo. Para Django: acordar facets, múltiples marcas con OR dentro del grupo y AND entre grupos, precios inclusivos, nulos al final, orden por descuento porcentual y paginación de 24. No filtrar una página aislada de API como si fuera el catálogo entero. Ver actualización de `storefront-catalog-api.md`.

Pendiente: revisar 320/375/768/1024/1280/1600 px, cerrar/aplicar/cancelar paneles con teclado y Escape, retorno del foco, chips, cero/sin precio, rango inválido, back/forward, recarga y selección activa de categoría en navegación. Revisar botón orange/blanco y CTA de producto en sus estados. Mantener `/catalog` y `/admin/catalog_admin` sin cambios.

## Entrega 11 — Ancho de tarjetas y selección naranja (13/11/2026)

- Ajuste exclusivo de `src/components/commerce/shop.css`: filas seleccionadas de filtros y orden con fondo #FF8000 y texto blanco. Radios con apariencia CSS explícita naranja/blanco, conservando input nativo, teclado y foco visible; se elimina la apariencia azul del navegador.
- Corregido el límite efectivo de `.sf-container`: /shop ahora amplía su ancho hasta 1920 px en escritorio, con margen lateral de 32 px. Cuadrícula auto-fill con mínimo de 230 px por tarjeta, sin imponer cinco columnas dentro de 1240 px. Aproximadamente 4 columnas a 1280/1440 px, 5 a 1600 y 6 a 1920, según espacio disponible. En tamaños menores se conservan reglas de 3/2 columnas. No se cambian estilos de catálogos laborales.
- Paginación activa naranja con número blanco mediante regla específica de /shop.
- Verificado: lint, build de producción y diff --check correctos. No se añadieron pruebas para este ajuste CSS ni se repitió la suite de lógica de la entrega 10. Revisión visual en navegador pendiente; limitaciones de Computer Use registradas en entrega 10. Al retomar, comprobar ancho real a 1280/1440/1600/1920, selección/foco y paginación activa.
- Se preservan rama `mvp_website`, cambios locales e índice preexistentes; sin cambios de datos, backend, dependencias ni despliegue.

## Entrega 12 — Panel de carrito y resumen del pedido (13/11/2026)

- El acceso `sf-cart-link` del header es un botón que abre un panel lateral Radix. Agregar productos desde tarjetas o ficha también lo abre con confirmación. Incluye cierre, estado vacío/carga, scroll del contenido, subtotal, «Ir al carrito» y «Seguir comprando». Radix administra foco/modal/Escape; se devuelve el foco al elemento que lo abrió cuando sigue montado.
- `CartItem` compartido entre panel y `/cart`: imagen pública con fallback ilustrado, marca, nombre, SKU, unidad, precio actual/anterior, descuento real, botones menos/más, entrada de cantidad validada 1–999, subtotal por línea y eliminación. Características/observaciones opcionales (240 caracteres) para solicitar medidas, colores u otros detalles; no se inventan variantes, stock ni opciones del catálogo.
- `/cart` reorganizado con lista blanca agrupada por tienda, resumen lateral, importes antes de descuentos, descuentos por cantidad y total referencial. Productos sin precio se identifican y se excluyen del total parcial. Recomendaciones provenientes del catálogo existente, excluyendo artículos del carrito y no disponibles. Estilos adaptables a móvil y escritorio, CTA naranja/blanco.
- Observaciones persistidas junto a ID/cantidad con el mismo contenedor v1, compatible con listas anteriores. Se limita longitud y se conserva la lista permitida de campos; precios provienen del catálogo. El mensaje de WhatsApp incorpora los detalles de cada línea. Se mantienen aislamiento por tienda y sincronización entre pestañas.
- WhatsApp conserva su validación: habilitado con tienda fuera de demo y número válido. La fuente pública actual sigue siendo demo y no tiene teléfono; por ello el botón permanece deshabilitado con explicación. No se enviaron mensajes ni se configuraron destinos ficticios. La publicación editorial/backend comercial sigue pendiente.

Archivos: `CartProvider.jsx`, nuevos `CartDrawer.jsx`, `CartItem.jsx`, `cart.css`, `CartPage.jsx`, `StoreHeader.jsx`, `lib/commerce/cart.mjs` y `tests/commerce.test.mjs`.

Verificación: lint y build de producción correctos; 38 pruebas Node correctas y 16 casos HTTP del smoke correctos contra servidor temporal en 3110. Pruebas nuevas cubren centavos/descuentos/cero/precios desconocidos y restauración/límite/mensaje de observaciones. Se verificó además la conservación de espacios mientras se editan los detalles. `git diff --check` correcto. Servidor temporal detenido. Se utilizó Node del runtime de Codex porque npm/node de nvm no eran accesibles desde el PATH de esta sesión. Aviso preexistente de baseline-browser-mapping desactualizado; no se cambiaron dependencias.

Revisión visual e interacciones reales pendientes: el host de browser reportó indisponibilidad y la selección nativa de Chrome agotó la autorización de aplicación (`Computer Use app approval timed out`). No afirmar que se verificaron diseño, cantidades, teclado o móvil en navegador. Al retomar: comprobar panel desde header y agregar, cerrar/Escape/foco, entrada inválida y límites, observaciones con espacios, sincronización/recarga, eliminación/vaciado, navegación a ficha y carrito, scroll con muchos productos y 320/375/768/1024/1280 px. Validar WhatsApp con datos comerciales oficiales fuera de demo antes de producción.

Rama `mvp_website`, árbol inicialmente limpio. Catálogos laborales, servicios administrativos, autenticación y backend sin cambios; sin commit/push/despliegue.

## Entrega 13 — Corrección del carrito recortado en móvil (13/11/2026)

- Reproducido con Chromium headless en móvil de 360 × 800: `documentElement.clientWidth` de 360, pero `innerWidth` de 788 por desbordamiento horizontal. Al abrir Radix, la compensación de scrollbar comprimía el body a 0 px y el panel quedaba en x=191 con ancho de 580 px, fuera de pantalla, igual que la captura del usuario.
- El contenedor público `.storefront` ahora delimita su ancho, establece un contexto de posición y recorta el desbordamiento horizontal con `overflow-x:clip`. Se conserva el scroll propio de categorías y carruseles; clip no crea un contenedor vertical de scroll que interfiera con el header sticky.
- Panel acotado al viewport, con overflow interno controlado y contenido flexible. Hasta 640 px ocupa toda la pantalla con inset 0 y sin animación de traslación que pueda ensanchar el viewport móvil. Los controles de cantidad/subtotal pueden envolver cuando falta espacio; el listado conserva scroll vertical y el footer permanece visible.
- Verificación real contra `localhost:3000` usando Chromium headless/Playwright existente en el runtime, sin instalar dependencias: 320, 360, 375, 390, 640, 768, 1024 y 1440 px. En los ocho tamaños se comprobó ausencia de overflow horizontal en home y /cart, límites del panel y controles dentro de pantalla, aumento de cantidad, cierre, reapertura y navegación «Ir al carrito». Captura generada a 360 px revisada visualmente: título/cierre, producto/precio/cantidad/subtotal y botones inferiores completos. Los archivos temporales de diagnóstico/captura se eliminaron después de verificar. A 360 px, panel x=0/ancho=360 y body=360, sin compresión.
- Lint, build de producción y diff --check correctos. Cambio de presentación exclusivamente en `storefront.css` y `commerce/cart.css`, conservando el trabajo previo. Sin cambios de backend, catálogos laborales, datos ni dependencias.
- Sigue pendiente probar Safari/iOS y teclado virtual en dispositivo físico. Los límites de demo/WhatsApp de la entrega 12 se mantienen.

## Entrega 14 — Categorías múltiples y barra móvil fija (14/11/2026)

- Ordenar por se ubica a la derecha de la barra de resultados, con filtros/conteo a la izquierda.
- Categorías con checkboxes y selección múltiple. OR entre categorías y AND con marcas/búsqueda/precio. «Todas las categorías» limpia el grupo. Chips individuales removibles, contador y navegación superior reflejan todas las categorías aplicadas. URLs con una sola categoría siguen válidas; varias se representan con `category` repetido y se conservan al ordenar/paginar.
- Ambos drawers limitan su ancho a `min(420px, calc(100vw - 36px))`, dejando parte del fondo visible en móvil. Se conservan overlay, foco/Escape y scroll interno Radix.
- Hasta 900 px, toolbar sticky debajo del header. ResizeObserver mide la altura real del encabezado para ajustar el offset al cambiar tamaño, sin altura fija asumida. Chips aplicados dentro de la barra fija, en una fila con scroll horizontal; siguen permitiendo quitar filtros mientras se recorren resultados. Paneles z81, header z30 y toolbar z25.
- Archivos: StoreCatalog, shop.css, shop-filters.mjs, CategoryNavLink y tests/shop-filters.test.mjs. No se modifican catálogos laborales, backend ni autenticación.
- Verificado: lint, build de producción, **39 pruebas Node** y **16 casos HTTP** correctos; petición multicategoría Herramientas/Pinturas devuelve 3 productos y ambos chips. Diff --check correcto. Servidor temporal 3110 detenido. Sin nuevas dependencias/commit/push/despliegue.
- Revisión visual de sticky, ancho de paneles, teclado y scroll móvil pendiente en esta entrega; las pruebas HTTP/lógica no verifican geometría. Al retomar, probar 320/375/640/900 px, categorías múltiples, aplicar/cancelar, chips, back/forward y cambio de tamaño con header sticky. Mantener las correcciones de carrito de entregas 12/13.

## Entrega 15 — Controles móviles compactos (14/11/2026)

- Toolbar móvil (hasta 900 px): botón de filtros solo con icono/contador y nombre accesible; Ordenar en una línea con icono, sin repetir etiqueta y orden actual. Se conserva descripción accesible del orden elegido y detalle completo en el panel. Chips aplicados siguen en una fila horizontal; sin chips no ocupan una fila vacía.
- Encabezado público móvil deja de ser sticky (incluye store-navigation): se desplaza con la página. Solo toolbar de /shop queda fija en top:0; retirado el ResizeObserver/offset anterior. Desktop conserva header sticky y etiquetas completas.
- Búsqueda móvil reducida de 46 a 36 px, texto de 16 px para evitar zoom automático en iOS y botón de búsqueda de 44 px de ancho.
- Conteo común móvil/escritorio de /shop pasa a «+N Resultados» usando el total real, incluido +0 para conjunto vacío; no se inventa el número 10. Catálogos laborales sin cambios.
- Archivos: StoreCatalog.jsx, shop.css, storefront-contact.css, smoke y este registro. Se conservan categorías múltiples, drawers y correcciones del carrito.
- Verificado: lint/build correctos, smoke de 16 rutas correcto en servidor temporal de producción 3110 (detenido). Se actualizó la comprobación de conteo para ignorar comentarios separadores de React al comprobar «+2 Resultados». No se añadieron pruebas de lógica para esta modificación de presentación. Revisión visual móvil/scroll pendiente en navegador en esta entrega.

## Entrega 16 — Cotización como panel inferior móvil (14/11/2026)

- Hasta 900 px, el panel de carrito/cotización se abre desde abajo con animación vertical, esquinas superiores redondeadas y una guía visual. Altura `min(85dvh,760px)` y máximo `100dvh - 48px`: deja parte de la tienda visible bajo el overlay en vez de ocupar toda la pantalla. Desktop conserva drawer lateral derecho.
- Conserva Radix, cierre/Escape, foco, scroll interno del listado, cantidades/observaciones y footer con Ir al carrito/Seguir comprando. Encabezado/descripción no se encogen. Movimiento reducido desactiva la animación. No se agregan checkout ni recomendaciones comerciales falsas de la referencia.
- Toolbar móvil de /shop ocupa todo el ancho de pantalla con extensión controlada sobre los márgenes del contenedor (20 px hasta 900; 16 px hasta 640). Controles mantienen margen interior y sticky top:0. Se conserva el recorte horizontal del storefront de la entrega 13.
- Archivos: commerce/cart.css y commerce/shop.css. Lint, build de producción y diff --check correctos. No se añadieron pruebas de lógica para estos cambios CSS. Revisión visual del panel inferior y toolbar pendiente en navegador en esta entrega; validar 320/360/375/640/900, teclado virtual, muchos productos, cierre/reapertura y movimiento reducido. Las verificaciones geométricas de la entrega 13 corresponden al panel anterior y no validan esta nueva composición.
- Se preservan trabajo local previo, catálogos laborales, lógica/datos de carrito y backend. Sin dependencias, commit/push ni despliegue.

## Entrega 17 — Último producto agregado visible en cotización (14/11/2026)

- El panel usa el `addedId` que ya proporciona CartProvider para mostrar primero la línea recién agregada, incluso si era un producto existente. El resto mantiene su orden relativo. Se conserva identidad, cantidad y observaciones de cada línea; no se reordena el almacenamiento ni la página del carrito.
- Al abrir el panel o cambiar el producto agregado, el listado vuelve al inicio mediante ref/requestAnimationFrame cancelable. Cambiar cantidades dentro del panel no fuerza saltos de scroll. Al abrir desde el header sin un producto agregado conserva el orden habitual; IDs eliminados o carrito vacío no producen líneas falsas.
- Archivos: CartDrawer.jsx, helper puro prioritizeCartLines en cart.mjs y prueba en commerce.test.mjs. Se conserva el panel inferior móvil de entrega 16.
- Verificado: **40 pruebas Node correctas**, lint, build de producción y diff --check correctos. Prueba nueva cubre producto nuevo/existente, orden estable, conservación de objetos y ausencia del ID. Revisión interactiva pendiente en navegador: agregar A, B, A otra vez, editar cantidad/notas, eliminar el destacado, cerrar/reabrir y abrir desde header. No se afirma QA visual con estas pruebas de lógica.
- Sin cambios de backend, catálogos laborales, dependencias, commit/push ni despliegue. Trabajo previo preservado.

## Entrega 18 — Animaciones y estados de carga (14/11/2026)

- Revisadas dependencias: Framer Motion 12, Radix Dialog y tailwindcss-animate ya instaladas. Los diálogos de `ui/dialog.jsx` ya tienen fade/zoom de apertura/cierre; no se cambia ese componente compartido con catálogos/ERP. Para los paneles comerciales se aprovechan data-state y Presence de Radix con keyframes CSS: entrada/salida izquierda (categorías/filtros), derecha (orden y carrito desktop), inferior (carrito móvil), y fade del overlay. Radix retrasa el desmontaje hasta terminar el cierre. Sin timers manuales para desmontar, sin dependencias nuevas. Preferencia de movimiento reducido respetada, incluida confirmación del editor.
- Nuevos componentes reutilizables en `src/components/feedback/`: LoadingIndicator (pantalla completa/local/overlay/compacto), LoadingLink (useLinkStatus de Next), LoadingImage, feedback.css y panels.css. Los loaders muestran esperas reales, sin retrasos mínimos artificiales. Los enlaces resueltos en caché pueden no mostrar spinner porque no hay espera.
- Navegación pública a través de LoadingLink con indicador a pantalla completa, búsqueda del header con indicador al enviar (se restablece al restaurar la página desde historial), loading.js del editor web e indicadores iniciales de editor/preview completos. No se añade loading.js sobre /shop/[id]: la prueba detectó que el streaming de ese fallback convertía la respuesta 404 de una ficha inexistente en 200; se retiró y se usa feedback cliente de navegación para conservar status correcto.
- Resultados de filtros/orden con useTransition, aria-busy y spinner acotado a resultados. Carrito mientras restaura datos, imágenes de productos/avisos y banners mientras descargan, preparación de archivo local, procesamiento/guardado y carga del iframe de preview con indicadores locales. Errores de imagen terminan la espera; CatalogImage conserva ilustración de respaldo.
- Imports/styles compartidos entre storefront y preview. Archivos que antes importaban Link público utilizan LoadingLink; se preservan hrefs/acciones. Autenticación y catálogos laborales no se modifican.
- Verificado: lint/build de producción correctos, **40 pruebas Node correctas**, **16 casos HTTP correctos**, incluida ficha inexistente 404, y 8 archivos protegidos comparados con HEAD sin cambios. Servidor temporal 3110 detenido. Sin nuevas pruebas que repliquen CSS. Sin commit/push/despliegue. Aviso preexistente de baseline-browser-mapping permanece.
- Pendiente en navegador: revisar apertura/cierre/reapertura rápida, backdrop, foco/Escape, teclado virtual y movimiento reducido; throttling de red para imágenes/páginas, navegación atrás/adelante y búsquedas, fallos de imagen, iframe/autorización y errores de carga. Las comprobaciones de build/HTTP no prueban animación visual ni tiempos reales de spinner.

Referencia técnica consultada: https://www.radix-ui.com/primitives/docs/guides/animation (animación CSS en montaje/desmontaje y estados open/closed).

## Entrega 19 — Cabecera fija con relevo de filtros (14/11/2026)

- La cabecera principal sf-header-main queda en su header sticky, independiente de store-navigation. La navegación de categorías se desplaza normalmente con el documento. Se restaura sticky móvil; búsqueda compacta y controles anteriores se conservan.
- /shop incorpora un marcador de 1 px antes de la toolbar, sin añadir espacio efectivo. IntersectionObserver detecta cuándo cruza el borde superior; entonces oculta visualmente/desactiva la cabecera y deja los filtros fijos en top:0. Al subir se restaura. La ocultación conserva la geometría para evitar saltos; no hay listeners de scroll por frame.
- El atributo de estado se limpia al desmontar /shop, restaurando la cabecera en otras páginas. Toolbar sticky también en escritorio para mantener el relevo coherente en ambos tamaños.
- Archivos: StoreHeader.jsx, StoreCatalog.jsx, storefront-contact.css, shop.css. Lint y build de producción correctos tras corregir el cierre JSX al separar nav/header. Revisión visual/interactiva de scroll, retorno a otras rutas, filtros/paginación y cambio de tamaño pendiente. No se añaden pruebas que repliquen implementación CSS.
- Se preservan cambios anteriores, catálogos laborales, lógica de carrito y backend; sin dependencias ni despliegue.

## Entrega 20 — Contraste de navegación (14/11/2026)

- store-navigation con fondo blanco explícito, bordes gris claro y sombra sutil para separarlo del contenido. Cambio en storefront-rails.css, compartido con preview. Conserva selección naranja, scroll horizontal y comportamiento de cabecera/filtros.
- Lint y diff --check correctos. Ajuste CSS de bajo impacto; sin pruebas nuevas ni nueva compilación. Revisión visual pendiente. Catálogos laborales y backend sin cambios.
