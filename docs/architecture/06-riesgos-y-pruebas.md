# 06. Riesgos y pruebas

## Registro de riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación / gate |
| --- | --- | --- | --- | --- |
| R1 | Catálogo anónimo mezcla empresas cuando no hay `company_id` | Confirmado | Crítico | Fase 0 bloqueante; scope obligatorio resuelto por dominio; tests de dos empresas. |
| R2 | `/api/v1/products/*` administrativos son `AllowAny` | Confirmado | Crítico | `IsAuthenticated`, empresa obligatoria y permisos; revisar serializadores por campos privados. |
| R3 | `localStorage` expone access/refresh ante XSS | Alta | Alto | CSP, evitar HTML no sanitizado, migración posterior a BFF/cookies HttpOnly, refresh revocable. |
| R4 | Frontend confía visualmente en claims decodificados | Media | Alto | Claims solo UX; Django valida permiso y ownership en toda mutación. |
| R5 | Caché sirve contenido de otro tenant | Media | Crítico | Tags/keys incluyen `website_id`; ausencia de tenant no cachea; E2E alternando hosts. |
| R6 | Dominio personalizado es tomado por tercero o se activa sin propiedad | Media | Crítico | TXT challenge, hostname único, estados, revalidación periódica y asociación Vercel controlada. |
| R7 | Draft o media privada aparece públicamente | Media | Alto | snapshot publicado separado, queries publicadas, URLs/ACL adecuadas y tests negativos. |
| R8 | Precio/stock del carrito queda obsoleto o manipulado | Alta | Alto | Django recalcula `/cart/quote/`; mensaje WhatsApp es cotización, no venta confirmada. |
| R9 | Filtros actuales omiten productos de páginas no cargadas | Confirmado | Medio | filtros/paginación server-side. |
| R10 | SEO duplicado entre subdominio, `www` y custom domain | Alta | Medio | dominio primario, 308 de aliases, canonical/sitemap por tenant. |
| R11 | Endpoints faltantes hacen parecer funcional al ERP frontend | Confirmado | Medio | mantener matriz, flags/estado UI y no mezclar su reparación con CMS. |
| R12 | Esquemas JSON de bloques divergen | Media | Alto | registry versionado, validación Django, fixtures contractuales y fallback seguro. |
| R13 | Revalidación acepta tags arbitrarios o replay | Media | Alto | HMAC, timestamp/nonce, allowlist de tags y rate limit. |
| R14 | Desfase Next 16 / ESLint config 15 | Confirmado | Medio | ticket de alineación con lockfile y build completo antes de nuevas reglas. |
| R15 | Sin pruebas frontend ni pipeline | Confirmado | Alto | introducir pruebas y gates antes de publicar segunda tienda. |
| R16 | Nombre/identidad Tolentino inconsistente | Confirmado | Bajo/negocio | aprobación de contenido; eliminar hardcodes. |

## Matriz de pruebas de seguridad multiempresa

### Backend obligatorio

Crear `company_a`, `company_b`, websites/domains, productos y usuarios equivalentes.

| Caso | Acción | Resultado esperado |
| --- | --- | --- |
| Tenant ausente | catálogo público sin hostname válido | 400/404; cero productos. |
| Lista A | host A solicita productos | Solo `WebsiteProduct` publicados de A. |
| Detalle cruzado | host A solicita slug/UUID de B | 404. |
| Búsqueda/filtros | host A busca término presente solo en B | cero resultados. |
| Producto inactivo/no publicado | host A solicita producto de A no publicable | 404/no listado. |
| Precio privado | respuesta pública | No contiene `price_purchase`, costo, márgenes ni price lists internas. |
| Stock privado | detalle público | No contiene almacenes ni cantidades internas; solo disponibilidad acordada. |
| Usuario A edita página B | token A + ID B | 404. |
| Usuario sin permiso publica A | token válido | 403. |
| Superuser sin contexto | endpoint CMS | rechazo hasta selección explícita. |
| Dominio duplicado | registrar hostname existente | 409. |
| Dominio no verificado | activar | 400/409. |
| Draft | storefront solicita página draft | 404. |
| Media cruzada | bloque A referencia media B | 400/404. |
| Producto cruzado | `WebsiteProduct` A referencia producto B | validación/constraint rechaza. |

Los tests actuales de catálogo usan una sola empresa, por lo que no detectan R1. Deben ampliarse antes de considerar corregido el riesgo.

## Pruebas de autenticación

