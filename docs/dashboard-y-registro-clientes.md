# Dashboard APUDIG Web y futura cuenta de cliente

Actualización B4-B17/11/2026: el dashboard actual se conserva. La auditoría backend20 (`docs/architecture/website-integration/20-arquitectura-cuentas-comerciales.md`) recomienda /cuenta para el contexto comercial reutilizando la presentación APUDIG Web; /admin sigue laboral/CMS. Es una propuesta posterior a este diseño inicial, sin cambiar rutas o crear registro comercial. Backend K0–K7 está listo para revisión, pero Next B4-C y comercio continúan pendientes.

Fecha: 17/11/2026. Rama `mvp_website`, conservando cambios locales anteriores. Esta actualización corrige el dashboard; no habilita comercio ni registro comercial.

## Dashboard implementado

`/admin` muestra el mismo contenedor APUDIG Web a todos los usuarios autenticados con empresa autorizada: sidebar, cabecera, Inicio y tarjetas según acceso. No se reemplaza el inicio por una pantalla aislada de catálogo.

| Acceso | Inicio y catálogo de productos | Administrar página web | Catálogo interno |
| --- | --- | --- | --- |
| Miembro sin rol, SELLER, CASHIER | Sí | No | No |
| Permisos CMS explícitos | Sí | Según permisos | No |
| ADMIN de la empresa / superusuario | Sí | Sí | Sí |

Las mismas capacidades filtran menú y tarjetas. Una URL restringida mantiene el contenedor común y muestra «Acceso no disponible» con regreso a Inicio; no monta la vista protegida. Las autorizaciones efectivas siguen en el servidor y el catálogo privado no amplía sus permisos.

Inicio utiliza «Bienvenido a APUDIG Web», una descripción acorde con el acceso, catálogo básico y enlace a la página de la empresa. La tarjeta de gestión empresarial se muestra solo a administradores. El catálogo básico se presenta como «Catálogo de productos», evitando definir el dashboard únicamente como un espacio para trabajadores.

Se retiraron menciones visibles a Django y `apudig_mvp` del dashboard, footer lateral, aviso de módulos de gestión y mensajes del editor. La interfaz utiliza APUDIG y lenguaje de negocio; las tecnologías y nombres de código permanecen en la documentación técnica, no en el texto del producto. No se modificaron nombres internos solo para cambiar textos.

Archivos: `app/(admin)/admin/page.js`, `components/layout/AdminLayout.jsx`, `Sidebar.jsx`, `components/admin/ErpModuleNotice.jsx`, `components/admin/website/WebsiteEditor.jsx`, `WebsiteFields.jsx`, `lib/admin/access.mjs`, `tests/admin-access.test.mjs`.

## Registro y pedidos por WhatsApp: siguiente funcionalidad

Requisito solicitado: una persona entra al Website de la empresa, crea su cuenta y registra sus datos para preparar pedidos por WhatsApp. Este será también su dashboard. El registro comercial y los pedidos todavía no están implementados; no se anuncian botones de registro o pedido que no funcionen.

Flujo propuesto:

1. Resolver la empresa por su dominio activo y verificado.
2. Mostrar registro de cliente de esa empresa. Datos mínimos propuestos: nombre, correo y teléfono con código de país; aceptación del aviso de privacidad. Dirección y datos fiscales solo cuando el pedido/facturación los requieran. Confirmar cuáles serán obligatorios antes de implementar.
3. Reutilizar la identidad/autenticación existente, vinculándola al cliente comercial de la empresa. Una cuenta puede relacionarse con empresas distintas mediante autorizaciones independientes; no duplicar el maestro de clientes del ERP.
4. Verificar el medio de contacto y permitir completar/actualizar datos propios. Registrar consentimiento y limitar consulta de datos personales al titular y personal autorizado de esa empresa.
5. Ofrecer `/admin` con Inicio y opciones comerciales autorizadas. Un cliente no recibe permisos CMS, administración, membresía laboral ni acceso al catálogo privado por registrarse. El guard actual exige contexto laboral autorizado: deberá adaptarse específicamente al contexto comercial cuando se implementen los clientes, sin crear permisos ERP como atajo.
6. Separar registro de aprobación para mayorista/distribución. La empresa selecciona/verifica a los clientes y autoriza su lista de precios; puede revocar esa aprobación. El servidor decide qué productos/precios puede consultar cada cuenta.
7. Al habilitar el catálogo comercial, preparar la solicitud con productos reales, unidades, cantidades y precios autorizados. Recuperar el cliente autenticado desde el servidor, confirmar sus datos y abrir WhatsApp de la empresa con el resumen aprobado. No confiar en precios/identidad enviados por el navegador.
8. La apertura del enlace de WhatsApp no confirma envío, recepción ni pedido aceptado. Definir por separado si se guardará una solicitud con referencia y qué estados tendrá. No crear ventas, cotizaciones ERP ni movimientos de stock automáticamente.

Antes de implementar: conciliar Customer/usuario y vínculos por empresa, método de verificación de contacto, política de aprobación comercial, listas permitidas, datos obligatorios, privacidad/retención, persistencia de solicitudes y número WhatsApp empresarial. Respetar la separación CMS/publicación y comercio ERP de los informes backend16/18. No activar `commerceEnabled` ni WhatsApp productivo durante esta corrección visual.

## Verificación de esta entrega

- Lint, build de producción y50 pruebas Node correctos.
- Nuevo caso: Inicio disponible para miembros sin rol, SELLER y CASHIER; destinos privados/CMS denegados sin autorización; editor CMS no obtiene catálogo privado.
- Revisión de textos visibles: las referencias restantes a tecnologías en los componentes son imports/comentarios, no contenido renderizado.
- `git diff --check` sin errores; avisos existentes de normalización LF/CRLF y baseline-browser-mapping no impiden compilación.
- Revisión visual autenticada pendiente. Las pruebas de lógica y build no demuestran responsive, apertura del menú o las tarjetas en un navegador con sesión.
- No se cambiaron backend, datos, migraciones, configuración, credenciales o ramas; sin commits/push/despliegues. No se repitió la suite ERP porque esta entrega solo cambia frontend y textos.
