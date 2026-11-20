import '@/app/(public)/storefront.css';
import { getStore } from '@/lib/storefront/store';
import CommercialCart from '@/components/account/CommercialCart';
export default async function AccountCartPage() { return <CommercialCart store={await getStore()}/>; }