- Login incorrecto, usuario inactivo, sin empresas y múltiples empresas.
- `select-company` rechaza empresa sin `UserCompanyAccess`.
- Token genérico no accede a endpoint CMS.
- Token scoped A no accede a B aunque el body envíe `company_id=B`.
- Refresh conserva o exige reelección segura del scope; nunca queda acceso global.
- Logout invalida refresh cuando se implemente revocación.
- XSS: CSP bloquea scripts inline/no autorizados; contenido CMS se sanitiza.
- Si se migra a cookies: CSRF, Origin/Referer, SameSite y rotación de sesión.

## Pruebas de dominio y routing

- `tolentino.apudig.com`, mayúsculas, puerto local y punto final normalizan igual.
- Hosts reservados (`web`, `api`, `media`, `www`) no resuelven accidentalmente una tienda.
- Host desconocido no usa website default.
- Dominio custom verificado resuelve el mismo website.
- Alias redirige 308 al primario preservando path/query.
- IDN/punycode se normaliza; IP y host malformado se rechazan.
- `/_next`, assets, favicon y Route Handlers quedan fuera del rewrite.
- `/admin` en host público se redirige al host administrativo o responde según política.
- Headers `X-Forwarded-Host` manipulados desde Internet no cambian tenant fuera de la confianza de plataforma.

## Pruebas de caché

1. Pedir home/producto en A, después B con mismos slugs y volver a A.
2. Confirmar contenido, metadata, JSON-LD y headers correctos en cada respuesta.
3. Publicar A e invalidar `site:A`; verificar que B conserva su versión/caché.
4. Preview nunca entra en caché pública.
5. Sitio suspendido deja de servirse después de invalidación.
6. Rechazar webhook con firma inválida, timestamp viejo o tag de otro website.

## Pruebas CMS

- CRUD de páginas y secciones con orden estable.
- Validación de cada `section_type` y versión.
- Límite de secciones/items/tamaño de texto/media.
- Concurrencia: dos editores; segundo recibe 409 por versión.
- Publicación atómica y rollback a revisión previa.
- Renderer desconocido no rompe toda la página.
- Preview refleja draft y producción conserva snapshot publicado.
- URLs externas solo con protocolos permitidos; texto enriquecido no ejecuta script.

## Pruebas ecommerce Tolentino

- Catálogo responsive y accesible con 0, 1 y muchas páginas de productos.
- Búsqueda por nombre/SKU y filtros reales de categoría/marca en backend.
- Paginación no duplica ni omite productos.
- Producto sin imagen, sin marca/categoría y agotado.
- Precio incluye impuesto y moneda correcta.
- Carrito se particiona por `website_id`; cambiar de dominio no hereda líneas.
- Cantidad inválida, producto retirado y precio cambiado se corrigen al cotizar.
- Enlace WhatsApp usa número del website, encoding correcto y no incluye datos privados.
- Viewports mínimos: 360x800, tablet y desktop; teclado y lector de pantalla.

## Regresión del sistema actual

- Login, selección de empresa, refresh y logout.
- `/admin`, `/admin/products` y `/admin/catalog_admin` con token correcto.
- `/catalog` actual durante la ventana de compatibilidad.
- Imágenes R2 y thumbnails.
- Rutas administrativas que sí tienen contrato API.
- `npm run lint` y `npm run build` en CI; hoy lint pasa y no existe suite frontend.
- Suite Django relevante y completa antes de merge.

## Rendimiento y resiliencia

- Presupuesto inicial: LCP móvil < 2.5 s p75, CLS < 0.1 e INP < 200 ms en producción, sujeto a medición real.
- Prueba con catálogo de volumen representativo; índices en dominio, website/status, WebsiteProduct y slugs.
- Timeouts y manejo 404/429/5xx del backend; storefront muestra fallback sin mezclar cache.
- R2 caído o imagen inválida usa placeholder y no bloquea producto.
- Rate limit en resolve, búsqueda y quote; evitar búsquedas sin límite.

## Gates de salida MVP

No publicar Ferretería Tolentino como arquitectura multiempresa hasta que:

1. R1 y R2 tengan tests verdes con dos empresas.
2. dominio/subdominio esté verificado y canonical definido;
3. draft/publicado y caché por tenant estén probados;
4. precio/stock público no expongan datos internos;
5. catálogo y carrito pasen pruebas móvil/accesibilidad acordadas;
6. exista rollback de publicación y despliegue;
7. monitoreo pueda identificar errores por `website_id` sin registrar secretos o PII.
