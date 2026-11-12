const erpSections = ['products', 'categories', 'brands', 'warehouses', 'inventory', 'partners', 'sales', 'reports', 'administration'];

// These views belong to Django. Deliberately exclude catalog_admin and website:
// the existing internal catalog and website editor must continue to render.
export function isErpRoute(pathname) {
  return erpSections.some(section => pathname === `/admin/${section}` || pathname.startsWith(`/admin/${section}/`));
}
