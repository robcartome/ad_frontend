import StoreCatalog from '@/components/commerce/StoreCatalog';
import Link from '@/components/feedback/LoadingLink';
import { getStore, getStorefrontCategories, getStorefrontBrands, getStorefrontProducts } from '@/lib/storefront/store';
import { normalizeShopQuery } from '@/lib/commerce/shop-filters.mjs';
import '@/components/commerce/shop.css';
export const metadata = { title: 'Productos de la tienda' };
export default async function WebsiteProducts({ searchParams }) {
    const params = await searchParams;
    const query = normalizeShopQuery(params);
    const store = await getStore();
    const limit = 24;
    try {
        const [categories, brands, page] = await Promise.all([
            getStorefrontCategories(), getStorefrontBrands(),
            getStorefrontProducts({ search: query.q, category: query.category, brand: query.brand, min: query.min, max: query.max, ordering: query.sort, limit, offset: (query.page - 1) * limit }),
        ]);
        return <StoreCatalog key={JSON.stringify(query)} query={query} pageData={page} categories={categories} brands={brands} currency={store.currency} primaryColor={store.colors.primary}/>;
    } catch (error) {
        return <section className="sf-container sf-page sf-empty" role="alert"><h1>{error.status === 400 ? 'Revisa los filtros del catálogo' : 'No pudimos cargar los productos'}</h1><p>Comprueba los filtros o vuelve a intentarlo en unos momentos.</p><Link href="/shop" className="sf-button sf-button-orange">Volver al catálogo</Link></section>;
    }
}
