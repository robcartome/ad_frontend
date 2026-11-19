'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { CART_VERSION, MAX_QUANTITY, MAX_ITEM_NOTES, cartKey, restoreCart, resolveCart, serializeCart, validQuantity } from '@/lib/commerce/cart.mjs';
import CartDrawer from './CartDrawer';
import { WEBSITE_CART_VERSION, addWebsiteCartItem, cartLineId, restoreWebsiteCart, resolveWebsiteCart, serializeWebsiteCart, websiteCartKey } from '@/lib/commerce/website-cart.mjs';
import { createStorefrontProductsService } from '@/services/storefrontProductsService.mjs';
import { API_URL } from '@/lib/apiConfig';
import './cart.css';
const CartContext = createContext(null);
export function CartProvider({ store, products, children }) {
    const real = store.mode !== 'demo';
    const enabled = real ? store.commerceEnabled === true : store.commerceEnabled !== false;
    const [productCache, setProductCache] = useState({});
    const [storageBlocked, setStorageBlocked] = useState(false);
    const storageKey = real ? websiteCartKey(store.id) : cartKey(store.id);
    const [items, setItems] = useState([]);
    const [ready, setReady] = useState(false);
    const [notice, setNotice] = useState('');
    const [storageError, setStorageError] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [addedId, setAddedId] = useState(null);
    const opener = useRef(null);
    function openCart(id = null) {
        if (!enabled) return;
        if (!cartOpen) opener.current = document.activeElement;
        setAddedId(id);
        setCartOpen(true);
    }
    useEffect(() => {
        if (!enabled) { setReady(true); return; }
        try {
            setItems(real ? restoreWebsiteCart(localStorage.getItem(storageKey), store.id) : restoreCart(localStorage.getItem(storageKey), store.id, products));
        }
        catch {
            setStorageError(true);
            setStorageBlocked(true);
        }
        setReady(true);
    }, [store.id, enabled, products, real, storageKey]);
    useEffect(() => {
        if (!ready || !enabled || storageBlocked)
            return;
        try {
            localStorage.setItem(storageKey, real ? serializeWebsiteCart(items, store.id) : serializeCart(items, store.id));
        }
        catch {
            setStorageError(true);
            setStorageBlocked(true);
        }
    }, [items, ready, store.id, enabled, real, storageKey, storageBlocked]);
    useEffect(() => {
        if (!enabled) return;
        const sync = event => {
            if (event.key !== storageKey && event.key !== null) return;
            try { setItems(real ? restoreWebsiteCart(event.newValue, store.id) : restoreCart(event.newValue, store.id, products)); }
            catch { setStorageError(true); setStorageBlocked(true); }
        };
        window.addEventListener('storage', sync);
        return () => window.removeEventListener('storage', sync);
    }, [store.id, enabled, products, real, storageKey]);
    // Resolve saved IDs independently of the currently paginated catalog.
    useEffect(() => {
        if (!real || !enabled || !ready || !items.length) return;
        const controller = new AbortController();
        const client = createStorefrontProductsService({ baseUrl: API_URL, hostname: store.hostname, websiteId: store.id });
        const identifiers = [...new Set(items.map(item => item.id))];
        const recovered = {};
        let index = 0;
        async function worker() {
            while (index < identifiers.length && !controller.signal.aborted) {
                const id = identifiers[index++];
                try { recovered[id] = await client.detail(id, { signal: controller.signal }); }
                catch { if (!controller.signal.aborted) recovered[id] = null; }
            }
        }
        Promise.all(Array.from({ length: Math.min(4, identifiers.length) }, worker)).then(() => {
            if (!controller.signal.aborted) setProductCache(previous => ({ ...previous, ...recovered }));
        });
        return () => controller.abort();
    }, [items, ready, real, enabled, store.id, store.hostname]);
    function add(value, quantity = 1, unitId) {
        if (!enabled || !ready || !validQuantity(quantity)) return;
        const product = typeof value === 'object' ? value : products.find(product => product.id === value);
        if (!product) return;
        if (real) {
            try {
                const next = addWebsiteCartItem(items, product, unitId || product.unitId, quantity);
                setProductCache(previous => ({ ...previous, [product.id]: product }));
                setItems(next);
            } catch (error) { setNotice(error.message); return; }
        } else {
            setItems(previous => {
                const current = previous.find(item => item.id === product.id);
                return current ? previous.map(item => item.id === product.id ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + quantity) } : item) : [...previous, { id: product.id, quantity }];
            });
        }
        setNotice('Producto agregado a tu cotización.');
        openCart(product.id);
    }
    const identity = item => real ? cartLineId(item) : item.id;
    function update(id, quantity) {
        if (enabled && validQuantity(quantity))
            setItems(previous => previous.map(item => identity(item) === id ? { ...item, quantity } : item));
    }
    function updateNotes(id, notes) {
        if (!enabled) return;
        setItems(previous => previous.map(item => identity(item) === id ? { ...item, notes: notes.slice(0, MAX_ITEM_NOTES) } : item));
    }
    function remove(id) {
        if (enabled) setItems(previous => previous.filter(item => identity(item) !== id));
    }
    function clear() {
        if (!enabled) return;
        setStorageBlocked(false);
        setItems([]);
    }
    const value = {
        store, products, items, ready, storageError,
        add, update, updateNotes, openCart, cartOpen, remove, clear,
        lines: real ? resolveWebsiteCart(items, Object.values(productCache).filter(Boolean)) : resolveCart(items, products),
        count: items.reduce((sum, item) => sum + item.quantity, 0),
        version: real ? WEBSITE_CART_VERSION : CART_VERSION,
    };
    return <CartContext.Provider value={value}>{children}
    <span className="sf-sr-only" role="status" aria-live="polite">{notice}</span>
    <CartDrawer open={enabled && cartOpen} onOpenChange={setCartOpen} addedId={addedId} opener={opener}/>
  </CartContext.Provider>;
}
export function useCart() { return useContext(CartContext); }
