'use client';
import { useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import ProductCard from './ProductCard';
export default function StoreCatalog({ products, categories, query }) {
    const [open, setOpen] = useState(false);
    const brands = [...new Set(products.map(product => product.brand))];
    const needle = query.q.toLocaleLowerCase('es');
    const filtered = products.filter(product => (!query.category || product.category === query.category) && (!query.brand || product.brand === query.brand) && `${product.name} ${product.sku}`.toLocaleLowerCase('es').includes(needle));
    const sorted = [...filtered].sort((a, b) => query.sort === 'price-asc' ? (a.price ?? Infinity) - (b.price ?? Infinity) : query.sort === 'price-desc' ? (b.price ?? -Infinity) - (a.price ?? -Infinity) : a.name.localeCompare(b.name, 'es'));
    const pageSize = 6;
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const page = Math.min(query.page, totalPages);
    function pageUrl(number) {
        const params = new URLSearchParams();
        for (const key of ['q', 'category', 'brand', 'sort'])
            if (query[key])
                params.set(key, query[key]);
        params.set('page', String(number));
        return `/catalog?${params}`;
    }
    return <div className="sf-container sf-page">
    <nav className="sf-breadcrumb" aria-label="Ruta de navegación">
      <Link href="/">Inicio</Link>
      <span>/</span>
      <span>Catálogo</span>
    </nav>
    <div className="sf-page-heading">
      <span className="sf-eyebrow">MATERIALES PARA TUS IDEAS</span>
      <h1>Encuentra tu próximo aliado.</h1>
      <p>Explora el catálogo de demostración y prepara tu cotización.</p>
    </div>
    <button className="sf-filter-toggle sf-button sf-button-white" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="catalog-filters">
      <SlidersHorizontal size={17}/> {open ? 'Ocultar filtros' : 'Filtrar productos'}
    </button>
    <div className="sf-catalog-layout">
      <aside id="catalog-filters" className={`sf-filters ${open ? 'is-open' : ''}`}>
        <h2>
          <SlidersHorizontal size={18}/> Filtrar catálogo
        </h2>
        <form action="/catalog">
          <label htmlFor="catalog-query">Nombre o SKU</label>
          <div className="sf-filter-search">
            <input id="catalog-query" type="search" name="q" defaultValue={query.q} placeholder="Buscar producto" maxLength={120}/>
            <Search size={16}/>
          </div>
          <label htmlFor="category">Categoría</label>
          <select id="category" name="category" defaultValue={query.category}>
            <option value="">Todas las categorías</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <label htmlFor="brand">Marca / línea</label>
          <select id="brand" name="brand" defaultValue={query.brand}>
            <option value="">Todas las líneas</option>{brands.map(brand => <option key={brand}>{brand}</option>)}
          </select>
          <label htmlFor="sort">Ordenar por</label>
          <select id="sort" name="sort" defaultValue={query.sort}>
            <option value="name">Nombre A–Z</option>
            <option value="price-asc">Menor precio</option>
            <option value="price-desc">Mayor precio</option>
          </select>
          <button className="sf-button sf-button-orange" type="submit">Aplicar filtros 
            <Search size={16}/>
          </button>
          <Link className="sf-reset" href="/catalog">
            <X size={14}/> Limpiar filtros
          </Link>
        </form>
        <p className="sf-filter-note">Filtrado sobre todo el catálogo demo. Precios y productos ilustrativos.</p>
      </aside>
      <section aria-label="Resultados del catálogo">
        <div className="sf-results-bar">
          <span>
            <strong>{sorted.length}</strong> productos encontrados
          </span>
          <span>Catálogo de demostración</span>
        </div>{sorted.length ? <>
          <div className="sf-product-grid sf-catalog-grid">{sorted.slice((page - 1) * pageSize, page * pageSize).map(product => <ProductCard key={product.id} product={product}/>)}</div>
          <nav className="sf-pagination" aria-label="Páginas de productos">{Array.from({ length: totalPages }, (_, index) => <Link key={index} href={pageUrl(index + 1)} aria-current={page === index + 1 ? 'page' : undefined}>{index + 1}</Link>)}</nav>
        </> : <div className="sf-empty">
          <Search size={35}/>
          <h2>No encontramos productos</h2>
          <p>Prueba con otro nombre o modifica los filtros.</p>
          <Link className="sf-button sf-button-dark" href="/catalog">Ver todo el catálogo</Link>
        </div>}
      </section>
    </div>
  </div>;
}
