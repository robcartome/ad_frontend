# 🖥️ ApuDig Frontend — Panel Administrativo

Frontend desarrollado con **Next.js (App Router)** para el sistema APUDIG.

Incluye módulos de inventario, ventas, socios de negocio y facturación, consumiendo la API FastAPI del backend.

## 🚀 Tecnologías principales

- Next.js 14+
- React
- Tailwind CSS
- Sonner (notificaciones)
- Lucide React (iconografía)

## ▶️ Ejecución local

Instalar dependencias:

```bash
npm install
```

Iniciar entorno de desarrollo:

```bash
npm run dev
```

Abrir en el navegador:

- `http://localhost:3000`

## 📌 Estado actual del branch (abril 2026)

Este branch alinea frontend con la refactorización de socios de negocio del backend.

### Cambios funcionales principales

1. **Clientes (Customer BC)**
	- Ruta canónica consumida: `/customers`.
	- Se removieron llamadas legacy a `/sales/customers`.
	- Se removió el uso de `/v2/customers`.

2. **Proveedores (Supplier BC)**
	- Ruta canónica consumida: `/suppliers`.
	- Servicio de proveedores unificado para list/search/get/create/update.
	- Integración de partners para mantener compatibilidad de pantallas.

3. **Movimientos de inventario (Entries/Exits)**
	- `EXIT`: selector de cliente con buscador reutilizable (`CustomerSearchInput`).
	- `ENTRY`: selector de proveedor migrado a buscador reutilizable (`SupplierSearchInput`).
	- Se eliminó el prefetch masivo de socios para formularios de movimiento.

## 🧱 Componentes reutilizables agregados

- `src/components/ui/CustomerSearchInput.jsx`
- `src/components/ui/SupplierSearchInput.jsx`

Ambos componentes usan búsqueda incremental con debounce y dropdown posicionado, para reducir carga inicial y mejorar UX.

## 🔌 Servicios API relevantes

- `src/services/salesService.js` (clientes en ventas)
- `src/services/partnersService.js` (compatibilidad de socios)
- `src/services/customersService.js`
- `src/services/suppliersService.js`

## 📂 Estructura de referencia

- `src/app/(admin)/admin/inventory/entries` — registro de ingresos
- `src/app/(admin)/admin/inventory/exits` — registro de salidas
- `src/components/admin/movements` — formularios y detalle de movimientos
- `src/components/admin/partners` — gestión de clientes/proveedores

## ✅ Recomendación de validación manual

1. Entrar a `admin/inventory/entries` y buscar proveedor por nombre o documento.
2. Entrar a `admin/inventory/exits` y buscar cliente por nombre o documento.
3. Crear/editar proveedor en `admin/partners/suppliers`.
4. Confirmar que no existan llamadas a endpoints legacy en consola de red.
