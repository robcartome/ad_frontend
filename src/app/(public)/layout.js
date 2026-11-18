import '@/components/feedback/panels.css';
import './storefront.css';
import '@/components/storefront/storefront-rails.css';
import '@/components/storefront/storefront-contact.css';
import { getPublicWebsite, getStore, getStorefrontCategories } from '@/lib/storefront/store';
import { CartProvider } from '@/components/commerce/CartProvider';
import StoreHeader from '@/components/storefront/StoreHeader';
import StoreFooter from '@/components/storefront/StoreFooter';
export async function generateMetadata() {
    const store = await getStore();
    const site = await getPublicWebsite();
    return { title: { default: site.content.seo.title, template: `%s | ${store.name}` }, description: site.content.seo.description, robots: { index: false, follow: false }, alternates: { canonical: `https://${site.canonicalHostname}/` } };
}
export default async function PublicLayout({ children }) {
    const store = await getStore();
    let categories = [], catalogUnavailable = false;
    try { categories = await getStorefrontCategories(); } catch { catalogUnavailable = true; }
    return <div className="storefront" style={{ '--sf-orange': store.colors.primary, '--sf-background': store.colors.background, '--sf-muted': store.colors.muted }}>
    <CartProvider key={store.id} store={store} products={[]}>
      <a href="#store-main" className="sf-skip">Saltar al contenido</a>
      <StoreHeader store={store} categories={categories}/>
      {catalogUnavailable && <p className="sf-container sf-callout" role="alert">El catálogo no está disponible temporalmente. La información de la empresa sigue disponible.</p>}
      <main id="store-main">{children}</main>
      <StoreFooter store={store} categories={categories}/>
    </CartProvider>
  </div>;
}
