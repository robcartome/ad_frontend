'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/services/api';
import { createWebsiteCatalogRepository, emptyPublication, publicationPayload, catalogFailureState, canEditPublication } from '@/services/websiteCatalogRepository.mjs';
import { Field } from './WebsiteFields';
import LoadingIndicator from '@/components/feedback/LoadingIndicator';
import { websiteErrorMessage } from '@/lib/website/errors.mjs';

export default function WebsiteCatalogPanel({ websiteId, canEdit, canPublish, onPublicationChange }) {
  const repository = useMemo(() => createWebsiteCatalogRepository(apiFetch, websiteId), [websiteId]);
  const [state, setState] = useState({ settings: null, page: null, etag: null, draft: emptyPublication(), original: null, policy: null, dirty: false, policyDirty: false, conflict: false, error: null });
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState({ search: '', offset: 0 });
  const [options, setOptions] = useState(null);
  const [optionSearch, setOptionSearch] = useState('');
  const [notice, setNotice] = useState('');
  const dirty = state.dirty || state.policyDirty;
  const fail = useCallback(error => setState(previous => catalogFailureState(previous, error)), []);
  const load = useCallback(async (active = () => true) => {
    setBusy(true);
    try {
      const data = await repository.load(query);
      if (active()) setState({ ...data, draft: emptyPublication(), original: null, policy: data.settings.canManagePolicy ? { defaultPriceListId: data.settings.defaultPriceListId, warehouseIds: data.settings.warehouseIds, productsPerPage: data.settings.productsPerPage, showOutOfStock: data.settings.showOutOfStock } : null, dirty: false, policyDirty: false, conflict: false, error: null });
    } catch (error) { if (active()) fail(error); }
    finally { if (active()) setBusy(false); }
  }, [repository, query, fail]);
  useEffect(() => { let active = true; load(() => active); return () => { active = false; }; }, [load]);
  useEffect(() => {
    if (!dirty) return;
    const warn = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const discard = () => !dirty || window.confirm('¿Descartar los cambios comerciales de este formulario?');
  async function findOptions(offset = 0) {
    setBusy(true);
    try { setOptions((await repository.options({ search: optionSearch, offset })).data); }
    catch (error) { fail(error); }
    finally { setBusy(false); }
  }
  function select(row) {
    if (state.dirty && !window.confirm('¿Descartar los cambios del producto seleccionado?')) return;
    setState(previous => ({ ...previous, draft: { ...emptyPublication(), ...row }, original: row?.id ? row : null, dirty: Boolean(row?.productId && !row.id) }));
  }
  function update(key, value) { setState(previous => ({ ...previous, draft: { ...previous.draft, [key]: value }, dirty: true })); setNotice(''); }
  async function write(kind) {
    if (busy || state.conflict) return;
    setBusy(true); setNotice('');
    try {
      const { draft, settings, etag } = state;
      let response;
      if (kind === 'policy') response = await repository.saveSettings(state.policy, etag);
      else if (kind === 'remove') response = await repository.remove(draft.id, etag);
      else {
        const body = publicationPayload(draft, settings.canManagePolicy);
        response = draft.id ? await repository.update(draft.id, body, etag) : await repository.create(body, etag);
      }
      // A successful write is authoritative for its own form. The other form is retained.
      setState(previous => {
        const next = { ...previous, etag: response.etag, error: null };
        if (kind === 'policy') return { ...next, settings: response.data, policyDirty: false };
        const rows = previous.page.results.filter(row => row.id !== draft.id);
        if (kind !== 'remove') rows.unshift(response.data);
        return { ...next, page: { ...previous.page, results: rows.slice(0, previous.page.limit), count: previous.page.count + (!draft.id ? 1 : kind === 'remove' ? -1 : 0) }, draft: kind === 'remove' ? emptyPublication() : response.data, original: kind === 'remove' ? null : response.data, dirty: false };
      });
      setNotice('Cambios comerciales guardados. Los pedidos continúan deshabilitados.');
      if (kind !== 'policy') onPublicationChange?.();
    } catch (error) { fail(error); }
    finally { setBusy(false); }
  }
  const editable = canEditPublication(state.original || state.draft, canEdit, canPublish);
  const disabled = busy || state.conflict;
  const field = (key, label, props = {}) => <Field label={label} path={`catalog.${key}`} value={state.draft[key]} onChange={value => update(key, props.type === 'number' ? (value === '' ? '' : Number(value)) : value)} errors={Object.fromEntries(Object.entries(state.error?.fields || {}).map(([key, value]) => [`catalog.${key}`, String(value)]))} {...props}/>;
  return <section className="we-catalog" aria-busy={busy}>
    <div className="we-section-intro"><div><h2>Catálogo del Website</h2><p>Publica productos existentes de APUDIG. Los precios y la disponibilidad se consultan al visitar la tienda.</p></div></div>
    <p className="we-note">Consultar productos está disponible. Carrito y pedidos aún no están habilitados. Estos cambios son independientes del borrador de la página.</p>
    {busy && <LoadingIndicator compact label="Consultando catálogo…"/>}
    {state.error && <div role="alert" className="we-validation"><p>{state.conflict ? 'El catálogo cambió o falta una revisión válida. Tus campos se conservaron. Recarga para revisar la versión actual antes de guardar.' : websiteErrorMessage(state.error)}</p>{Object.entries(state.error.fields || {}).map(([key, value]) => <p key={key}>{key}: {String(value)}</p>)}</div>}
    {notice && <p role="status">{notice}</p>}
    <button type="button" className="we-button we-secondary" disabled={busy} onClick={() => { if (discard()) load(); }}>Recargar catálogo{dirty ? ' y descartar cambios' : ''}</button>
    {state.settings && <>
      <form onSubmit={event => { event.preventDefault(); if (discard()) setQuery({ search, offset: 0 }); }} className="we-item">
        <Field label="Buscar vínculos publicados o en preparación" path="catalog.search" value={search} onChange={setSearch} maxLength={120}/>
        <button className="we-button we-secondary" disabled={disabled}>Buscar</button>
      </form>
      <ul aria-label="Productos vinculados">{state.page.results.map(row => <li key={row.id}><button type="button" className="we-button we-secondary" disabled={busy} onClick={() => select(row)}>{row.commercialTitle || row.slug} · {row.isPublished ? 'Publicado' : 'Sin publicar'}{row.isFeatured ? ' · Destacado' : ''}</button></li>)}</ul>
      {!state.page.count && <p>No hay productos vinculados.</p>}
      <nav aria-label="Páginas de productos vinculados"><span>{state.page.count} vínculos</span>{[-20, 20].map(delta => <button type="button" key={delta} className="we-button we-secondary" disabled={disabled || (delta < 0 ? !query.offset : query.offset + 20 >= state.page.count)} onClick={() => { if (discard()) setQuery({ ...query, offset: query.offset + delta }); }}>{delta < 0 ? 'Anterior' : 'Siguiente'}</button>)}</nav>
      {canEdit && <form className="we-item" onSubmit={event => { event.preventDefault(); findOptions(); }}>
        <h3>Vincular un producto de APUDIG</h3><Field label="Buscar por nombre o SKU" path="catalog.options" value={optionSearch} onChange={setOptionSearch} maxLength={120}/><button className="we-button we-secondary" disabled={disabled}>Buscar productos</button>
        {options && <><ul>{options.results.map(row => <li key={row.productId}><button type="button" className="we-button we-secondary" disabled={disabled} onClick={() => select({ ...emptyPublication(), productId: row.productId })}>{row.name} · {row.sku} · {row.unit}</button></li>)}</ul><span>{options.count} resultados</span>{[-20, 20].map(delta => <button type="button" key={delta} disabled={disabled || (delta < 0 ? !options.offset : options.offset + 20 >= options.count)} onClick={() => findOptions(options.offset + delta)}>{delta < 0 ? 'Anterior' : 'Siguiente'}</button>)}</>}
      </form>}
      {state.draft.productId && <form className="we-item" onSubmit={event => { event.preventDefault(); write('product'); }}>
        <h3>{state.draft.id ? 'Editar publicación comercial' : 'Nuevo vínculo'}</h3><p>Producto: {state.draft.productId}</p>
        {!editable && <p>Necesitas permiso de edición y publicación para modificar un producto publicado.</p>}
        <fieldset disabled={disabled || !editable} className="we-form-fieldset">
          {field('commercialTitle', 'Título comercial', { maxLength: 180 })}{field('commercialDescription', 'Descripción comercial', { multiline: true, maxLength: 1000 })}{field('seoTitle', 'Título SEO', { maxLength: 70 })}{field('seoDescription', 'Descripción SEO', { multiline: true, maxLength: 170 })}{field('position', 'Orden', { type: 'number', min: 0, max: 2147483647, required: true })}
          <label className="we-toggle"><input type="checkbox" checked={state.draft.isFeatured} onChange={event => update('isFeatured', event.target.checked)}/> Destacado</label>
          <label className="we-toggle"><input type="checkbox" checked={state.draft.isPublished} disabled={!canPublish} onChange={event => update('isPublished', event.target.checked)}/> Publicado en el catálogo</label>
          {state.settings.canManagePolicy && <label className="we-field">Lista autorizada específica<select value={state.draft.priceListId || ''} onChange={event => update('priceListId', event.target.value || null)}><option value="">Usar política predeterminada del Website</option>{state.draft.priceListId && !state.settings.priceListOptions.some(row => row.id === state.draft.priceListId) && <option value={state.draft.priceListId}>Selección no disponible (sin precio)</option>}{state.settings.priceListOptions.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>}
          <button className="we-button we-primary" disabled={!state.dirty && Boolean(state.draft.id)}>Guardar producto</button>
          {state.draft.id && canPublish && <button type="button" className="we-button we-secondary" onClick={() => { if (window.confirm('¿Retirar este vínculo del Website? El producto de APUDIG se conserva.')) write('remove'); }}>Eliminar vínculo</button>}
        </fieldset>
      </form>}
      {state.settings.canManagePolicy ? <form className="we-item" onSubmit={event => { event.preventDefault(); write('policy'); }}><h3>Política comercial autorizada</h3><p>Moneda: {state.settings.currency}. Selecciona expresamente las listas y los almacenes que se podrán consultar.</p><fieldset className="we-form-fieldset" disabled={disabled}>
        <label className="we-field">Lista pública predeterminada<select value={state.policy.defaultPriceListId || ''} onChange={event => setState(previous => ({ ...previous, policyDirty: true, policy: { ...previous.policy, defaultPriceListId: event.target.value || null } }))}><option value="">Sin precio público</option>{state.policy.defaultPriceListId && !state.settings.priceListOptions.some(row => row.id === state.policy.defaultPriceListId) && <option value={state.policy.defaultPriceListId}>Selección no disponible (sin precio)</option>}{state.settings.priceListOptions.map(row => <option key={row.id} value={row.id}>{row.name} · {row.pricesIncludeTax ? 'Impuestos incluidos' : 'Impuestos según APUDIG'}</option>)}</select></label>
        <fieldset><legend>Almacenes autorizados</legend>{state.settings.warehouseOptions.map(row => <label className="we-toggle" key={row.id}><input type="checkbox" checked={state.policy.warehouseIds.includes(row.id)} onChange={event => setState(previous => ({ ...previous, policyDirty: true, policy: { ...previous.policy, warehouseIds: event.target.checked ? [...previous.policy.warehouseIds, row.id] : previous.policy.warehouseIds.filter(id => id !== row.id) } }))}/>{row.name}</label>)}{state.policy.warehouseIds.some(id => !state.settings.warehouseOptions.some(row => row.id === id)) && <p>Hay almacenes seleccionados que ya no están disponibles; recarga y revisa la política antes de guardar.</p>}</fieldset>
        <Field label="Productos por página predeterminada" path="catalog.productsPerPage" type="number" required min={1} max={60} value={state.policy.productsPerPage} onChange={value => setState(previous => ({ ...previous, policyDirty: true, policy: { ...previous.policy, productsPerPage: value === '' ? '' : Number(value) } }))}/>
        {state.policy.warehouseIds.filter(id => !state.settings.warehouseOptions.some(row => row.id === id)).map(id => <p key={id}>Almacén no disponible: {id} <button type="button" onClick={() => setState(previous => ({ ...previous, policyDirty: true, policy: { ...previous.policy, warehouseIds: previous.policy.warehouseIds.filter(value => value !== id) } }))}>Retirar de la política</button></p>)}
        <label className="we-toggle"><input type="checkbox" checked={state.policy.showOutOfStock} onChange={event => setState(previous => ({ ...previous, policyDirty: true, policy: { ...previous.policy, showOutOfStock: event.target.checked } }))}/> Mostrar productos sin disponibilidad</label><button className="we-button we-primary" disabled={!state.policyDirty}>Guardar política</button>
      </fieldset></form> : <p className="we-note">Las listas de precios y los almacenes son autorizados por la administración de la empresa.</p>}
    </>}
  </section>;
}
