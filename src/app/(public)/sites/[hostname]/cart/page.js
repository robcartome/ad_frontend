import CartPageClient from "@/components/storefront/CartPageClient";

export const metadata = {
  title: "Carrito de cotización",
  robots: { index: false, follow: false },
};

export default function StorefrontCartPage() {
  return <CartPageClient />;
}
