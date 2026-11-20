import { getPublicWebsite } from '@/lib/storefront/store';
import CommercialProvider from '@/components/account/CommercialProvider';
import CommercialShell from '@/components/account/CommercialShell';

export const metadata = { title: 'Mi cuenta | APUDIG', robots: { index: false, follow: false } };

export default async function AccountLayout({ children }) {
  const website = await getPublicWebsite();
  return <CommercialProvider key={website.websiteId} hostname={website.hostname} websiteId={website.websiteId} companyName={website.content.identity.name}><CommercialShell>{children}</CommercialShell></CommercialProvider>;
}
