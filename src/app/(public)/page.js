import StoreHome from '@/components/storefront/StoreHome';
import { getPublicWebsite, getStore, getStorefrontCategories, getStorefrontProducts, getStorefrontProduct } from '@/lib/storefront/store';
export default async function HomePage() {
  const site = await getPublicWebsite();
  let products = [], categories = [], catalogError = false;
  const enabled = new Set(site.content.sections.filter(section => section.enabled).map(section => section.type));
  if (enabled.has('featured') || enabled.has('specials') || enabled.has('promotions')) {
    try {
      const references = [...new Set([...(enabled.has('specials') ? site.content.specials.productIds : []), ...site.content.promotions.flatMap(item => item.productIds)])];
      const [featured, taxonomy, referenced] = await Promise.all([
        enabled.has('featured') ? getStorefrontProducts({ featured: true, ordering: 'featured', limit: 12 }) : Promise.resolve({ results: [] }),
        getStorefrontCategories(),
        Promise.all(references.map(id => getStorefrontProduct(id))),
      ]);
      products = [...new Map([...featured.results, ...referenced.filter(Boolean)].map(product => [product.id, product])).values()];
      categories = taxonomy;
      return <StoreHome store={await getStore()} categories={categories} products={products} featuredProducts={featured.results} content={site.content} now={Date.now()}/>;
    } catch { catalogError = true; }
  }
  return <><StoreHome store={await getStore()} categories={categories} products={products} content={site.content} now={Date.now()}/>{catalogError && <p role="alert" className="sf-container">No pudimos cargar los productos. Intenta nuevamente en unos momentos.</p>}</>;
}
