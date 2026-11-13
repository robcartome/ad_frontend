import './storefront.css';
import '@/components/storefront/storefront-rails.css';
import '@/components/storefront/storefront-contact.css';
import { getStore, getStorefrontCategories, getStorefrontProducts } from '@/lib/storefront/store';
import { CartProvider } from '@/components/commerce/CartProvider';
import StoreHeader from '@/components/storefront/StoreHeader';
import StoreFooter from '@/components/storefront/StoreFooter';
export async function generateMetadata() {
    const store = getStore();
    return { title: { default: `${store.name} | Construye tus proyectos`, template: `%s | ${store.name}` }, description: store.description, robots: { index: false, follow: false } };
}
export default function PublicLayout({ children }) {
    const store = getStore();
    const categories = getStorefrontCategories();
    return <div className="storefront" style={{ '--sf-orange': store.colors.primary, '--sf-background': store.colors.background, '--sf-muted': store.colors.muted }}>
    <CartProvider key={store.id} store={store} products={getStorefrontProducts()}>
      <a href="#store-main" className="sf-skip">Saltar al contenido</a>
      <StoreHeader store={store} categories={categories}/>
      <main id="store-main">{children}</main>
      <StoreFooter store={store} categories={categories}/>
    </CartProvider>
  </div>;
}
