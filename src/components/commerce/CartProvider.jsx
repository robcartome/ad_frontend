'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { CART_VERSION, MAX_QUANTITY, cartKey, restoreCart, resolveCart, serializeCart, validQuantity } from '@/lib/commerce/cart.mjs';
const CartContext = createContext(null);
export function CartProvider({ store, products, children }) {
    const [items, setItems] = useState([]);
    const [ready, setReady] = useState(false);
    const [notice, setNotice] = useState('');
    const [storageError, setStorageError] = useState(false);
    useEffect(() => {
        try {
            setItems(restoreCart(localStorage.getItem(cartKey(store.id)), store.id, products));
        }
        catch {
            setStorageError(true);
        }
        setReady(true);
    }, [store.id, products]);
    useEffect(() => {
        if (!ready)
            return;
        try {
            localStorage.setItem(cartKey(store.id), serializeCart(items, store.id));
        }
        catch {
            setStorageError(true);
        }
    }, [items, ready, store.id]);
    useEffect(() => {
        const sync = event => {
            if (event.key === cartKey(store.id) || event.key === null)
                setItems(restoreCart(event.newValue, store.id, products));
        };
        window.addEventListener('storage', sync);
        return () => window.removeEventListener('storage', sync);
    }, [store.id, products]);
    function add(id, quantity = 1) {
        if (!ready || !validQuantity(quantity) || !products.some(product => product.id === id))
            return;
        setItems(previous => {
            const current = previous.find(item => item.id === id);
            return current ? previous.map(item => item.id === id ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + quantity) } : item) : [...previous, { id, quantity }];
        });
        setNotice('Producto agregado a tu cotización.');
    }
    function update(id, quantity) {
        if (validQuantity(quantity))
            setItems(previous => previous.map(item => item.id === id ? { ...item, quantity } : item));
    }
    const value = { store, products, items, ready, storageError, add, update, remove: id => setItems(previous => previous.filter(item => item.id !== id)), clear: () => setItems([]), lines: resolveCart(items, products), count: items.reduce((sum, item) => sum + item.quantity, 0), version: CART_VERSION };
    return <CartContext.Provider value={value}>{children}
    <span className="sf-sr-only" role="status" aria-live="polite">{notice}</span>
  </CartContext.Provider>;
}
export function useCart() { return useContext(CartContext); }
