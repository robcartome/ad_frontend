import StoreCatalog from '@/components/commerce/StoreCatalog';
import { getStorefrontCategories, getStorefrontProducts } from '@/lib/storefront/store';
export const metadata = { title: 'Catálogo de productos' };
export default async function PublicCatalog({ searchParams }) {
    const params = await searchParams;
    const text = key => typeof params[key] === 'string' ? params[key].slice(0, 120) : '';
    const query = { q: text('q'), category: text('category'), brand: text('brand'), sort: text('sort') || 'name', page: Math.max(1, Number.parseInt(text('page'), 10) || 1) };
    return <StoreCatalog key={JSON.stringify(query)} query={query} products={getStorefrontProducts()} categories={getStorefrontCategories()}/>;
}
