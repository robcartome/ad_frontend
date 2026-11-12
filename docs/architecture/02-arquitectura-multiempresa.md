# 02. Arquitectura multiempresa revisada

## Decisión

Usar una aplicación Next.js y un backend Django para todas las empresas. El dominio selecciona el website; Django conserva la autoridad sobre empresa, permisos, contenido, productos y publicación.

```text
www.demo.com/*
  -> Next.js proxy
     -> /admin o /login: aplicación administrativa existente
     -> ruta pública: /sites/www.demo.com/* (rewrite interno)
  -> Django resuelve WebsiteDomain -> Website -> Company
```

El hostname es contexto, no autorización. Toda operación administrativa valida usuario, empresa, website y permiso.

## Superficies

| Superficie | URL visible | Implementación |
| --- | --- | --- |
| Web pública | `www.demo.com/` | tema Next.js en código y contenido publicado |
| Ecommerce | `www.demo.com/catalog` | storefront multiempresa |
| Administración | `www.demo.com/admin/*` | `app/(admin)/admin/*`, scoped al dominio y usuario |
| Login | `www.demo.com/login` | sesión limitada al host |
| Ruta interna | `/sites/[hostname]/*` | destino de rewrite; no es URL pública |

`app/(admin)` y `(public)` son route groups: organizan carpetas pero no agregan esos nombres a la URL. La ruta real es `/admin` porque el segmento `admin` sí forma parte de la carpeta.

## Reglas de Proxy

1. Excluir assets, `/_next`, endpoints internos y archivos estáticos.
2. En un host empresarial, dejar pasar `/admin/*` y `/login`.
3. Reescribir rutas públicas a `/sites/<hostname>/<path>`.
4. Bloquear acceso externo directo a `/sites`.
5. No traducir hostname a `company_id` en el navegador.
6. Host desconocido o no verificado falla cerrado.

Proxy solo enruta. La autorización se ejecuta en la aplicación y Django.

## Sesión por dominio

No se comparten cookies entre dominios personalizados. El objetivo recomendado es un BFF de Next.js que emita cookies `HttpOnly`, `Secure`, `SameSite` y host-only. Cada carga administrativa valida:

- website y empresa derivados del hostname verificado;
- usuario autenticado;
- pertenencia/rol en esa empresa;
- permiso requerido.

Aunque el usuario pertenezca a varias empresas, el dominio fija el contexto efectivo. Cambiar IDs en el cliente no cambia el scope backend.

## Contenido y temas

El website guarda un `theme_key` permitido. Next.js usa un registry estático; Django entrega valores para slots conocidos y valida el contrato. La publicación conserva draft, preview privado, snapshot/revisión y caché tagged por `website_id`.

## Estructura Next.js

```text
src/
├── app/
│   ├── (admin)/admin/...
│   ├── (public)/...                 # legado o sitio institucional APUDIG
│   ├── (storefront)/sites/[hostname]/...
│   └── api/...
├── themes/
│   ├── registry.js
│   └── demo-v1/...
├── lib/tenant/...
└── proxy.js
```

No se mueve el storefront a `(public)` solo por el nombre del grupo: ya existen rutas en ese grupo y dos páginas `/` entrarían en conflicto. El rewrite mantiene una URL limpia.

## Seguridad y pruebas

- Querysets públicos scoped por website y empresa.
- Querysets admin scoped por usuario, empresa y website.
- Tenant ausente produce 404/403, nunca queryset global.
- Media, páginas y productos de A no se referencian desde B.
- Pruebas de dos empresas para público, login, admin, preview y publicación.
- CSP, rate limit, auditoría y CSRF en mutaciones.
- Caché y carrito incluyen `website_id`; preview usa `no-store`.

## Dominios

Los dominios pasan por `PENDING -> VERIFIED -> ACTIVE`, con verificación de propiedad, hosting y TLS. Solo un dominio primario es canonical; aliases redirigen. Los nombres reservados no pueden asignarse como subdominios empresariales.

## Decisiones pendientes

- Empresa y diseño piloto.
- Política exacta de BFF y migración desde el JWT actual.
- Uso definitivo de `app/(public)`: institucional o retiro.
- Precio público, stock y checkout posterior.
- Proveedor/flujo para dominios y certificados.
