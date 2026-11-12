# Continuidad de APUDIG frontend

Para tareas del storefront, leer primero `docs/storefront-plan-y-avances.md` y `docs/integration-matrix.md`. El primero contiene el plan, estado, archivos, decisiones, pruebas y próximo paso para continuar desde otra PC. No asumir que la demo está conectada a producción.

Para la gestión de página web en `/admin/website`, leer también `docs/website-cms-backend-plan.md`. Documenta el editor local por empresa y el contrato futuro con Django. `apps/websites` en el checkout backend inspeccionado solo contenía artefactos compilados: recuperar y conciliar sus fuentes antes de diseñar modelos/migraciones. No asumir que sus endpoints existen.

Leer `docs/admin-web-y-catalogos.md` antes de cambiar rutas o navegación. **Preservar `/catalog` y `/admin/catalog_admin`**: son los catálogos existentes de uso laboral/producción. No reutilizar `/catalog` para el storefront. Los productos comerciales están en `/shop` y `/shop/[id]`. El sidebar Next se concentra en web/catálogos; el ERP corresponde a Django. Mostrar la entrada de administración web y comprobar permisos dentro de la página.

Al finalizar una entrega del storefront, actualizar el registro con cambios, verificaciones realmente ejecutadas, limitaciones y siguiente paso. Conservar explícitamente lo pendiente; no marcar revisión visual o integración real como completas sin evidencia.

Revisar rama y cambios locales antes de editar. La última rama verificada es `mvp_production`; no cambiarla ni sobrescribir trabajo ajeno automáticamente.

Alcance actual: Next.js/JavaScript; conservar administración y autenticación. Sin cambios Django, pagos, otro CMS ni despliegues. Tienda demo naranja `#FF8000`, blanco y fondo `#F5F5F6`. Las instrucciones nuevas del usuario tienen prioridad.

Verificaciones: `npm run lint`, `npm run build`, `node --test tests/commerce.test.mjs tests/website.test.mjs tests/admin-routes.test.mjs`. Con servidor iniciado: `node tests/storefront-smoke.mjs http://localhost:3000`. En PowerShell usar `npm.cmd` si se bloquea `npm.ps1`.
