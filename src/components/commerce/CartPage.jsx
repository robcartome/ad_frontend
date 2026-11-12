'use client';
import Link from 'next/link';
import { Trash2, ArrowRight, ShoppingBag, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart } from './CartProvider';
import ProductArt from '@/components/storefront/ProductArt';
import { hasPrice, money, MAX_QUANTITY, validQuantity, quotationUrl, buildQuotationMessage } from '@/lib/commerce/cart.mjs';
function Quantity({ line, update }) {
    const [value, setValue] = useState(String(line.quantity));
    useEffect(() => setValue(String(line.quantity)), [line.quantity]);
    const valid = validQuantity(Number(value));
    return <label className="sf-cart-quantity">Cantidad
    <input type="number" aria-label={`Cantidad de ${line.name}`} min="1" max={MAX_QUANTITY} step="1" value={value} aria-invalid={!valid} onChange={event => { setValue(event.target.value); if (validQuantity(Number(event.target.value)))
        update(line.id, Number(event.target.value)); }} onBlur={() => setValue(String(line.quantity))}/>{!valid && <small role="alert">Usa 1–{MAX_QUANTITY}; se conserva la cantidad anterior.</small>}
  </label>;
}
export default function CartPage() {
    const { store, products, items, lines, ready, storageError, update, remove, clear } = useCart();
    const subtotal = lines.reduce((sum, line) => sum + (hasPrice(line) ? Math.round(line.price * 100) * line.quantity : 0), 0) / 100;
    const unpriced = lines.some(line => !hasPrice(line));
    const url = quotationUrl(store, items, products);
    return <div className="sf-container sf-page">
    <nav className="sf-breadcrumb" aria-label="Ruta de navegación">
      <Link href="/">Inicio</Link>
      <span>/</span>
      <span>Mi cotización</span>
    </nav>
    <div className="sf-page-heading">
      <span className="sf-eyebrow">UN PASO MÁS CERCA DE TU PROYECTO</span>
      <h1>Tu lista de materiales.</h1>
      <p>Organiza lo que necesitas y prepara tu solicitud.</p>
    </div>{storageError && <p className="sf-callout" role="alert">El navegador no permite guardar la lista. Puedes usarla durante esta visita.</p>}{!ready ? <div className="sf-empty" role="status">Recuperando tu lista…</div> : !lines.length ? <div className="sf-empty">
      <ShoppingBag size={44}/>
      <h2>Tu próximo proyecto empieza con una lista</h2>
      <p>Agrega productos del catálogo para preparar tu cotización.</p>
      <Link href="/catalog" className="sf-button sf-button-orange">Explorar productos 
        <ArrowRight size={17}/>
      </Link>
    </div> : <div className="sf-cart-layout">
      <section aria-label="Productos de tu cotización">
        <div className="sf-results-bar">
          <span>{lines.length} productos diferentes</span>
          <button className="sf-text-button" onClick={clear}>Vaciar lista</button>
        </div>{lines.map(line => <article className="sf-cart-item" key={line.id}>
          <Link href={`/catalog/${line.id}`} aria-label={`Ver ${line.name}`}>
            <ProductArt type={line.image}/>
          </Link>
          <div>
            <span className="sf-product-brand">{line.brand}</span>
            <Link className="sf-product-name" href={`/catalog/${line.id}`}>{line.name}</Link>
            <small>SKU: {line.sku} · Por {line.unit}</small>
            <strong>{hasPrice(line) ? money(line.price) : 'Consultar precio'}</strong>
          </div>
          <Quantity line={line} update={update}/>
          <button className="sf-remove" aria-label={`Eliminar ${line.name}`} onClick={() => remove(line.id)}>
            <Trash2 size={19}/>
          </button>
        </article>)}
        <Link className="sf-back-link" href="/catalog">← Seguir explorando productos</Link>
      </section>
      <aside className="sf-cart-summary">
        <span className="sf-eyebrow">RESUMEN DE TU LISTA</span>
        <h2>Todo listo para consultar</h2>
        <div className="sf-subtotal">
          <span>Subtotal referencial{unpriced ? ' parcial' : ''}</span>
          <strong>{money(subtotal)}</strong>
        </div>{unpriced && <p>Hay productos sin precio publicado. No están incluidos en el subtotal.</p>}
        <p>Precios de demostración. Entrega, disponibilidad y precios finales por confirmar con un asesor.</p>{url ? <a href={url} target="_blank" rel="noopener noreferrer" className="sf-button sf-button-orange">
          <MessageCircle size={18}/> Solicitar por WhatsApp
        </a> : <>
          <button disabled className="sf-button sf-button-orange">
            <MessageCircle size={18}/> WhatsApp no disponible
          </button>
          <p className="sf-callout">Estás en una demo. La solicitud se habilitará con datos comerciales reales y un número verificado.</p>
        </>}
        <details>
          <summary>Ver mensaje de cotización</summary>
          <pre>{buildQuotationMessage(store, items, products)}</pre>
        </details>
        <small>Esta lista no confirma un pedido, pago ni reserva de stock.</small>
      </aside>
    </div>}
  </div>;
}

