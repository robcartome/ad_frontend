"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import Link from "@/components/feedback/LoadingLink";
import LoadingIndicator from "@/components/feedback/LoadingIndicator";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowDownUp,
  Check,
  ChevronDown,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  shopUrl,
  SHOP_SORT_OPTIONS,
} from "@/lib/commerce/shop-filters.mjs";
import ProductCard from "./ProductCard";
import FilterRange from "./FilterRange";

function SelectedFilters({ query, categories, brands = [], currency = 'PEN' }) {
  const chips = [
    ...(query.q ? [{ label: `Búsqueda: ${query.q}`, patch: { q: "" } }] : []),
    ...query.category.map((id) => ({
      label: categories.find((item) => item.id === id)?.name || id,
      patch: { category: query.category.filter((item) => item !== id) },
    })),
    ...query.brand.map((brand) => ({
      label: brands.find(item => item.id === brand)?.name || brand,
      patch: { brand: query.brand.filter((item) => item !== brand) },
    })),
    ...(query.min !== ""
      ? [{ label: `Desde ${currency} ${query.min}`, patch: { min: "" } }]
      : []),
    ...(query.max !== ""
      ? [{ label: `Hasta ${currency} ${query.max}`, patch: { max: "" } }]
      : []),
  ];
  if (!chips.length) return null;
  return (
    <div className="sf-selected-filters">
      <div>
        <h3>Filtros seleccionados</h3>
        <Link
          href={shopUrl(query, {
            q: "",
            category: [],
            brand: [],
            min: "",
            max: "",
          })}
        >
          Limpiar todo
        </Link>
      </div>
      <ul>
        {chips.map((chip) => (
          <li key={chip.label}>
            <Link
              href={shopUrl(query, chip.patch)}
              aria-label={`Quitar filtro: ${chip.label}`}
            >
              {chip.label}
              <X size={13} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Filters({ query, categories, brands, facets, currency, onApply }) {
  const [draft, setDraft] = useState(query);
  const [brandSearch, setBrandSearch] = useState("");
  const id = useId();
  const invalid =
    (draft.min !== "" &&
      (!Number.isFinite(Number(draft.min)) || Number(draft.min) < 0)) ||
    (draft.max !== "" &&
      (!Number.isFinite(Number(draft.max)) || Number(draft.max) < 0)) ||
    (draft.min !== "" &&
      draft.max !== "" &&
      Number(draft.min) > Number(draft.max));
  function update(patch) {
    setDraft((previous) => ({ ...previous, ...patch }));
  }
  return (
    <form
      className="sf-shop-filter-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!invalid) onApply(draft);
      }}
    >
      <div className="sf-shop-filter-body">
        <SelectedFilters query={query} categories={categories} brands={brands} currency={currency}/>
        <label className="sf-shop-search-label" htmlFor={`${id}-search`}>
          Nombre o SKU
        </label>
        <div className="sf-filter-search">
          <input
            id={`${id}-search`}
            type="search"
            value={draft.q}
            onChange={(event) => update({ q: event.target.value })}
            placeholder="Buscar producto"
            maxLength={120}
          />
          <Search size={17} />
        </div>
        <details open className="sf-filter-group">
          <summary>
            Categoría
            <ChevronDown size={17} />
          </summary>
          <fieldset>
            <legend className="sf-sr-only">Seleccionar categoría</legend>
            {[{ id: "", name: "Todas las categorías" }, ...categories].map(
              (category) => (
                <label
                  key={category.id}
                  className={
                    (
                      category.id
                        ? draft.category.includes(category.id)
                        : !draft.category.length
                    )
                      ? "is-selected"
                      : ""
                  }
                >
                  <input
                    type="checkbox"
                    name={`${id}-category`}
                    value={category.id}
                    checked={
                      category.id
                        ? draft.category.includes(category.id)
                        : !draft.category.length
                    }
                    onChange={(event) =>
                      update({
                        category: !category.id
                          ? []
                          : event.target.checked
                            ? [...draft.category, category.id]
                            : draft.category.filter(
                                (value) => value !== category.id,
                              ),
                      })
                    }
                  />
                  <span>{category.name}</span>
                  <small>
                    {category.id ? facets.categories.find(item => item.id === category.id)?.productCount ?? 0 : ''}
                  </small>
                </label>
              ),
            )}
          </fieldset>
        </details>
        <details open className="sf-filter-group">
          <summary>
            Marca / línea
            <ChevronDown size={17} />
          </summary>
          <label className="sf-sr-only" htmlFor={`${id}-brand-search`}>
            Buscar marca
          </label>
          <input
            id={`${id}-brand-search`}
            type="search"
            placeholder="Buscar marca o línea"
            value={brandSearch}
            onChange={(event) => setBrandSearch(event.target.value)}
          />
          <fieldset>
            <legend className="sf-sr-only">Seleccionar marcas</legend>
            {brands
              .filter((brand) =>
                brand.name
                  .toLocaleLowerCase("es")
                  .includes(brandSearch.toLocaleLowerCase("es")),
              )
              .map((brand) => (
                <label
                  key={brand.id}
                  className={draft.brand.includes(brand.id) ? "is-selected" : ""}
                >
                  <input
                    type="checkbox"
                    checked={draft.brand.includes(brand.id)}
                    onChange={(event) =>
                      update({
                        brand: event.target.checked
                          ? [...draft.brand, brand.id]
                          : draft.brand.filter((item) => item !== brand.id),
                      })
                    }
                  />
                  <span>{brand.name}</span>
                  <small>
                    {facets.brands.find(item => item.id === brand.id)?.productCount ?? 0}
                  </small>
                </label>
              ))}
          </fieldset>
        </details>
        <details open className="sf-filter-group">
          <summary>
            Rango de precio
            <ChevronDown size={17} />
          </summary>
          <FilterRange
            min={draft.min}
            max={draft.max}
            currency={currency}
            onChange={update}
          />
          <p className="sf-filter-hint">
            Precios en {currency}. Al filtrar por precio se omiten los productos sin
            precio publicado.
          </p>
        </details>
      </div>
      <div className="sf-shop-filter-actions">
        <button
          type="submit"
          disabled={invalid}
          className="sf-button sf-button-orange"
        >
          Aplicar filtros
          <Check size={17} />
        </button>
        <button
          type="button"
          className="sf-shop-clear"
          onClick={() => {
            setDraft({
              ...query,
              q: "",
              category: [],
              brand: [],
              min: "",
              max: "",
            });
            setBrandSearch("");
          }}
        >
          Restablecer filtros
        </button>
      </div>
    </form>
  );
}

export default function StoreCatalog({ pageData, categories, brands, query, currency, primaryColor }) {
  const router = useRouter();
  const toolbarMarker = useRef(null);
  useEffect(() => {
    const marker = toolbarMarker.current;
    const root = document.documentElement;
    if (!marker) return;
    const update = () =>
      root.toggleAttribute(
        "data-shop-toolbar-stuck",
        marker.getBoundingClientRect().bottom <= 0,
      );
    update();
    const observer = new IntersectionObserver(update, { threshold: 0 });
    observer.observe(marker);
    return () => {
      observer.disconnect();
      root.removeAttribute("data-shop-toolbar-stuck");
    };
  }, []);
  const [pending, startTransition] = useTransition();
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState(query.sort);
  const products = pageData.results;
  const totalPages = Math.max(1, Math.ceil(pageData.count / pageData.limit));
  const page = query.page;
  const category =
    query.category.length === 1
      ? categories.find((item) => item.id === query.category[0])
      : null;
  const filterCount =
    Number(Boolean(query.q)) +
    query.category.length +
    query.brand.length +
    Number(query.min !== "") +
    Number(query.max !== "");
  function apply(draft) {
    startTransition(() => router.push(shopUrl(draft)));
    setFilterOpen(false);
  }
  return (
    <div className="sf-container sf-page sf-shop">
      <nav className="sf-breadcrumb" aria-label="Ruta de navegación">
        <Link href="/">Inicio</Link>
        <span>/</span>
        <Link href="/shop">Productos</Link>
        {category && (
          <>
            <span>/</span>
            <span>{category.name}</span>
          </>
        )}
      </nav>
      <div className="sf-page-heading">
        <span className="sf-eyebrow">MATERIALES PARA TUS IDEAS</span>
        <h1>
          {category?.name ||
            (query.category.length > 1
              ? "Productos de tus categorías"
              : "Encuentra tu próximo aliado.")}
        </h1>
        <p>Explora los productos y precios publicados por la empresa. Los pedidos aún no están habilitados.</p>
      </div>
      <div className="sf-catalog-layout">
        <aside className="sf-shop-sidebar" aria-label="Filtrar productos">
          <h2>
            <SlidersHorizontal size={18} /> Filtrar productos
          </h2>
          <Filters
            query={query}
            categories={categories}
            brands={brands}
            facets={pageData.facets}
            currency={currency}
            onApply={apply}
          />
        </aside>
        <section
          className="sf-shop-results"
          aria-label="Resultados del catálogo"
          aria-busy={pending}
        >
          {pending && (
            <LoadingIndicator overlay label="Actualizando resultados…" />
          )}
          <div
            ref={toolbarMarker}
            className="sf-shop-toolbar-marker"
            aria-hidden="true"
          />
          <div className="sf-shop-toolbar">
            <Dialog.Root
              open={sortOpen}
              onOpenChange={(value) => {
                setSortOpen(value);
                if (value) setSort(query.sort);
              }}
            >
              <Dialog.Trigger asChild>
                <button
                  type="button"
                  className="sf-sort-trigger"
                  aria-label={`Ordenar productos: ${SHOP_SORT_OPTIONS.find((option) => option.value === query.sort)?.label}`}
                >
                  <span className="sf-sort-mobile-label">Ordenar</span>
                  <ArrowDownUp size={19} />
                  <span className="sf-sort-desktop-label">
                    <small>Ordenar por</small>
                    <strong>
                      {
                        SHOP_SORT_OPTIONS.find(
                          (option) => option.value === query.sort,
                        )?.label
                      }
                    </strong>
                  </span>
                  <ChevronDown size={16} />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="sf-shop-overlay" />
                <Dialog.Content className="storefront sf-shop-drawer sf-shop-sort-drawer" style={{ '--sf-orange': primaryColor }}>
                  <div className="sf-shop-drawer-heading">
                    <Dialog.Title>Ordenar por</Dialog.Title>
                    <Dialog.Close asChild>
                      <button type="button" aria-label="Cerrar ordenar">
                        <X size={23} />
                      </button>
                    </Dialog.Close>
                  </div>
                  <Dialog.Description className="sf-sr-only">
                    Elige un orden y pulsa Ver resultados para aplicarlo.
                  </Dialog.Description>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      startTransition(() =>
                        router.push(shopUrl(query, { sort })),
                      );
                      setSortOpen(false);
                    }}
                  >
                    <fieldset className="sf-sort-options">
                      <legend className="sf-sr-only">
                        Opciones de ordenamiento
                      </legend>
                      {SHOP_SORT_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className={sort === option.value ? "is-selected" : ""}
                        >
                          <input
                            type="radio"
                            name="shop-sort"
                            value={option.value}
                            checked={sort === option.value}
                            onChange={() => setSort(option.value)}
                          />
                          {option.label}
                        </label>
                      ))}
                    </fieldset>
                    <div className="sf-shop-filter-actions">
                      <button
                        type="submit"
                        className="sf-button sf-button-orange"
                      >
                        Ver resultados
                        <Check size={18} />
                      </button>
                    </div>
                  </form>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            <Dialog.Root open={filterOpen} onOpenChange={setFilterOpen}>
              <Dialog.Trigger asChild>
                <button
                  type="button"
                  className="sf-shop-filter-trigger"
                  aria-label={`Filtrar productos, ${filterCount} filtros aplicados`}
                >
                  <SlidersHorizontal size={18} />
                  <span className="sf-shop-filter-label">
                    Filtrar productos
                  </span>
                  {filterCount > 0 && <span>{filterCount}</span>}
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="sf-shop-overlay" />
                <Dialog.Content className="storefront sf-shop-drawer sf-shop-filter-drawer" style={{ '--sf-orange': primaryColor }}>
                  <div className="sf-shop-drawer-heading">
                    <Dialog.Title>Filtrar productos</Dialog.Title>
                    <Dialog.Close asChild>
                      <button type="button" aria-label="Cerrar filtros">
                        <X size={23} />
                      </button>
                    </Dialog.Close>
                  </div>
                  <Dialog.Description className="sf-sr-only">
                    Combina categoría, marcas y rango de precio; aplica con Ver
                    resultados.
                  </Dialog.Description>
                  <Filters
                    query={query}
                    brands={brands}
                    facets={pageData.facets}
                    currency={currency}
                    categories={categories}
                    onApply={apply}
                  />
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            <span className="sf-shop-result-count" role="status">
              <strong>{pageData.count}</strong> Resultados
            </span>
            <div className="sf-shop-active-filters">
              <SelectedFilters query={query} categories={categories} brands={brands} currency={currency}/>
            </div>
          </div>
          {products.length ? (
            <>
              <div className="sf-product-grid sf-catalog-grid">
                {products
                  .map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
              </div>
              <nav className="sf-pagination" aria-label="Páginas de productos">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, index) => Math.max(1, Math.min(page - 3, totalPages - 6)) + index).map(pageNumber => (
                  <Link
                    key={pageNumber}
                    href={shopUrl(query, { page: pageNumber })}
                    aria-current={page === pageNumber ? "page" : undefined}
                  >
                    {pageNumber}
                  </Link>
                ))}
              </nav>
            </>
          ) : (
            <div className="sf-empty">
              <Search size={35} />
              <h2>No encontramos productos</h2>
              <p>Prueba con otro nombre o modifica los filtros.</p>
              <Link className="sf-button sf-button-orange" href="/shop">
                Ver todo el catálogo
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
