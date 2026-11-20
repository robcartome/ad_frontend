'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { API_URL } from '@/lib/apiConfig';
import { CartProvider, useCart } from '@/components/commerce/CartProvider';
import ProductCard from '@/components/commerce/ProductCard';
import CartItem from '@/components/commerce/CartItem';
import { createStorefrontProductsService } from '@/services/storefrontProductsService.mjs';
import { cartQuoteItems } from '@/lib/commerce/website-cart.mjs';
import { formatPublicMoney } from '@/lib/commerce/catalog.mjs';
import { useCommercialAccount } from './CommercialProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingIndicator from '@/components/feedback/LoadingIndicator';

function CartReview({ store }) {
  const account = useCommercialAccount();
  const cart = useCart();
  const client = useMemo(() => createStorefrontProductsService({ baseUrl: API_URL, hostname: store.hostname, websiteId: store.id }), [store.hostname, store.id]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(null);
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState(null);
  const [unitId, setUnitId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [offer, setOffer] = useState(null);
  const [conflict, setConflict] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [shareConfirmed, setShareConfirmed] = useState(false);
  const [prepared, setPrepared] = useState(null);
  const [privacy, setPrivacy] = useState(null);
  const [guestImported, setGuestImported] = useState(false);
  const [importNotice, setImportNotice] = useState('');
  const submission = useRef(null);
  const items = cartQuoteItems(cart.items);
  const signature = JSON.stringify(items);
  useEffect(() => {
    if (!offer?.data.ordersEnabled || !account.profile.capabilities.prepareOrders) return;
    let active = true;
    account.privacy().then(value => { if (active) setPrivacy(value); }).catch(failure => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, [offer?.data.ordersEnabled, account.profile.capabilities.prepareOrders, account.privacy]);
  useEffect(() => {
    const controller = new AbortController();
    setBusy(true); setError('');
    client.list({ search: query, limit: 8, offset, signal: controller.signal }).then(setPage).catch(failure => { if (!controller.signal.aborted) setError(failure.message); }).finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [client, query, offset]);
  async function choose(productId) {
    setBusy(true); setError('');
    try { const product = await client.detail(productId); setSelected(product); setUnitId(product.unitId); }
    catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  async function calculate(confirm = false) {
    setBusy(true); setError('');
    try {
      const result = await account.cartReview(items, confirm ? offer.data.offerFingerprint : undefined);
      setOffer({ data: result, signature }); setConflict(false);
      if (!confirm) { setShareConfirmed(false); setPrepared(null); submission.current = null; }
    } catch (failure) {
      const details = Object.entries(failure.fields || {}).map(([path, value]) => {
        const index = path.match(/^items\.(\d+)/)?.[1];
        return `${index !== undefined ? cart.lines[Number(index)]?.name || 'Producto' : 'Selección'}: ${value}`;
      });
      setError([failure.message, ...details].join(' '));
      if (failure.status === 409) setConflict(true);
    }
    finally { setBusy(false); }
  }
  async function prepare() {
    if (!privacy || !shareConfirmed || !offer?.data.confirmed || offer.signature !== signature || !offer.data.ordersEnabled || !account.profile.capabilities.prepareOrders) return;
    setBusy(true); setError('');
    const body = JSON.stringify({ items, fingerprint: offer.data.offerFingerprint, note });
    if (submission.current?.body !== body) submission.current = { body, key: crypto.randomUUID() };
    try {
      if (!privacy.accepted) await account.acceptPrivacy(privacy.version);
      setPrepared(await account.prepareRequest(items, offer.data.offerFingerprint, note, submission.current.key, shareConfirmed));
    }
    catch (failure) { setError(failure.message); if (failure.status === 409) setConflict(true); }
    finally { setBusy(false); }
  }
  const changed = offer && offer.signature !== signature;
  return <section className="space-y-6 p-4">
    <h1 className="text-2xl font-semibold">Revisar mi selección</h1><p>Selecciona productos y revisa la oferta de tu cuenta. Esta revisión no crea pedidos ni reserva stock.</p>
    <div className="space-y-2"><Button variant="outline" disabled={busy || !cart.ready || guestImported} onClick={() => {
      try {
        const count = cart.importGuestCart();
        setGuestImported(true);
        setImportNotice(count ? 'Selección de la tienda incorporada. Revisa las cantidades y calcula la oferta actual.' : 'No hay una selección guardada en la tienda de este navegador.');
      } catch { setError('No pudimos incorporar la selección. Conservamos ambos carritos sin reemplazarlos.'); }
    }}>Incorporar mi carrito de la tienda</Button><p className="text-sm">Se sumará a tu selección de esta cuenta, sin borrar el carrito de la tienda.</p>{importNotice && <p role="status">{importNotice}</p>}</div>
    {error && <p role="alert" className="text-red-700">{error}</p>}{busy && <LoadingIndicator label="Consultando la oferta…"/>}
    <form className="flex flex-wrap gap-3" onSubmit={event => { event.preventDefault(); setOffset(0); setQuery(search); }}><Input className="max-w-md" aria-label="Buscar productos publicados" value={search} maxLength={120} onChange={event => setSearch(event.target.value)}/><Button disabled={busy}>Buscar</Button></form>
    <p className="text-sm text-gray-600">Las tarjetas muestran referencias del catálogo público. El resumen aplica la lista autorizada de tu cuenta cuando corresponda.</p>
    {page && <><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{page.results.map(product => <div key={product.id}><ProductCard product={product}/><Button variant="outline" className="mt-2 w-full" disabled={busy} onClick={() => choose(product.id)}>Elegir presentación</Button></div>)}</div><div className="flex flex-wrap gap-3"><Button variant="outline" disabled={busy || !offset} onClick={() => setOffset(value => Math.max(0, value - 8))}>Anterior</Button><Button variant="outline" disabled={busy || offset + page.results.length >= page.count} onClick={() => setOffset(value => value + 8)}>Siguiente</Button></div>{!page.count && <p>No hay productos publicados que coincidan.</p>}</>}
    {selected && <form className="space-y-3 rounded border bg-white p-4" onSubmit={event => { event.preventDefault(); cart.add(selected, Number(quantity), unitId); }}><h2 className="font-semibold">{selected.name}</h2><Label htmlFor="cart-sale-unit">Presentación</Label><select className="block w-full rounded border p-2" id="cart-sale-unit" value={unitId} onChange={event => setUnitId(event.target.value)}>{selected.saleUnits.map(unit => <option key={unit.unitId} value={unit.unitId}>{unit.unit}</option>)}</select><Label htmlFor="cart-sale-quantity">Cantidad</Label><Input id="cart-sale-quantity" type="number" min={1} max={999} required value={quantity} onChange={event => setQuantity(event.target.value)}/><Button disabled={busy || !cart.ready}>Agregar selección</Button></form>}
    <section className="space-y-3 rounded border bg-white p-4"><h2 className="font-semibold">Mi selección</h2>{cart.storageError && <p role="alert">No se pudo guardar el carrito. Los datos guardados anteriores se conservan.</p>}{cart.lines.map(line => <CartItem key={line.cartLineId} line={line}/>)}{!cart.lines.length && <p>No has seleccionado productos.</p>}<Button disabled={busy || !cart.ready || !items.length} onClick={() => calculate()}>Calcular oferta actual</Button></section>
    {offer && <section className="space-y-4 rounded border bg-white p-4" aria-labelledby="account-offer"><h2 id="account-offer" className="font-semibold">Resumen calculado por APUDIG</h2>{(changed || conflict) && <p role="status">La selección o la oferta cambió. Vuelve a calcular y revisar antes de confirmar.</p>}<ul className="space-y-2">{offer.data.items.map(line => <li key={`${line.productId}:${line.unitId}`}>{line.name}: {line.quantity} {line.unit} · {formatPublicMoney(Number(line.total), offer.data.currency)}</li>)}</ul><p className="font-semibold">Total: {formatPublicMoney(Number(offer.data.total), offer.data.currency)}</p><Button disabled={busy || changed || conflict || offer.data.confirmed} onClick={() => calculate(true)}>{offer.data.confirmed && !changed && !conflict ? 'Resumen validado' : 'Confirmar este resumen'}</Button>
      {offer.data.ordersEnabled && account.profile.capabilities.prepareOrders ? <div className="space-y-3">{privacy && <details><summary>Aviso vigente · {privacy.version}</summary><p className="whitespace-pre-wrap">{privacy.text}</p></details>}<Label htmlFor="request-note">Observación para la empresa</Label><Input id="request-note" maxLength={500} value={note} onChange={event => { setNote(event.target.value); setPrepared(null); }}/><Label className="flex gap-3"><input type="checkbox" checked={shareConfirmed} onChange={event => setShareConfirmed(event.target.checked)}/>Revisé el aviso vigente y deseo preparar este resumen para compartirlo voluntariamente por WhatsApp.</Label><Button disabled={busy || !privacy || !shareConfirmed || !offer.data.confirmed || changed || conflict} onClick={prepare}>Preparar solicitud</Button>{prepared && <p role="status">Referencia: {prepared.reference}. La empresa todavía no ha confirmado su recepción.</p>}{prepared?.whatsappUrl && !changed && !conflict && shareConfirmed && /^https:\/\/wa\.me\/[0-9]{8,15}\?text=/.test(prepared.whatsappUrl) && <a className="inline-block rounded bg-orange-700 px-4 py-2 text-white" href={prepared.whatsappUrl} target="_blank" rel="noopener noreferrer">Abrir WhatsApp para decidir el envío</a>}</div> : <p className="text-sm">Los pedidos y WhatsApp siguen deshabilitados.</p>}
      <p className="text-sm">La confirmación no garantiza precios futuros ni reserva disponibilidad.</p></section>}
  </section>;
}

export default function CommercialCart({ store }) {
  const { profile } = useCommercialAccount();
  if (!profile.accountId) return <p>Actualiza tu sesión para revisar la selección de esta cuenta.</p>;
  const scopedStore = { ...store, cartReviewEnabled: true, cartStorageScope: `${store.id}:${profile.accountId}` };
  return <div className="storefront rounded-lg" style={{ '--sf-orange': store.colors.primary }}><CartProvider key={scopedStore.cartStorageScope} store={scopedStore} products={[]}><CartReview store={scopedStore}/></CartProvider></div>;
}
