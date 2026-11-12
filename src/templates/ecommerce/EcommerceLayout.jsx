import { CartProvider } from "@/components/storefront/CartProvider";
import { SiteFooter, SiteHeader } from "@/components/storefront/SiteNavigation";

const fonts = {
  system: "ui-sans-serif, system-ui, sans-serif",
  inter: "Inter, ui-sans-serif, system-ui, sans-serif",
  serif: "Georgia, ui-serif, serif",
};

export default function EcommerceLayout({ children, website }) {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: website.name,
    url: website.canonical_url,
    logo: website.theme.logo.url || undefined,
    email: website.contact.email || undefined,
    telephone: website.contact.phone || undefined,
    address: website.contact.address || undefined,
  };
  const style = {
    "--site-primary": website.theme.primary_color,
    "--site-accent": website.theme.accent_color,
    "--site-radius": `${website.theme.border_radius}px`,
    "--site-heading-font": fonts[website.theme.heading_font] || fonts.system,
    fontFamily: fonts[website.theme.body_font] || fonts.system,
  };
  const cartWebsite = {
    id: website.website_id,
    name: website.name,
    currency: website.currency,
    whatsapp: website.contact.whatsapp,
  };

  return (
    <CartProvider website={cartWebsite}>
      <div className="storefront-shell flex min-h-screen flex-col" style={style}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }} />
        <SiteHeader website={website} />
        <div className="flex-1">{children}</div>
        <SiteFooter website={website} />
      </div>
    </CartProvider>
  );
}
