'use client';
import { useEffect, useState } from 'react';
import { useCommercialAccount } from './CommercialProvider';
import { Button } from '@/components/ui/button';
import LoadingIndicator from '@/components/feedback/LoadingIndicator';
import { formatPublicMoney } from '@/lib/commerce/catalog.mjs';

const statusLabel = { PREPARED: 'Preparada, pendiente de envío y confirmación', CANCELLED: 'Cancelada', EXPIRED: 'Caducada' };
export default function OrderRequests() {
  const { requests, cancelRequest, requestDetail } = useCommercialAccount();
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(null);
  const [offset, setOffset] = useState(0);
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setBusy(true); setError('');
    requests(offset).then(value => { if (active) setPage(value); }).catch(failure => { if (active) { setError(failure.message); setPage(null); } }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [requests, offset, revision]);
  async function cancel(row) {
    setBusy(true); setError('');
    try { await cancelRequest(row.id); setSelected(null); setRevision(value => value + 1); }
    catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  return <section className="space-y-5"><h1 className="text-2xl font-semibold">Mis solicitudes</h1>
    <p>{page?.ordersEnabled ? 'Consulta tus solicitudes. Abre WhatsApp solo cuando decidas compartir un resumen vigente.' : 'La empresa no tiene habilitada la preparación de nuevas solicitudes.'}</p>
    {selected && <div role="status" className="space-y-3 rounded border bg-white p-4"><p>{selected.reference} · {statusLabel[selected.status]}</p>{selected.whatsappUrl && /^https:\/\/wa\.me\/[0-9]{8,15}\?text=/.test(selected.whatsappUrl) ? <a className="inline-block underline" href={selected.whatsappUrl} target="_blank" rel="noopener noreferrer">Abrir WhatsApp para decidir el envío</a> : <p>Este resumen no tiene un enlace vigente. Revisa tu carrito y calcula una nueva oferta.</p>}</div>}
    {busy && <LoadingIndicator label="Consultando solicitudes…"/>}{error && <p role="alert" className="text-red-700">{error}</p>}
    <Button variant="outline" disabled={busy} onClick={() => setRevision(value => value + 1)}>Actualizar historial</Button>
    {page && <>{!page.count && <p>No tienes solicitudes registradas.</p>}{page.results.map(row => <article key={row.id} className="space-y-3 rounded-lg border bg-white p-5"><h2 className="break-all font-semibold">{row.reference}</h2><p>{statusLabel[row.status] || 'Consultar estado con la empresa'}</p><p className="text-sm text-gray-600">Preparada: {new Date(row.createdAt).toLocaleString('es-PE')}</p><ul>{row.offer.items.map(line => <li key={`${line.productId}:${line.unitId}`}>{line.name} · {line.quantity} {line.unit}</li>)}</ul><p>Total del resumen: {formatPublicMoney(Number(row.offer.total), row.offer.currency)}</p>{row.note && <p className="whitespace-pre-wrap">{row.note}</p>}{row.status === 'PREPARED' && <Button variant="outline" disabled={busy} onClick={async () => { setBusy(true); setError(''); try { setSelected(await requestDetail(row.id)); } catch (failure) { setSelected(null); setError(failure.message); } finally { setBusy(false); } }}>Consultar resumen vigente</Button>}{row.status === 'PREPARED' && <Button variant="outline" disabled={busy} onClick={() => cancel(row)}>Cancelar solicitud</Button>}<p className="text-xs text-gray-600">Una solicitud preparada no confirma recepción, venta ni reserva de stock.</p></article>)}<div className="flex gap-3"><Button variant="outline" disabled={busy || !offset} onClick={() => setOffset(value => Math.max(0, value - 20))}>Anterior</Button><Button variant="outline" disabled={busy || offset + page.results.length >= page.count} onClick={() => setOffset(value => value + 20)}>Siguiente</Button></div></>}
  </section>;
}
