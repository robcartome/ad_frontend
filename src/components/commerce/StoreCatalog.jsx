'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowDownUp, Check, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { filterShopProducts, shopUrl, SHOP_SORT_OPTIONS } from '@/lib/commerce/shop-filters.mjs';
import ProductCard from './ProductCard';
import FilterRange from './FilterRange';

function SelectedFilters({ query, categories }) {
  const chips = [
    ...(query.q ? [{ label: `Búsqueda: ${query.q}`, patch: { q: '' } }] : []),
    ...(query.category ? [{ label: categories.find(item => item.id === query.category)?.name || query.category, patch: { category: '' } }] : []),
    ...query.brand.map(brand => ({ label: brand, patch: { brand: query.brand.filter(item => item !== brand) } })),
    ...(query.min !== '' ? [{ label: `Desde S/ ${query.min}`, patch: { min: '' } }] : []),
    ...(query.max !== '' ? [{ label: `Hasta S/ ${query.max}`, patch: { max: '' } }] : []),
  ];
  if (!chips.length) return null;
  return <div className="sf-selected-filters"><div><h3>Filtros seleccionados</h3><Link href={shopUrl(query, { q: '', category: '', brand: [], min: '', max: '' })}>Limpiar todo</Link></div><ul>{chips.map(chip => <li key={chip.label}><Link href={shopUrl(query, chip.patch)} aria-label={`Quitar filtro: ${chip.label}`}>{chip.label}<X size={13}/></Link></li>)}</ul></div>;
}

