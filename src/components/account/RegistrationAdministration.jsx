'use client';
import { useState } from 'react';
import { apiFetch } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function RegistrationAdministration({ websiteId }) {
  const base = `/websites/${encodeURIComponent(websiteId)}`;
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [etag, setEtag] = useState('');
  const [version, setVersion] = useState('');
  const [text, setText] = useState('');
  const [days, setDays] = useState('');
  const [mode, setMode] = useState('NEW_OR_REVIEW');
  const [pending, setPending] = useState([]);
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selection, setSelection] = useState({});
  const [registrationEnabled, setRegistrationEnabled] = useState(false);
  async function load() {
    setBusy(true); setError('');
    try {
      const [policy, reviews] = await Promise.all([apiFetch(base + '/registration-policy/'), apiFetch(base + '/registrations/?limit=100')]);
      setEtag(policy.etag); setPending(reviews.results);
      setRegistrationEnabled(policy.publicRegistrationEnabled === true);
      setVersion(''); setText(policy.notice?.text || ''); setDays(policy.notice?.pendingRetentionDays || ''); setMode(policy.notice?.linkingMode || 'NEW_OR_REVIEW');
      setLoaded(true);
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      await apiFetch(base + '/registration-policy/', { method: 'POST', headers: { 'If-Match': etag }, body: JSON.stringify({ version, text, pendingRetentionDays: Number(days), linkingMode: mode }) });
      const current = await apiFetch(base + '/registration-policy/');
      setEtag(current.etag); setVersion('');
      setRegistrationEnabled(current.publicRegistrationEnabled === true);
      setMessage('Aviso guardado. La disponibilidad del registro depende del servicio de verificación y su configuración.');
    } catch (failure) { setError(failure.status === 412 || failure.status === 428 ? 'El aviso cambió. Conservamos tu formulario; recarga explícitamente antes de guardar otra versión.' : failure.message); }
    finally { setBusy(false); }
  }
  async function searchCustomers(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { setCustomers((await apiFetch(base + `/registration-customer-options/?limit=100&search=${encodeURIComponent(search)}`)).results); }
    catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  async function review(row) {
    setBusy(true); setError('');
    try {
      await apiFetch(base + `/registrations/${row.id}/review/`, { method: 'POST', body: JSON.stringify({ customerId: selection[row.id] }) });
      setPending(previous => previous.filter(item => item.id !== row.id));
      setMessage('Vínculo registrado. La aprobación mayorista continúa siendo independiente.');
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  return <details className="space-y-5 rounded-lg border bg-white p-5" onToggle={event => { if (event.currentTarget.open && !loaded && !busy) load(); }}>
    <summary className="cursor-pointer font-semibold">Registro, privacidad y vínculos de clientes</summary>
    <p className="my-4 text-sm text-gray-600">{registrationEnabled ? 'El servicio de registro está habilitado.' : 'El registro público permanece deshabilitado.'} Introduce únicamente un aviso y un plazo aprobados por la empresa; no se completan automáticamente.</p>
    {error && <p className="my-3 text-red-700" role="alert">{error}</p>}{message && <p className="my-3" role="status">{message}</p>}
    <Button type="button" variant="outline" disabled={busy} onClick={() => { if (!loaded || window.confirm('¿Recargar y reemplazar los campos del aviso?')) load(); }}>Recargar configuración</Button>
    {loaded && <><form onSubmit={save} className="my-5 grid gap-4">
      <div><Label htmlFor="notice-version">Nueva versión del aviso</Label><Input id="notice-version" required maxLength={40} value={version} onChange={event => setVersion(event.target.value)}/></div>
      <div><Label htmlFor="notice-text">Texto aprobado</Label><Textarea id="notice-text" required maxLength={15000} rows={7} value={text} onChange={event => setText(event.target.value)}/></div>
      <div><Label htmlFor="notice-retention">Conservación de solicitudes pendientes (días)</Label><Input id="notice-retention" type="number" min={1} max={36500} required value={days} onChange={event => setDays(event.target.value)}/></div>
      <div><Label htmlFor="notice-link-mode">Resolución del cliente</Label><select id="notice-link-mode" className="mt-2 block w-full rounded border p-2" value={mode} onChange={event => setMode(event.target.value)}><option value="NEW_OR_REVIEW">Crear cliente mínimo sin coincidencias; revisar coincidencias</option><option value="REVIEW_ALL">Revisar todos los vínculos</option></select></div>
      <Button disabled={busy}>Guardar nueva versión</Button>
    </form><hr/>
    <h2 className="mt-5 font-semibold">Vínculos pendientes de revisión</h2>
    <p className="text-sm text-gray-600">Verifica la representación del cliente antes de vincularlo. Coincidir en correo o nombre no demuestra titularidad.</p>
    {!pending.length ? <p>No hay vínculos pendientes en esta consulta.</p> : <><form className="my-4 flex flex-wrap gap-3" onSubmit={searchCustomers}><Input className="max-w-md" aria-label="Buscar cliente existente por nombre o documento" value={search} maxLength={120} onChange={event => setSearch(event.target.value)}/><Button disabled={busy}>Buscar clientes existentes</Button></form>
      {pending.map(row => <article className="my-4 space-y-3 rounded border p-4" key={row.id}><strong>{row.name}</strong><p className="break-all">{row.email}</p><Label htmlFor={`customer-${row.id}`}>Ficha del cliente verificada por el administrador</Label><select id={`customer-${row.id}`} className="block w-full rounded border p-2" value={selection[row.id] || ''} onChange={event => setSelection(previous => ({ ...previous, [row.id]: event.target.value }))}><option value="">Seleccionar cliente existente</option>{customers.map(customer => <option key={customer.id} value={customer.id}>{customer.name}{customer.documentNumber ? ` · ${customer.documentNumber}` : ''}</option>)}</select><Button variant="outline" disabled={busy || !selection[row.id]} onClick={() => review(row)}>Vincular cliente</Button></article>)}
      <p className="text-xs text-gray-500">Se muestran hasta 100 solicitudes y 100 coincidencias de clientes por consulta. Refina la búsqueda si es necesario.</p>
    </>}
    </>}
  </details>;
}
