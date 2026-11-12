import Link from "next/link";

function pageHref(filters, page, limit) {
  const params = new URLSearchParams();
  for (const key of ["search", "category", "brand", "ordering"]) {
    if (filters[key]) params.set(key, filters[key]);
  }
  if (page > 1) params.set("page", String(page));
  params.set("limit", String(limit));
  return `/catalog?${params}`;
}

export default function CatalogPagination({ total, page, limit, filters }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  const first = Math.max(1, page - 2);
  const last = Math.min(totalPages, page + 2);
  const pages = Array.from({ length: last - first + 1 }, (_, index) => first + index);

  return (
    <nav aria-label="Paginación del catálogo" className="flex flex-wrap items-center justify-center gap-2">
      <Link
        href={pageHref(filters, Math.max(1, page - 1), limit)}
        aria-disabled={page <= 1}
        className={`rounded-lg border px-4 py-2 text-sm ${page <= 1 ? "pointer-events-none opacity-40" : "hover:border-[var(--site-primary)]"}`}
      >
        Anterior
      </Link>
      {pages.map((number) => (
        <Link
          key={number}
          href={pageHref(filters, number, limit)}
          aria-current={number === page ? "page" : undefined}
          className={`min-w-10 rounded-lg border px-3 py-2 text-center text-sm ${number === page ? "border-[var(--site-primary)] bg-[var(--site-primary)] text-white" : "hover:border-[var(--site-primary)]"}`}
        >
          {number}
        </Link>
      ))}
      <Link
        href={pageHref(filters, Math.min(totalPages, page + 1), limit)}
        aria-disabled={page >= totalPages}
        className={`rounded-lg border px-4 py-2 text-sm ${page >= totalPages ? "pointer-events-none opacity-40" : "hover:border-[var(--site-primary)]"}`}
      >
        Siguiente
      </Link>
    </nav>
  );
}
