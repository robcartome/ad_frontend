import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStorefrontProduct, getStorefrontProducts, getStorefrontCategories } from '@/lib/storefront/store';
import { hasPrice, money } from '@/lib/commerce/cart.mjs';
import ProductArt from '@/components/storefront/ProductArt';
import ProductPurchase from '@/components/commerce/ProductPurchase';
import ProductCard from '@/components/commerce/ProductCard';
export async function generateMetadata({ params }) {
    const product = getStorefrontProduct((await params).id);
    return { title: product?.name ?? 'Producto no encontrado', description: product?.description };
}
export default async function ProductPage({ params }) {
    const product = getStorefrontProduct((await params).id);
    if (!product)
        notFound();
    const category = getStorefrontCategories().find(item => item.id === product.category);
    const related = getStorefrontProducts().filter(item => item.category === product.category && item.id !== product.id);
    return <div className="sf-container sf-page">
    <nav className="sf-breadcrumb" aria-label="Ruta de navegación">
      <Link href="/">Inicio</Link>
      <span>/</span>
      <Link href="/shop">Catálogo</Link>
      <span>/</span>
      <Link href={`/shop?category=${product.category}`}>{category?.name}</Link>
    </nav>
    <section className="sf-product-detail">
      <div className="sf-detail-image">
        <span className="sf-product-tag">DEMOSTRACIÓN</span>
        <ProductArt type={product.image}/>
        <span>Imagen ilustrativa · Fotografía comercial pendiente</span>
      </div>
      <div className="sf-detail-copy">
        <span className="sf-eyebrow">{product.brand}</span>
        <h1>{product.name}</h1>
        <p className="sf-unit">SKU: {product.sku} · Venta por {product.unit}</p>
        <div className="sf-detail-price">{hasPrice(product) ? money(product.price) : 'Consultar precio'}</div>
        <p className="sf-reference">{hasPrice(product) ? 'Precio de demostración. Sujeto a confirmación.' : 'Consulta el precio comercial con un asesor.'}</p>
        <p>{product.description}</p>
        <ProductPurchase product={product}/>
        <p className="sf-unit">Disponibilidad por confirmar. No se reserva stock al agregar.</p>
      </div>
    </section>{related.length > 0 && <section className="sf-section">
      <div className="sf-section-heading">
        <h2>Para completar tu proyecto</h2>
      </div>
      <div className="sf-product-grid">{related.map(item => <ProductCard key={item.id} product={item}/>)}</div>
    </section>}
  </div>;
}
