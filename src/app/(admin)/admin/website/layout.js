import './website-editor.css';
import '@/app/(public)/storefront.css';
import '@/components/storefront/storefront-rails.css';
import '@/components/storefront/storefront-contact.css';

export const metadata = { title: 'Gestión de página web | APUDIG', robots: { index: false, follow: false } };
export default function WebsiteLayout({ children }) { return children; }