function Filters({ query, products, categories, onApply }) {
  const [draft, setDraft] = useState(query);
  const [brandSearch, setBrandSearch] = useState('');
  const id = useId();
  const brands = [...new Set(products.map(product => product.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
  const ceiling = Math.ceil(Math.max(0, ...products.map(product => product.price ?? 0)));
  const invalid = (draft.min !== '' && (!Number.isFinite(Number(draft.min)) || Number(draft.min) < 0)) || (draft.max !== '' && (!Number.isFinite(Number(draft.max)) || Number(draft.max) < 0)) || (draft.min !== '' && draft.max !== '' && Number(draft.min) > Number(draft.max));
  function update(patch) { setDraft(previous => ({ ...previous, ...patch })); }
  const count = filterShopProducts(products, draft).length;
  return <form className="sf-shop-filter-form" onSubmit={event => { event.preventDefault(); if (!invalid) onApply(draft); }}>
    <div className="sf-shop-filter-body">
      <SelectedFilters query={query} categories={categories}/>
      <label className="sf-shop-search-label" htmlFor={`${id}-search`}>Nombre o SKU</label><div className="sf-filter-search"><input id={`${id}-search`} type="search" value={draft.q} onChange={event => update({ q: event.target.value })} placeholder="Buscar producto" maxLength={120}/><Search size={17}/></div>
      <details open className="sf-filter-group"><summary>Categoría<ChevronDown size={17}/></summary><fieldset><legend className="sf-sr-only">Seleccionar categoría</legend>{[{ id: '', name: 'Todas las categorías' }, ...categories].map(category => <label key={category.id} className={draft.category === category.id ? 'is-selected' : ''}><input type="radio" name={`${id}-category`} value={category.id} checked={draft.category === category.id} onChange={() => update({ category: category.id })}/><span>{category.name}</span><small>{products.filter(product => !category.id || product.category === category.id).length}</small></label>)}</fieldset></details>
      <details open className="sf-filter-group"><summary>Marca / línea<ChevronDown size={17}/></summary><label className="sf-sr-only" htmlFor={`${id}-brand-search`}>Buscar marca</label><input id={`${id}-brand-search`} type="search" placeholder="Buscar marca o línea" value={brandSearch} onChange={event => setBrandSearch(event.target.value)}/><fieldset><legend className="sf-sr-only">Seleccionar marcas</legend>{brands.filter(brand => brand.toLocaleLowerCase('es').includes(brandSearch.toLocaleLowerCase('es'))).map(brand => <label key={brand} className={draft.brand.includes(brand) ? 'is-selected' : ''}><input type="checkbox" checked={draft.brand.includes(brand)} onChange={event => update({ brand: event.target.checked ? [...draft.brand, brand] : draft.brand.filter(item => item !== brand) })}/><span>{brand}</span><small>{products.filter(product => product.brand === brand).length}</small></label>)}</fieldset></details>
      <details open className="sf-filter-group"><summary>Rango de precio<ChevronDown size={17}/></summary><FilterRange min={draft.min} max={draft.max} ceiling={ceiling} onChange={update}/><p className="sf-filter-hint">Precios en soles. Al filtrar por precio se omiten los productos sin precio publicado.</p></details>
    </div>
    <div className="sf-shop-filter-actions"><button type="submit" disabled={invalid} className="sf-button sf-button-orange">Ver {count} resultados<Check size={17}/></button><button type="button" className="sf-shop-clear" onClick={() => { setDraft({ ...query, q: '', category: '', brand: [], min: '', max: '' }); setBrandSearch(''); }}>Restablecer filtros</button></div>
  </form>;
}

export default function StoreCatalog({ products, categories, query }) {
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState(query.sort);
  const sorted = filterShopProducts(products, query);
  const pageSize = 24;
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const page = Math.min(query.page, totalPages);
  const category = categories.find(item => item.id === query.category);
  const filterCount = Number(Boolean(query.q)) + Number(Boolean(query.category)) + query.brand.length + Number(query.min !== '') + Number(query.max !== '');
  function apply(draft) { router.push(shopUrl(draft)); setFilterOpen(false); }
  return <div className="sf-container sf-page sf-shop">
    <nav className="sf-breadcrumb" aria-label="Ruta de navegación"><Link href="/">Inicio</Link><span>/</span><Link href="/shop">Productos</Link>{category && <><span>/</span><span>{category.name}</span></>}</nav>
    <div className="sf-page-heading"><span className="sf-eyebrow">MATERIALES PARA TUS IDEAS</span><h1>{category?.name || 'Encuentra tu próximo aliado.'}</h1><p>Explora el catálogo de demostración y prepara tu cotización.</p></div>
    <div className="sf-catalog-layout">
      <aside className="sf-shop-sidebar" aria-label="Filtrar productos"><h2><SlidersHorizontal size={18}/> Filtrar productos</h2><Filters query={query} categories={categories} products={products} onApply={apply}/></aside>
      <section className="sf-shop-results" aria-label="Resultados del catálogo">
        <div className="sf-shop-toolbar">
          <Dialog.Root open={sortOpen} onOpenChange={value => { setSortOpen(value); if (value) setSort(query.sort); }}>
            <Dialog.Trigger asChild><button type="button" className="sf-sort-trigger"><ArrowDownUp size={19}/><span><small>Ordenar por</small><strong>{SHOP_SORT_OPTIONS.find(option => option.value === query.sort)?.label}</strong></span><ChevronDown size={16}/></button></Dialog.Trigger>
            <Dialog.Portal><Dialog.Overlay className="sf-shop-overlay"/><Dialog.Content className="storefront sf-shop-drawer sf-shop-sort-drawer"><div className="sf-shop-drawer-heading"><Dialog.Title>Ordenar por</Dialog.Title><Dialog.Close asChild><button type="button" aria-label="Cerrar ordenar"><X size={23}/></button></Dialog.Close></div><Dialog.Description className="sf-sr-only">Elige un orden y pulsa Ver resultados para aplicarlo.</Dialog.Description><form onSubmit={event => { event.preventDefault(); router.push(shopUrl(query, { sort })); setSortOpen(false); }}><fieldset className="sf-sort-options"><legend className="sf-sr-only">Opciones de ordenamiento</legend>{SHOP_SORT_OPTIONS.map(option => <label key={option.value} className={sort === option.value ? 'is-selected' : ''}><input type="radio" name="shop-sort" value={option.value} checked={sort === option.value} onChange={() => setSort(option.value)}/>{option.label}</label>)}</fieldset><div className="sf-shop-filter-actions"><button type="submit" className="sf-button sf-button-orange">Ver resultados<Check size={18}/></button></div></form></Dialog.Content></Dialog.Portal>
          </Dialog.Root>
          <Dialog.Root open={filterOpen} onOpenChange={setFilterOpen}>
            <Dialog.Trigger asChild><button type="button" className="sf-shop-filter-trigger"><SlidersHorizontal size={18}/> Filtrar productos{filterCount > 0 && <span>{filterCount}</span>}</button></Dialog.Trigger>
            <Dialog.Portal><Dialog.Overlay className="sf-shop-overlay"/><Dialog.Content className="storefront sf-shop-drawer sf-shop-filter-drawer"><div className="sf-shop-drawer-heading"><Dialog.Title>Filtrar productos</Dialog.Title><Dialog.Close asChild><button type="button" aria-label="Cerrar filtros"><X size={23}/></button></Dialog.Close></div><Dialog.Description className="sf-sr-only">Combina categoría, marcas y rango de precio; aplica con Ver resultados.</Dialog.Description><Filters query={query} products={products} categories={categories} onApply={apply}/></Dialog.Content></Dialog.Portal>
          </Dialog.Root>
          <span className="sf-shop-result-count" role="status"><strong>{sorted.length}</strong> productos encontrados</span>
        </div>
        <div className="sf-shop-active-filters"><SelectedFilters query={query} categories={categories}/></div>
        {sorted.length ? <><div className="sf-product-grid sf-catalog-grid">{sorted.slice((page - 1) * pageSize, page * pageSize).map(product => <ProductCard key={product.id} product={product}/>)}</div><nav className="sf-pagination" aria-label="Páginas de productos">{Array.from({ length: totalPages }, (_, index) => <Link key={index} href={shopUrl(query, { page: index + 1 })} aria-current={page === index + 1 ? 'page' : undefined}>{index + 1}</Link>)}</nav></> : <div className="sf-empty"><Search size={35}/><h2>No encontramos productos</h2><p>Prueba con otro nombre o modifica los filtros.</p><Link className="sf-button sf-button-orange" href="/shop">Ver todo el catálogo</Link></div>}
      </section>
    </div>
  </div>;
}
