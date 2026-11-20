import { getPublicWebsite } from '@/lib/storefront/store';
import RegistrationFlow from '@/components/account/RegistrationFlow';
export const metadata = { title: 'Recuperar mi cuenta | APUDIG', robots: { index: false, follow: false } };
export default async function RecoveryPage() {
  const website = await getPublicWebsite();
  return <RegistrationFlow hostname={website.hostname} websiteId={website.websiteId} companyName={website.content.identity.name} recovery/>;
}
