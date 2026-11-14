'use client';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import CatalogImage from '@/components/storefront/CatalogImage';
import { productOffer } from '@/lib/commerce/catalog.mjs';
import { hasPrice, money, MAX_QUANTITY, MAX_ITEM_NOTES, validQuantity } from '@/lib/commerce/cart.mjs';
import { useCart } from './CartProvider';

export default function CartItem({ line, onNavigate }) {
    const { update, updateNotes, remove } = useCart();
    const [value, setValue] = useState(String(line.quantity));
    const notesId = useId();
    const errorId = useId();
    useEffect(() => setValue(String(line.quantity)), [line.quantity]);
    const valid = value.trim() !== '' && validQuantity(Number(value));
    const offer = productOffer(line);
    function changeQuantity(quantity) {
        setValue(String(quantity));
        if (validQuantity(Number(quantity))) update(line.id, Number(quantity));
    }
    return <article className="sf-cart-item">
        <Link className="sf-cart-image" href={`/shop/${line.id}`} aria-label={`Ver ${line.name}`} onClick={onNavigate}>
            <CatalogImage src={line.imageUrl} alt={line.imageAlt || line.name} type={line.image}/>
        </Link>
        <div className="sf-cart-details">
            <span className="sf-product-brand">{line.brand}</span>
            <Link className="sf-product-name" href={`/shop/${line.id}`} onClick={onNavigate}>{line.name}</Link>
            <small>SKU: {line.sku || 'Por confirmar'}</small>
            <small>Venta por {line.unit}</small>
        </div>
        <div className="sf-cart-price">
            <div><strong>{hasPrice(line) ? money(line.price) : 'Consultar precio'}</strong>{offer && <span className="sf-cart-discount">−{offer.percent}%</span>}</div>
            {offer && <del><span className="sf-sr-only">Precio anterior: </span>{money(line.originalPrice)}</del>}
            <small>Precio por {line.unit}</small>
        </div>
        <div className="sf-cart-controls">
            <div className="sf-cart-stepper">
                <button type="button" disabled={line.quantity <= 1} aria-label={`Disminuir cantidad de ${line.name}`} onClick={() => changeQuantity(line.quantity - 1)}><Minus size={16}/></button>
                <input type="number" aria-label={`Cantidad de ${line.name}`} min="1" max={MAX_QUANTITY} step="1" value={value} aria-invalid={!valid} aria-describedby={!valid ? errorId : undefined} onChange={event => changeQuantity(event.target.value)} onBlur={() => setValue(String(line.quantity))}/>
                <button type="button" disabled={line.quantity >= MAX_QUANTITY} aria-label={`Aumentar cantidad de ${line.name}`} onClick={() => changeQuantity(line.quantity + 1)}><Plus size={16}/></button>
            </div>
            {!valid && <small id={errorId} role="alert">Usa una cantidad de 1 a {MAX_QUANTITY}.</small>}
            <span className="sf-cart-line-total">{hasPrice(line) ? money(Math.round(line.price * 100) * line.quantity / 100) : 'Por confirmar'} <small>Subtotal</small></span>
        </div>
        <button type="button" className="sf-remove" aria-label={`Eliminar ${line.name}`} onClick={() => remove(line.id)}><Trash2 size={18}/></button>
        <details className="sf-cart-notes">
            <summary>Características y observaciones{line.notes ? ' · Con detalles' : ' (opcional)'}</summary>
            <label htmlFor={notesId}>Indica color, medida u otro detalle que necesitas confirmar.</label>
            <textarea id={notesId} aria-label={`Observaciones de ${line.name}`} rows={2} maxLength={MAX_ITEM_NOTES} value={line.notes || ''} placeholder="Ej. Medida de 1/2 pulgada, color blanco…" onChange={event => updateNotes(line.id, event.target.value)}/>
            <small>El asesor confirmará las características y la disponibilidad.</small>
        </details>
    </article>;
}
