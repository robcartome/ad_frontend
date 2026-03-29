/**
 * Simple pagination bar component.
 *
 * Props:
 *  - page        {number}   current 1-based page number
 *  - totalPages  {number}   total number of pages
 *  - onPageChange(n) callback
 */
export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = buildPageRange(page, totalPages);

  return (
    <div className="flex items-center justify-center gap-1 mt-3 text-sm select-none">
      <PageBtn
        label="«"
        title="Primera"
        disabled={page === 1}
        onClick={() => onPageChange(1)}
      />
      <PageBtn
        label="‹"
        title="Anterior"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      />

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
            …
          </span>
        ) : (
          <PageBtn
            key={p}
            label={p}
            active={p === page}
            onClick={() => onPageChange(p)}
          />
        ),
      )}

      <PageBtn
        label="›"
        title="Siguiente"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      />
      <PageBtn
        label="»"
        title="Ultima"
        disabled={page === totalPages}
        onClick={() => onPageChange(totalPages)}
      />
    </div>
  );
}

function PageBtn({ label, title, active, disabled, onClick }) {
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={[
        "min-w-[2rem] h-8 px-2 rounded border text-xs font-medium transition-colors",
        active
          ? "bg-teal-700 text-white border-teal-700"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function buildPageRange(current, total) {
  if (total <= 7) return range(1, total);

  const delta = 2;
  const left = Math.max(1, current - delta);
  const right = Math.min(total, current + delta);

  const pages = [];

  if (left > 1) {
    pages.push(1);
    if (left > 2) pages.push("…");
  }

  for (let i = left; i <= right; i++) pages.push(i);

  if (right < total) {
    if (right < total - 1) pages.push("…");
    pages.push(total);
  }

  return pages;
}

function range(from, to) {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}
