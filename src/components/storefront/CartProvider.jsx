"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  CART_MAX_LINES,
  addCartItem,
  cartStorageKey,
  normalizeQuantity,
  sanitizeStoredCart,
} from "@/lib/cart/cart";

const CartContext = createContext(null);

function emitCartEvent(event, websiteId, details = {}) {
  window.dispatchEvent(new CustomEvent("apudig:analytics", {
    detail: { event, website_id: websiteId, ...details },
  }));
}

export function CartProvider({ website, children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const key = cartStorageKey(website.id);

  useEffect(() => {
    try {
      const raw = JSON.parse(window.localStorage.getItem(key) || "null");
      setItems(sanitizeStoredCart(raw, website.id));
    } catch {
      setItems([]);
    }
    setHydrated(true);
  }, [key, website.id]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(key, JSON.stringify({
      version: 1,
      website_id: website.id,
      items,
    }));
  }, [hydrated, items, key, website.id]);

  function addItem(product, quantity = 1) {
    setItems((current) => addCartItem(current, product, quantity));
    emitCartEvent("cart_add", website.id, {
      product_id: product.id,
      quantity: normalizeQuantity(quantity),
    });
  }

  function updateQuantity(productId, quantity) {
    const normalized = normalizeQuantity(quantity);
    setItems((current) => current.map((item) =>
      item.product.id === productId ? { ...item, quantity: normalized } : item));
    emitCartEvent("cart_quantity", website.id, { product_id: productId, quantity: normalized });
  }

  function removeItem(productId) {
    setItems((current) => current.filter((item) => item.product.id !== productId));
    emitCartEvent("cart_remove", website.id, { product_id: productId });
  }

  function clearCart() {
    setItems([]);
    emitCartEvent("cart_clear", website.id);
  }

  function applyQuote(quote) {
    const authoritative = new Map(quote.lines.map((line) => [line.product_id, line]));
    setItems((current) => current.map((item) => {
      const line = authoritative.get(item.product.id);
      if (!line || line.status === "REMOVED") return item;
      return {
        ...item,
        product: {
          ...item.product,
          slug: line.slug,
          sku: line.sku,
          name: line.name,
          price: line.price,
          image: line.image || item.product.image,
          availability: line.availability,
        },
      };
    }));
  }

  const value = useMemo(() => ({
    website,
    items,
    hydrated,
    lineCount: items.length,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    isFull: items.length >= CART_MAX_LINES,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    applyQuote,
  // Functions close over the current website and intentionally change with items.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [hydrated, items, website]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
}
