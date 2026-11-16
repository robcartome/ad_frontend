import StoreHome from '@/components/storefront/StoreHome';
import { getPublicWebsite, getStore } from '@/lib/storefront/store';
export default async function HomePage() {
  const site = await getPublicWebsite();
  return <StoreHome store={await getStore()} categories={[]} products={[]} content={site.content} now={Date.now()}/>;
}
