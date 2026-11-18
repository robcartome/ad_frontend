import Link from "@/components/feedback/LoadingLink";
import { notFound } from "next/navigation";
import {
  getStorefrontProduct,
  getStorefrontProducts,
  getStorefrontCategories,
  getPublicWebsite,
} from "@/lib/storefront/store";
import CatalogImage from "@/components/storefront/CatalogImage";
import ProductPurchase from "@/components/commerce/ProductPurchase";
import ProductCard from "@/components/commerce/ProductCard";
export async function generateMetadata({ params }) {
  const site = await getPublicWebsite();
  let product;
  try { product = await getStorefrontProduct((await params).id); }
  catch { return { title: 'Producto no disponible', robots: { index: false, follow: false } }; }
  return {
    title: product?.seoTitle || product?.name || "Producto no encontrado",
    description: product?.seoDescription || product?.description,
    alternates: product ? { canonical: `https://${site.canonicalHostname}/shop/${product.id}` } : undefined,
    openGraph: product ? { title: product.seoTitle || product.name, description: product.seoDescription || product.description, images: product.images } : undefined,
  };
}
export default async function ProductPage({ params }) {
  await getPublicWebsite();
  let product;
  try { product = await getStorefrontProduct((await params).id); }
  catch { return <section className="sf-container sf-page sf-empty" role="alert"><h1>No pudimos cargar el producto</h1><p>Intenta nuevamente en unos momentos.</p><Link className="sf-button sf-button-orange" href="/shop">Volver al catálogo</Link></section>; }
  if (!product) notFound();
  const category = (await getStorefrontCategories()).find(
    (item) => item.id === product.category,
  );
  const relatedPage = await getStorefrontProducts({ category: product.category ? [product.category] : [], limit: 5 });
  const related = relatedPage.results.filter(item => item.id !== product.id).slice(0, 4);
  return (
    <div className="sf-container sf-page">
      <nav className="sf-breadcrumb" aria-label="Ruta de navegación">
        <Link href="/">Inicio</Link>
        <span>/</span>
        <Link href="/shop">Catálogo</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category}`}>
          {category?.name}
        </Link>
      </nav>
      <section className="sf-product-detail">
        <div className="sf-detail-image">
          <CatalogImage
            src={product.imageUrl}
            alt={product.imageAlt}
            type={product.image}
          />
          {!product.imageUrl && (
            <span>Imagen ilustrativa · Fotografía comercial pendiente</span>
          )}
          {product.images.slice(1).map((src, index) => <CatalogImage key={src} src={src} alt={`${product.imageAlt}, vista ${index + 2}`} type={product.image}/>)}
        </div>
        <div className="sf-detail-copy">
          <span className="sf-eyebrow">{product.brand}</span>
          <h1>{product.name}</h1>
          <p className="sf-unit">
            SKU: {product.sku} · Venta por {product.unit}
          </p>
          <p className="sf-reference">
            Precio final y disponibilidad según la unidad seleccionada.
          </p>
          <p>{product.description}</p>
          <ProductPurchase product={product} />
          <p className="sf-unit">
            Consulta la disponibilidad indicada para cada unidad. Los pedidos aún no están habilitados.
          </p>
        </div>
      </section>
      {related.length > 0 && (
        <section className="sf-section">
          <div className="sf-section-heading">
            <h2>Para completar tu proyecto</h2>
          </div>
          <div className="sf-product-grid">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
