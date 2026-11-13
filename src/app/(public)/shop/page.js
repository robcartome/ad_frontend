import StoreCatalog from '@/components/commerce/StoreCatalog';
import { getStorefrontCategories, getStorefrontProducts } from '@/lib/storefront/store';
import { normalizeShopQuery } from '@/lib/commerce/shop-filters.mjs';
import '@/components/commerce/shop.css';
export const metadata = { title: 'Productos de la tienda' };
export default async function WebsiteProducts({ searchParams }) {
    const params = await searchParams;
    const query = normalizeShopQuery(params);
    return <StoreCatalog key={JSON.stringify(query)} query={query} products={getStorefrontProducts()} categories={getStorefrontCategories()}/>;
}
