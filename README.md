# ApuDig Frontend

Panel web de ApuDig para catálogo, inventario, ventas, socios de negocio y administración de ferreterías. En la rama `mvp_production` consume la API Django REST Framework de `apudig_mvp`.

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
