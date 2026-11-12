"use client";

import Link from "next/link";
import { Check, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/storefront/CartProvider";
import { normalizeQuantity } from "@/lib/cart/cart";

export function CartLink() {
  const { hydrated, itemCount } = useCart();
  return (
    <Link
      href="/cart"
      className="relative inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border bg-white text-slate-800 hover:border-[var(--site-primary)]"
      aria-label={`Carrito${hydrated && itemCount ? `, ${itemCount} artículos` : ""}`}
    >
      <ShoppingCart className="h-5 w-5" aria-hidden="true" />
      {hydrated && itemCount > 0 ? (
        <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--site-accent)] px-1 text-xs font-bold text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </Link>
  );
}

export function AddToCartButton({ product, withQuantity = false }) {
  const { addItem, isFull } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const unavailable = product.availability === "OUT_OF_STOCK";

  function add() {
    addItem(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className={`flex gap-2 ${withQuantity ? "max-w-md" : "w-full"}`}>
      {withQuantity ? (
        <label className="text-sm font-medium">
          <span className="sr-only">Cantidad</span>
          <input
            type="number"
            min="1"
            max="999"
            inputMode="numeric"
            value={quantity}
            onChange={(event) => setQuantity(normalizeQuantity(event.target.value))}
            className="h-11 w-20 rounded-lg border px-3 text-center"
          />
        </label>
      ) : null}
      <button
        type="button"
        onClick={add}
        disabled={unavailable || isFull}
        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--site-primary)] px-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {added ? <Check className="h-5 w-5" aria-hidden="true" /> : <ShoppingCart className="h-5 w-5" aria-hidden="true" />}
        {unavailable ? "Agotado" : added ? "Agregado" : "Agregar al carrito"}
      </button>
    </div>
  );
}
