"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProductImage from "@/components/storefront/ProductImage";
import { useCart } from "@/components/storefront/CartProvider";
import {
  buildWhatsAppUrl,
  cartFingerprint,
  normalizeQuantity,
} from "@/lib/cart/cart";

export default function CartPageClient() {
  const {
    website, items, hydrated, updateQuantity, removeItem, clearCart, applyQuote,
  } = useCart();
  const [quote, setQuote] = useState(null);
  const [quotedFingerprint, setQuotedFingerprint] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clock, setClock] = useState(() => Date.now());
  const fingerprint = cartFingerprint(items);

  useEffect(() => {
    if (quotedFingerprint && quotedFingerprint !== fingerprint) {
      setQuote(null);
      setQuotedFingerprint("");
    }
  }, [fingerprint, quotedFingerprint]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const quoteByProduct = useMemo(
    () => new Map((quote?.lines || []).map((line) => [line.product_id, line])),
    [quote],
  );

  async function validateCart() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/storefront/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: items.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "No pudimos validar el carrito.");
      applyQuote(payload);
      setQuote(payload);
      setQuotedFingerprint(fingerprint);
      window.dispatchEvent(new CustomEvent("apudig:analytics", {
        detail: {
          event: "cart_quote",
          website_id: website.id,
          line_count: payload.lines.length,
          has_changes: payload.has_changes,
        },
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const quoteExpired = quote && new Date(quote.expires_at).getTime() <= clock;
  const whatsappUrl = quote && !quoteExpired && quote.can_submit && quotedFingerprint === fingerprint
    ? buildWhatsAppUrl({ phone: website.whatsapp, websiteName: website.name, quote })
    : "";

  if (!hydrated) return <main className="mx-auto max-w-5xl px-4 py-10"><p>Cargando carrito…</p></main>;
  if (!items.length) {
    return (
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">Tu carrito está vacío</h1>
        <p className="text-slate-600">Agrega productos para solicitar una cotización.</p>
        <Link href="/catalog" className="inline-flex rounded-lg bg-[var(--site-primary)] px-5 py-3 font-semibold text-white">Ver catálogo</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-7 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-semibold uppercase tracking-widest text-[var(--site-accent)]">Cotización</p><h1 className="text-3xl font-bold">Tu carrito</h1></div>
        <button type="button" onClick={clearCart} className="text-sm font-medium text-rose-700 underline">Vaciar carrito</button>
      </header>

      <div className="grid gap-7 lg:grid-cols-[1fr_360px]">
        <section className="space-y-3" aria-label="Productos del carrito">
          {items.map((item) => {
            const quotedLine = quoteByProduct.get(item.product.id);
            const invalid = quotedLine && quotedLine.status !== "ACTIVE";
            return (
              <article key={item.product.id} className={`grid grid-cols-[88px_1fr] gap-4 rounded-[var(--site-radius)] border bg-white p-4 sm:grid-cols-[96px_1fr_auto] ${invalid ? "border-rose-300" : ""}`}>
                <ProductImage src={item.product.image} alt={item.product.name} className="aspect-square w-full rounded-lg object-contain" />
                <div className="min-w-0 space-y-1">
                  <Link href={`/productos/${item.product.slug}`} className="font-semibold hover:text-[var(--site-primary)]">{item.product.name}</Link>
                  <p className="text-sm text-slate-500">SKU {item.product.sku}</p>
                  {quotedLine?.status === "REMOVED" ? <p className="text-sm font-semibold text-rose-700">Este producto ya no está publicado. Retíralo para continuar.</p> : null}
                  {quotedLine?.status === "OUT_OF_STOCK" ? <p className="text-sm font-semibold text-rose-700">Producto agotado. Retíralo para continuar.</p> : null}
                  {quotedLine?.status === "ACTIVE" ? <p className="text-sm text-emerald-700">Precio validado: {quote.currency} {quotedLine.price}</p> : null}
                </div>
                <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:flex-col sm:items-end">
                  <label className="flex items-center gap-2 text-sm"><span>Cantidad</span><input type="number" min="1" max="999" inputMode="numeric" value={item.quantity} onChange={(event) => updateQuantity(item.product.id, normalizeQuantity(event.target.value))} className="h-10 w-20 rounded-lg border px-2 text-center" /></label>
                  <button type="button" onClick={() => removeItem(item.product.id)} className="text-sm font-medium text-rose-700 underline">Retirar</button>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="h-fit space-y-4 rounded-[var(--site-radius)] border bg-slate-50 p-5 lg:sticky lg:top-6">
          <h2 className="text-xl font-bold">Resumen</h2>
          <p className="text-sm text-slate-600">Django volverá a comprobar productos, precios y disponibilidad antes de abrir WhatsApp.</p>
          {quote ? (
            <div className="space-y-2 border-y py-4">
              <div className="flex justify-between text-sm"><span>Referencia</span><span>{quote.quote_id.slice(0, 8).toUpperCase()}</span></div>
              <div className="flex justify-between text-lg font-bold"><span>Total cotizado</span><span>{quote.currency} {quote.total}</span></div>
              <p className="text-xs text-slate-500">Válido hasta {new Date(quote.expires_at).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}.</p>
            </div>
          ) : null}
          {quote?.has_changes ? <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">El catálogo cambió. Revisa las líneas señaladas y vuelve a validar.</p> : null}
          {quoteExpired ? <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">La cotización expiró. Valida nuevamente el carrito.</p> : null}
          {error ? <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</p> : null}
          <button type="button" onClick={validateCart} disabled={loading} className="min-h-11 w-full rounded-lg border border-[var(--site-primary)] px-4 font-semibold text-[var(--site-primary)] disabled:opacity-50">{loading ? "Validando…" : quote ? "Actualizar cotización" : "Validar carrito"}</button>
          {whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-center rounded-lg bg-emerald-600 px-4 text-center font-semibold text-white">Solicitar por WhatsApp</a> : null}
          {quote?.can_submit && !website.whatsapp ? <p className="text-sm text-rose-700">La tienda aún no configuró un número de WhatsApp.</p> : null}
          <p className="text-xs text-slate-500">La cotización no registra una venta ni confirma reserva de stock.</p>
        </aside>
      </div>
    </main>
  );
}
