import StoreHome from '@/components/storefront/StoreHome';
import { getStore, getStorefrontCategories, getStorefrontProducts } from '@/lib/storefront/store';
export default function HomePage() { return <StoreHome store={getStore()} categories={getStorefrontCategories()} products={getStorefrontProducts()}/>; }
