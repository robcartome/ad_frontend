'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Plus, Check, MessageCircle } from 'lucide-react';
import { useCart } from './CartProvider';
import { MAX_QUANTITY, validQuantity, quotationUrl } from '@/lib/commerce/cart.mjs';
export default function ProductPurchase({ product }) {
    const { add, ready, store, products } = useCart();
    const [quantity, setQuantity] = useState('1');
    const [added, setAdded] = useState(false);
    const valid = validQuantity(Number(quantity));
    const url = valid ? quotationUrl(store, [{ id: product.id, quantity: Number(quantity) }], products) : null;
    return <div className="sf-purchase">
    <label htmlFor="product-quantity">Cantidad ({product.unit})</label>
    <div>
      <input id="product-quantity" type="number" min="1" max={MAX_QUANTITY} step="1" value={quantity} onChange={event => setQuantity(event.target.value)} aria-invalid={!valid}/>
      <button className="sf-button sf-button-orange" disabled={!ready || !valid} onClick={() => { add(product.id, Number(quantity)); setAdded(true); }}>{added ? <Check size={18}/> : <Plus size={18}/>} Agregar a cotización</button>
    </div>{!valid && <p role="alert">Ingresa una cantidad entera entre 1 y {MAX_QUANTITY}.</p>}{added && <p role="status">Producto agregado. 
      <Link href="/cart">Ver mi cotización →</Link>
    </p>}{url ? <a className="sf-button sf-button-white" href={url} target="_blank" rel="noopener noreferrer">
      <MessageCircle size={18}/> Consultar por WhatsApp
    </a> : <p className="sf-callout">La consulta por WhatsApp estará disponible al activar la tienda y verificar el número comercial.</p>}
  </div>;
}
