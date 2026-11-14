'use client';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ShoppingBag, MessageCircle } from 'lucide-react';
import { useCart } from './CartProvider';
import CartItem from './CartItem';
import ProductCard from './ProductCard';
import { cartTotals, money, quotationUrl, buildQuotationMessage } from '@/lib/commerce/cart.mjs';

export default function CartPage() {
    const { store, products, items, lines, count, ready, storageError, clear } = useCart();
    const { subtotal, savings, beforeDiscount, unpriced } = cartTotals(lines);
    const url = quotationUrl(store, items, products);
    const suggestions = products.filter(product => !items.some(item => item.id === product.id) && product.availability !== 'unavailable').slice(0, 4);
    return <div className="sf-container sf-page sf-cart-page">
        <nav className="sf-breadcrumb" aria-label="Ruta de navegación"><Link href="/">Inicio</Link><span>/</span><span>Mi carrito</span></nav>
        <div className="sf-cart-page-heading"><div><h1>Mi carrito <span>({ready ? lines.length : 0} productos)</span></h1><p>Todo lo que necesitas para tu próximo proyecto.</p></div><Link className="sf-back-link" href="/shop"><ArrowLeft size={16}/> Seguir comprando</Link></div>
        {storageError && <p className="sf-callout" role="alert">El navegador no permite guardar el carrito. Puedes usarlo durante esta visita.</p>}
        {!ready ? <div className="sf-empty" role="status">Recuperando tu carrito…</div> : !lines.length ? <div className="sf-empty"><ShoppingBag size={44}/><h2>Tu próximo proyecto empieza aquí</h2><p>Agrega productos para preparar tu pedido.</p><Link href="/shop" className="sf-button sf-button-orange">Explorar productos <ArrowRight size={17}/></Link></div> : <>
            <div className="sf-cart-layout">
                <section className="sf-cart-products" aria-label="Productos de tu carrito">
                    <div className="sf-cart-seller"><div><ShoppingBag size={18}/><span>Productos de <strong>{store.name}</strong></span></div><button type="button" className="sf-text-button" onClick={clear}>Vaciar carrito</button></div>
                    {lines.map(line => <CartItem line={line} key={line.id}/>)}
                </section>
                <aside className="sf-cart-summary" aria-labelledby="cart-summary-title">
                    <h2 id="cart-summary-title">Resumen del pedido</h2>
                    <dl className="sf-cart-totals"><div><dt>Productos ({count} unidades)</dt><dd>{money(beforeDiscount)}</dd></div>{savings > 0 && <div className="sf-cart-savings"><dt>Descuentos</dt><dd>−{money(savings)}</dd></div>}<div className="sf-cart-grand-total"><dt>Total referencial{unpriced ? ' parcial' : ''}</dt><dd>{money(subtotal)}</dd></div></dl>
                    {unpriced && <p>Hay productos sin precio publicado. No están incluidos en el total.</p>}
                    {url ? <a href={url} target="_blank" rel="noopener noreferrer" className="sf-button sf-button-orange"><MessageCircle size={19}/> Enviar pedido por WhatsApp</a> : <><button disabled className="sf-button sf-button-orange"><MessageCircle size={19}/> WhatsApp no disponible</button><p className="sf-callout">El envío se habilitará cuando la tienda tenga un número de WhatsApp verificado y salga del modo demo.</p></>}
                    <p>{store.mode === 'demo' ? 'Precios de demostración. ' : ''}Entrega, disponibilidad y precios finales por confirmar con un asesor.</p>
                    <details><summary>Ver mensaje del pedido</summary><pre>{buildQuotationMessage(store, items, products)}</pre></details>
                    <small>Enviar esta solicitud no confirma un pedido, pago ni reserva de stock.</small>
                </aside>
            </div>
            {suggestions.length > 0 && <section className="sf-cart-recommendations" aria-labelledby="cart-recommendations-title"><div><h2 id="cart-recommendations-title">Completa tu proyecto</h2><Link href="/shop">Ver todos <ArrowRight size={16}/></Link></div><div className="sf-cart-recommendation-grid">{suggestions.map(product => <ProductCard key={product.id} product={product}/>)}</div></section>}
        </>}
    </div>;
}
