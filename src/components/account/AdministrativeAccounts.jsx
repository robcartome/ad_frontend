'use client';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/services/api';
import { createCommercialAccountsRepository } from '@/services/commercialAccountsRepository.mjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingIndicator from '@/components/feedback/LoadingIndicator';
import { useAuth } from '@/lib/AuthContext';
import { getAdministrationAccess } from '@/lib/admin/access.mjs';
import RegistrationAdministration from './RegistrationAdministration';

function AccountsPanel() {
  const repository = useMemo(() => createCommercialAccountsRepository(apiFetch), []);
  const [page, setPage] = useState(null);
  const [websiteId, setWebsiteId] = useState(null);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setBusy(true); setError('');
    (async () => {
      const website = await repository.current();
      const result = await repository.list(website.id, { search: query, offset, signal: controller.signal });
      if (active) { setWebsiteId(website.id); setPage(result); }
    })().catch(failure => { if (active && !controller.signal.aborted) { setError(failure.message); if (failure.status === 401 || failure.status === 403) setPage(null); } }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; controller.abort(); };
  }, [repository, query, offset, revision]);
  async function approve(account) {
    setBusy(true); setError('');
    try {
      const updated = await repository.approve(websiteId, account, !account.wholesaleApproved);
      setPage(previous => ({ ...previous, results: previous.results.map(row => row.id === updated.id ? updated : row) }));
    } catch (failure) { setError(failure.status === 412 || failure.status === 428 ? 'La cuenta cambió. Recarga la lista antes de confirmar otra operación.' : failure.message); }
    finally { setBusy(false); }
  }
  return <section className="mx-auto max-w-6xl space-y-5 px-5 py-6">
    <h1 className="text-2xl font-semibold">Cuentas comerciales</h1>
    <p className="text-sm text-gray-600">Consulta las cuentas vinculadas a la empresa seleccionada. La aprobación mayorista es independiente de la verificación del correo.</p>
    <form className="flex flex-wrap gap-3" onSubmit={event => { event.preventDefault(); setOffset(0); setQuery(search); }}><Input aria-label="Buscar cuentas por nombre o correo" className="max-w-md" maxLength={120} value={search} onChange={event => setSearch(event.target.value)}/><Button disabled={busy}>Buscar</Button><Button type="button" variant="outline" disabled={busy} onClick={() => setRevision(value => value + 1)}>Recargar</Button></form>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {busy && <LoadingIndicator label="Consultando cuentas…"/>}
    {page && <><div className="overflow-x-auto rounded-lg border bg-white"><table className="w-full min-w-[650px] text-left text-sm"><caption className="sr-only">Cuentas comerciales de la empresa seleccionada</caption><thead className="border-b bg-gray-50"><tr>{['Cuenta', 'Cliente vinculado', 'Verificación', 'Lista comercial', 'Mayorista'].map(label => <th className="p-4" key={label} scope="col">{label}</th>)}</tr></thead><tbody>{page.results.map(account => <tr key={account.id} className="border-b"><td className="max-w-64 break-words p-4"><strong>{account.user.name}</strong><p>{account.user.email}</p><p className="text-xs text-gray-500">{account.status === 'ACTIVE' ? 'Activa' : account.status === 'SUSPENDED' ? 'Suspendida' : 'Revocada'}</p></td><td className="p-4">{account.customer.name}</td><td className="p-4">{account.contactVerified ? 'Correo verificado' : 'Sin verificar'}</td><td className="p-4">{account.priceList ? `${account.priceList.name}${account.priceList.active ? '' : ' (inactiva)'}` : 'Sin lista asignada'}</td><td className="p-4"><p className="mb-2">{account.wholesaleApproved ? 'Aprobado' : 'Sin aprobación'}</p><Button size="sm" variant="outline" disabled={busy || (!account.wholesaleApproved && (!account.contactVerified || !account.priceList?.active || account.status !== 'ACTIVE'))} onClick={() => approve(account)}>{account.wholesaleApproved ? 'Revocar acceso mayorista' : 'Aprobar acceso mayorista'}</Button></td></tr>)}</tbody></table></div>
      {!page.count && <p>No hay cuentas comerciales vinculadas.</p>}
      <div className="flex flex-wrap items-center gap-3"><Button variant="outline" disabled={busy || !offset} onClick={() => setOffset(value => Math.max(0, value - 20))}>Anterior</Button><span className="text-sm">{page.count} cuentas</span><Button variant="outline" disabled={busy || offset + page.results.length >= page.count} onClick={() => setOffset(value => value + 20)}>Siguiente</Button></div></>}
    {websiteId && <RegistrationAdministration key={websiteId} websiteId={websiteId}/>}
  </section>;
}

export default function AdministrativeAccounts() {
  const { user, selectedCompany } = useAuth();
  if (!getAdministrationAccess(user, selectedCompany).companyAdmin) return null;
  return <AccountsPanel key={`${user.id}:${selectedCompany.company_id}`}/>;
}
