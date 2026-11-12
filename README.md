# ApuDig Frontend

## Continuidad del storefront

Antes de continuar el desarrollo de la tienda pública, leer [plan y avances del storefront](docs/storefront-plan-y-avances.md). Incluye decisiones, archivos, verificaciones, límites de la demo y pasos para retomar desde otra PC. La tienda pública usa datos de demostración aislados; el panel administrativo conserva su integración existente.

La gestión editorial está en `/admin/website` (Administrar página web en el menú), con borradores, banners, campañas y vista previa local por empresa. Ver [contrato y plan de backend Django](docs/website-cms-backend-plan.md). Por ahora los cambios se guardan en este navegador y se reflejan en la vista previa protegida, sin publicar en la página pública. Pruebas de lógica: `node --test tests/commerce.test.mjs tests/website.test.mjs tests/admin-routes.test.mjs`.

**Catálogos separados:** `/catalog` conserva la vista laboral anterior y `/admin/catalog_admin` mantiene el catálogo administrativo. El website utiliza `/shop` y `/shop/[id]`. El panel Next administra contenido web; los módulos ERP corresponden a Django. Ver [decisiones de navegación, vistas y permisos](docs/admin-web-y-catalogos.md).

Administración del website y consulta de catálogos de ApuDig. El ERP de inventario, ventas, socios y demás operaciones se gestiona desde Django con `apudig_mvp`; el catálogo laboral Next conserva su integración API existente en la rama `mvp_production`.

## Tecnologías

- Next.js 16 con App Router y Turbopack
- React 19
- Tailwind CSS 4
- Radix UI y componentes basados en shadcn/ui
- Sonner para notificaciones
- Lucide React para iconografía

## Requisitos

- Node.js 20.9 o superior
- npm 10 o superior
- API de `apudig_mvp` disponible

## Configuración local

1. Instala las dependencias:

   ```bash
   npm ci
   ```

2. Crea el archivo de entorno a partir del ejemplo:

   ```bash
   cp .env.example .env
   ```

   En PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Ajusta `NEXT_PUBLIC_API_V1_URL` si el backend no utiliza la URL predeterminada.

4. Inicia el entorno de desarrollo:

   ```bash
   npm run dev
   ```

La aplicación queda disponible en `http://localhost:3000`.

## Comandos

```bash
npm run dev
npm run lint
npm run build
npm start
```

## Estructura

```text
src/
├── app/          Rutas públicas, login y panel administrativo
├── components/   Componentes de interfaz y módulos funcionales
├── data/fake/    Datos simulados pendientes de depuración
├── lib/          Contexto de autenticación y utilidades compartidas
├── services/     Acceso a la API por dominio
└── utils/        Importación, reportes y utilidades auxiliares
```

Las rutas se organizan mediante grupos de App Router:

- `src/app/(public)`: portada y catálogo público.
- `src/app/(admin)/admin`: panel protegido por autenticación y empresa seleccionada.
- `src/app/login`: autenticación y selección de empresa.

## Autenticación y alcance

El inicio de sesión obtiene un token inicial y las empresas accesibles. Al seleccionar una empresa, el backend entrega un token con su alcance, roles y permisos. El contexto de autenticación también conserva la sucursal seleccionada.

La autorización del frontend controla la navegación y visibilidad, pero el backend debe validar cada operación protegida.

## Integración con el backend

La variable `NEXT_PUBLIC_API_V1_URL` define la URL base de `apudig_mvp`. Si no se configura, se utiliza `http://127.0.0.1:8000/api/v1`.

La matriz de rutas, servicios, compatibilidad actual con `apudig_mvp` y dependencias simuladas se mantiene en [docs/integration-matrix.md](docs/integration-matrix.md).

## Validación recomendada

Antes de integrar cambios:

```bash
npm run lint
npm run build
```

Para cambios funcionales también deben validarse manualmente el inicio de sesión, la selección de empresa, el módulo modificado y sus permisos asociados.
