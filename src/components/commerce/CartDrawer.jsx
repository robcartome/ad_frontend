'use client';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowRight, CheckCircle2, ShoppingBag, X } from 'lucide-react';
import { cartTotals, money } from '@/lib/commerce/cart.mjs';
import { useCart } from './CartProvider';
import CartItem from './CartItem';

export default function CartDrawer({ open, onOpenChange, addedId, opener }) {
    const { lines, count, ready, storageError } = useCart();
    const { subtotal, unpriced } = cartTotals(lines);
    const added = lines.some(line => line.id === addedId);
    const close = () => onOpenChange(false);
    return <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
            <Dialog.Overlay className="sf-cart-overlay"/>
            <Dialog.Content className="storefront sf-cart-drawer" onCloseAutoFocus={event => { event.preventDefault(); if (opener.current?.isConnected) opener.current.focus(); }}>
                <header className="sf-cart-drawer-heading">
                    <div>{added ? <CheckCircle2 size={23} className="sf-cart-success"/> : <ShoppingBag size={23}/>}<Dialog.Title>{added ? 'Producto agregado a tu carrito' : 'Mi carrito'}</Dialog.Title></div>
                    <Dialog.Close asChild><button type="button" aria-label="Cerrar carrito"><X size={23}/></button></Dialog.Close>
                </header>
                <Dialog.Description className="sf-cart-drawer-description">{count} {count === 1 ? 'unidad' : 'unidades'} · Revisa las cantidades y los detalles de tu pedido.</Dialog.Description>
                <div className="sf-cart-drawer-body">
                    {storageError && <p className="sf-callout" role="alert">No se puede guardar el carrito en este navegador. Puedes usarlo durante esta visita.</p>}
                    {!ready ? <p role="status">Recuperando tu carrito…</p> : !lines.length ? <div className="sf-cart-drawer-empty"><ShoppingBag size={48}/><h3>Tu carrito está vacío</h3><p>Encuentra los materiales para tu próximo proyecto.</p><Link href="/shop" className="sf-button sf-button-orange" onClick={close}>Explorar productos <ArrowRight size={17}/></Link></div> : lines.map(line => <CartItem key={line.id} line={line} onNavigate={close}/>)}
                </div>
                {ready && lines.length > 0 && <footer className="sf-cart-drawer-footer">
                    <div><span>Subtotal referencial{unpriced ? ' parcial' : ''}</span><strong>{money(subtotal)}</strong></div>
                    {unpriced && <p>Hay productos con precio por confirmar.</p>}
                    <Link href="/cart" className="sf-button sf-button-orange" onClick={close}>Ir al carrito <ArrowRight size={18}/></Link>
                    <button type="button" className="sf-cart-continue" onClick={close}>Seguir comprando</button>
                </footer>}
            </Dialog.Content>
        </Dialog.Portal>
    </Dialog.Root>;
}
