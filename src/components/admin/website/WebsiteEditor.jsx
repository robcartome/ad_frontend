'use client';
import LoadingIndicator from '@/components/feedback/LoadingIndicator';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, Eye, FileText, Globe, ImageIcon, LayoutTemplate, Megaphone, Palette, Phone, Save, Search, Smartphone, Monitor, RotateCcw, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createWebsiteDocument, validateWebsite } from '@/lib/website/content.mjs';
import { djangoWebsiteRepository } from './useWebsiteAccess';
import { WebsiteMediaContext } from './WebsiteMediaContext';
import EditorialImageField from './EditorialImageField';
import { apiFetch } from '@/services/api';
import { createWebsiteCatalogRepository } from '@/services/websiteCatalogRepository.mjs';
import { CollectionEditor, Field, SectionsEditor } from './WebsiteFields';
import { AnnouncementsEditor, SpecialProductsEditor } from './ShowcaseEditor';
import { SOCIAL_NETWORKS } from '@/lib/website/contact.mjs';
import { websiteErrorMessage } from '@/lib/website/errors.mjs';
import WebsiteCatalogPanel from './WebsiteCatalogPanel';

const options = [
  ['overview', 'Resumen', Globe], ['identity', 'Identidad visual', Palette],
  ['banners', 'Banners', ImageIcon], ['promotions', 'Campañas', Megaphone],
  ['announcements', 'Avisos (slider)', ImageIcon], ['specials', 'Ofertas especiales', Megaphone],
  ['sections', 'Secciones', LayoutTemplate], ['contact', 'Contacto', Phone], ['seo', 'SEO', Search],
  ['catalog', 'Productos del Website', LayoutTemplate],
];
const stamp = value => value ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Lima' }).format(new Date(value)) : 'Sin guardar';


export default function WebsiteEditor({ company, canEdit, canApply, discovery, capabilities, canReadCatalog }) {
  const initial = useMemo(() => createWebsiteDocument(company.name, []), [company.name]);
  const [editorialProducts, setEditorialProducts] = useState([]);
  const [referencesError, setReferencesError] = useState('');
  const refreshReferences = useCallback(async () => {
    try { setEditorialProducts(await createWebsiteCatalogRepository(apiFetch, discovery.id).publishedReferences()); setReferencesError(''); }
    catch (error) { setReferencesError(websiteErrorMessage(error)); }
  }, [discovery.id]);
  useEffect(() => { if (canEdit || canApply) refreshReferences(); }, [canEdit, canApply, refreshReferences]);
  const scope = useMemo(() => ({ companyId: company.id, websiteId: discovery.id }), [company.id, discovery.id]);
  const [record, setRecord] = useState(null);
  const [document, setDocument] = useState(initial);
  const [tab, setTab] = useState('overview');
  const [catalogOpened, setCatalogOpened] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [mediaItems, setMediaItems] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [externalChange, setExternalChange] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [viewport, setViewport] = useState('mobile');
  const frame = useRef(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const repository = useRef(null);
  const errors = useMemo(() => ({ ...validateWebsite(document, editorialProducts.map(product => product.id)), ...(serverErrors.document === JSON.stringify(document) ? serverErrors.fields : {}) }), [document, serverErrors, editorialProducts]);
  const invalid = Object.keys(errors).length > 0;
  const dirty = Boolean(record && JSON.stringify(document) !== JSON.stringify(record.draft));
  const unapplied = Boolean(record && JSON.stringify(record.draft) !== JSON.stringify(record.published));

  const load = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      repository.current = djangoWebsiteRepository;
      const saved = await repository.current.load(scope, initial);
      setServerErrors({});
      setRecord(saved);
      setDocument(saved.draft);
      setExternalChange(false);
      setReady(true);
    } catch (cause) { setError(websiteErrorMessage(cause)); setServerErrors({}); }
    finally { setBusy(false); }
  }, [scope, initial]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!dirty) return;
    const warn = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);


  const sendPreview = useCallback(() => {
    if (!invalid) frame.current?.contentWindow?.postMessage({ type: 'apudig:website-preview', companyId: company.id, document }, window.location.origin);
  }, [company.id, document, invalid]);
  useEffect(() => {
    sendPreview();
    const handshake = event => {
      if (event.origin === window.location.origin && event.source === frame.current?.contentWindow && event.data?.type === 'apudig:website-preview-ready') sendPreview();
    };
    window.addEventListener('message', handshake);
    return () => window.removeEventListener('message', handshake);
  }, [sendPreview]);

  function updateGroup(group, key, value) {
    setNotice(''); setServerErrors({});
    setDocument(previous => ({ ...previous, [group]: { ...previous[group], [key]: value } }));
  }
  const field = (group, key, label, extra = {}) => <Field label={label} path={`${group}.${key}`} value={document[group][key]} onChange={value => updateGroup(group, key, value)} errors={errors} {...extra}/>;

  async function save(event) {
    event.preventDefault();
    if (!canEdit || invalid || !record) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const saved = await repository.current.saveDraft(scope, document, record.revision, initial);
      setRecord(saved); setDocument(saved.draft); setExternalChange(false);
      setNotice('Borrador guardado en APUDIG. La página pública no ha cambiado.');
    } catch (cause) { setError(websiteErrorMessage(cause)); setServerErrors({ document: JSON.stringify(document), fields: cause.fields || {} }); if (cause.status === 412) setExternalChange(true); }
    finally { setBusy(false); }
  }
  async function apply() {
    if (!canApply || dirty || invalid || !record) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const saved = await repository.current.publish(scope, record.revision, initial);
      setRecord(saved); setExternalChange(false);
      setNotice('Revision publicada. El sitio publico ya puede mostrar esta version.');
    } catch (cause) { setError(websiteErrorMessage(cause)); setServerErrors({ document: JSON.stringify(document), fields: cause.fields || {} }); if (cause.status === 412) setExternalChange(true); }
    finally { setBusy(false); }
  }
  async function confirm() {
    if (confirmAction === 'reload') load();
    else if (record?.published) {
      setBusy(true);
      try {
        let history = await repository.current.revisions(scope);
        let published = history.results.find(item => item.operation === 'PUBLISH');
        for (let offset = 100; !published && offset < history.count; offset += 100) {
          history = await repository.current.revisions(scope, offset);
          published = history.results.find(item => item.operation === 'PUBLISH');
        }
        if (!published) throw new Error('No hay una publicacion restaurable en esta pagina de historial.');
        const restored = await repository.current.restore(scope, published.id, record.revision);
        setRecord(restored); setDocument(restored.draft); setNotice('Revision restaurada como borrador. La publicacion vigente se conserva.');
      } catch (cause) { setError(websiteErrorMessage(cause)); }
      finally { setBusy(false); }
    }
    setConfirmAction(null);
  }

  return <WebsiteMediaContext.Provider value={{ canUpload: capabilities.mediaUpload, upload: (file, kind, alt) => djangoWebsiteRepository.uploadMedia(scope, file, kind, alt) }}><div className="web-editor">
    
    <header className="we-heading">
      <div>
        <span className="we-eyebrow">CANAL DIGITAL / PÁGINA WEB</span>
        <h1>Tu web, a tu manera.</h1>
        <p>Gestiona lo que tus clientes ven, desde un solo lugar.</p>
      </div>
      <Link className="we-button we-secondary" href="/" target="_blank" rel="noopener noreferrer">Ver web publica
        <ArrowUpRight size={16}/>
      </Link>
    </header>
    
    <div className="we-scope">
      <span>
        <Globe size={17}/>
        <strong>{company.name}</strong>
        <span className="we-chip">CMS conectado</span>
      </span>
      <small>{dirty ? 'Cambios sin guardar' : record?.revision ? `Revisión ${record.revision} · Guardado ${stamp(record.updatedAt)} (Lima)` : 'Configuración inicial'}</small>
    </div>
    
    <p className="we-note">Los borradores se guardan por empresa. Solo Publicar actualiza el sitio. Los borradores locales anteriores no se importan ni se eliminan.</p>
    {!canEdit && <p className="we-note">Tienes acceso de lectura. La edición requiere el permiso de gestión de contenido web.</p>}
    {error && <div className="we-error" role="alert">
      <AlertCircle size={19}/>
      <span>{error}</span>
      <button type="button" onClick={() => setConfirmAction('reload')}>Recargar guardado</button>
    </div>}
    {externalChange && <div className="we-error" role="status">Otra pestaña cambió esta web. Tus cambios siguen en pantalla.
      <button type="button" onClick={() => setConfirmAction('reload')}>Recargar guardado</button>
    </div>}
    {notice && <div className="we-success" role="status">
      <CheckCircle2 size={18}/>{notice}
    </div>}
    
    <div className="we-workspace">
      
      <nav className="we-navigation" aria-label="Opciones de administración web">{options.filter(([id]) => id !== 'catalog' || canReadCatalog).map(([id, label, Icon]) => <button type="button" key={id} aria-pressed={tab === id} className={tab === id ? 'is-active' : ''} onClick={() => { setTab(id); if (id === 'catalog') setCatalogOpened(true); }}>
          <Icon size={18}/>{label}{['banners', 'promotions'].includes(id) && <small>{document[id].length}</small>}
        </button>)}
        <div className="we-navigation-foot">
          <span>PLANTILLA ACTIVA</span>
          <strong>E-commerce ferretero</strong>
          <small>Contenido estructurado y reutilizable.</small>
        </div>
      </nav>
      
      <div className="we-editing-area" aria-busy={busy}>
        {busy && ready && <LoadingIndicator overlay label="Procesando contenido…"/>}
        {canReadCatalog && catalogOpened && <div hidden={tab !== 'catalog'}><WebsiteCatalogPanel key={scope.websiteId} websiteId={scope.websiteId} canEdit={canEdit} canPublish={canEdit && canApply} onPublicationChange={refreshReferences}/></div>}
        <div hidden={tab === 'catalog'}>
        {!ready ? <div className="we-empty" role="status">
          {error ? <FileText/> : <LoadingIndicator fullScreen label="Cargando contenido…"/>}
          <h2>{error ? 'Contenido no disponible' : 'Cargando contenido…'}</h2>
          <p>{error ? 'Recarga el contenido o revisa el almacenamiento del navegador.' : 'Preparando el espacio de trabajo de esta empresa.'}</p>
        </div> : <form id="website-form" onSubmit={save} noValidate>
          
          <fieldset disabled={!canEdit || busy} className="we-form-fieldset">
            {['specials', 'promotions'].includes(tab) && <><p className="we-note">Solo se pueden seleccionar productos publicados en el catálogo. Sus precios se consultan al visitar la página.</p>{referencesError && <p role="alert">{referencesError}</p>}<button type="button" className="we-button we-secondary" onClick={refreshReferences}>Actualizar productos disponibles</button></>}
            {tab === 'overview' && <>
              
              <div className="we-section-intro">
                <div>
                  <h2>Todo listo para dar el siguiente paso</h2>
                  <p>Edita, guarda y revisa antes de publicar una revisión.</p>
                </div>
              </div>
              
              <div className="we-stat-grid">{[['Banners visibles', document.banners.filter(item => item.enabled).length, ImageIcon], ['Campañas activadas', document.promotions.filter(item => item.enabled).length, Megaphone], ['Secciones visibles', document.sections.filter(item => item.enabled).length, LayoutTemplate]].map(([label, value, Icon]) => <div className="we-stat" key={label}>
                  <Icon size={22}/>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>)}</div>
              
              <article className="we-checklist">
                <h3>Tu flujo de trabajo</h3>
                <ol>
                  <li>
                    <strong>Prepara tu contenido.</strong> Personaliza banners, campañas y datos de contacto.
                  </li>
                  <li>
                    <strong>Guarda el borrador.</strong> La versión aplicada permanece sin cambios.
                  </li>
                  <li>
                    <strong>Revisa la vista previa.</strong> Comprueba mensajes, enlaces y vigencias.
                  </li>
                  <li>
                    <strong>Publica la revisión.</strong> El sitio muestra únicamente la versión publicada.
                  </li>
                </ol>
              </article>
            
            </>}
            {tab === 'identity' && <>
              <div className="we-section-intro">
                <div>
                  <h2>Identidad de la tienda</h2>
                  <p>El nombre y los colores que darán la bienvenida a tus clientes.</p>
                </div>
              </div>
              <div className="we-fields-grid">{field('identity', 'name', 'Nombre comercial', { maxLength: 100 })}{field('identity', 'shortName', 'Nombre corto del header', { maxLength: 40 })}{field('identity', 'location', 'Zona de atención', { maxLength: 100 })}{field('identity', 'primaryColor', 'Color principal', { placeholder: '#FF8000', hint: 'Color hexadecimal. Referencia de marca: #FF8000.' })}</div><EditorialImageField item={{ imageUrl: document.identity.logoUrl, imageAlt: document.identity.name }} path="identity.logoUrl" label="Logo" errors={errors} onChange={value => updateGroup('identity', 'logoUrl', value)}/>{field('identity', 'announcement', 'Barra informativa', { maxLength: 180 })}
            </>}
            {tab === 'banners' && <div className="we-item"><h2>Reproducción del banner principal</h2><label className="we-toggle"><input type="checkbox" checked={document.heroSlider?.autoplay ?? true} onChange={event => setDocument(previous => ({ ...previous, heroSlider: { intervalMs: 6000, ...previous.heroSlider, autoplay: event.target.checked } }))}/> Pasar banners automáticamente</label><Field label="Segundos por banner (3 a 15)" path="banners.intervalMs" type="number" min={3} max={15} step={1} value={(document.heroSlider?.intervalMs ?? 6000) / 1000} onChange={value => setDocument(previous => ({ ...previous, heroSlider: { autoplay: true, ...previous.heroSlider, intervalMs: value === '' ? 0 : Number(value) * 1000 } }))} errors={errors}/><p className="we-note">Solo rotan los banners visibles. Cada uno mantiene su CTA. El carrusel se pausa al interactuar y respeta la preferencia de movimiento reducido.</p></div>}
            {['banners', 'promotions'].includes(tab) && <CollectionEditor type={tab} items={document[tab]} errors={errors} products={editorialProducts} onChange={items => setDocument(previous => ({ ...previous, [tab]: items }))}/>}
            {tab === 'announcements' && <AnnouncementsEditor value={document.announcements} errors={errors} onChange={announcements => setDocument(previous => ({ ...previous, announcements }))}/>}
            {tab === 'specials' && <SpecialProductsEditor value={document.specials} products={editorialProducts} errors={errors} onChange={specials => setDocument(previous => ({ ...previous, specials }))}/>}
            {tab === 'sections' && <SectionsEditor sections={document.sections} errors={errors} onChange={sections => setDocument(previous => ({ ...previous, sections }))}/>}
            {tab === 'contact' && <>
              <div className="we-section-intro">
                <div>
                  <h2>Contacto y atención</h2>
                  <p>Datos comerciales de esta tienda; no alteran la ficha fiscal del ERP.</p>
                </div>
              </div>
              <div className="we-fields-grid">{field('contact', 'phone', 'Teléfono comercial', { type: 'tel', maxLength: 40 })}{field('contact', 'secondaryPhone', 'Teléfono adicional', { type: 'tel', maxLength: 40 })}{field('contact', 'email', 'Correo comercial', { type: 'email', maxLength: 180 })}{field('contact', 'whatsapp', 'WhatsApp', { inputMode: 'numeric', hint: 'Código de país y número, sin + ni espacios. Permanecerá inactivo en la demo.' })}</div>{field('contact', 'address', 'Dirección', { multiline: true, maxLength: 300 })}{field('contact', 'hours', 'Horario de atención', { maxLength: 180 })}
              <div className="we-section-intro"><div><h2>Redes sociales</h2><p>Agrega los perfiles oficiales de la tienda. Deja vacío lo que no uses; no se crean enlaces ficticios.</p></div></div>
              {SOCIAL_NETWORKS.map(network => <Field key={network.id} label={network.label} path={`contact.socials.${network.id}`} value={document.contact.socials?.[network.id] ?? ''} maxLength={300} placeholder={`https://${network.hosts[0]}/…`} hint={`URL HTTPS de tu perfil de ${network.label}.`} errors={errors} onChange={value => setDocument(previous => ({ ...previous, contact: { ...previous.contact, socials: { ...previous.contact.socials, [network.id]: value } } }))}/>)}
            </>}
            {tab === 'seo' && <>
              <div className="we-section-intro">
                <div>
                  <h2>Presentación en buscadores</h2>
                  <p>Prepara los datos para cuando la tienda esté lista para publicarse.</p>
                </div>
              </div>{field('seo', 'title', 'Título SEO', { maxLength: 70, hint: `${document.seo.title.length}/70 caracteres` })}{field('seo', 'description', 'Descripción SEO', { multiline: true, maxLength: 180, hint: `${document.seo.description.length}/180 caracteres` })}
              <div className="we-search-preview">
                <small>Vista ilustrativa en buscadores</small>
                <h3>{document.seo.title}</h3>
                <p>{document.seo.description}</p>
              </div>
              <p className="we-note">La indexacion se mantiene desactivada durante la integracion. Guardar SEO no publica ni configura dominios.</p>
            </>}
          </fieldset>
          {invalid && <div className="we-validation" role="alert">
            <strong>Revisa los campos antes de guardar:</strong>
            <ul>{Object.entries(errors).map(([path, message]) => <li key={path}>
                <button type="button" onClick={() => setTab(path.startsWith('identity') ? 'identity' : path.startsWith('contact') ? 'contact' : path.startsWith('seo') ? 'seo' : path.split('.')[0])}>{message}</button>
              </li>)}</ul>
          </div>}
        
        </form>}
        
        <div className="we-actions">
          <div>
            <span className={`we-status-dot ${dirty ? 'is-dirty' : ''}`}/>{dirty ? 'Cambios sin guardar' : unapplied ? 'Borrador pendiente de publicación' : record?.publishedAt ? 'Revisión publicada' : 'Borrador'}
          </div>
          <button type="button" className="we-button we-secondary" onClick={() => setConfirmAction('restore')} disabled={!record?.published || !canEdit || busy}>
            <RotateCcw size={15}/> Restaurar publicada
          </button>
          <button form="website-form" type="submit" className="we-button we-primary" disabled={!ready || busy || !canEdit || !dirty || invalid}>
            {busy ? <LoadingIndicator compact label="Guardando borrador…"/> : <Save size={16}/>} {busy ? 'Procesando…' : 'Guardar borrador'}
          </button>
        </div>
        </div>
      
      </div>
      
      <aside className="we-preview-panel">
        <header>
          <div>
            <Eye size={18}/>
            <h2>Vista previa</h2>
          </div>
          <div className="we-devices">
            <button type="button" aria-label="Vista móvil" aria-pressed={viewport === 'mobile'} onClick={() => setViewport('mobile')}>
              <Smartphone size={17}/>
            </button>
            <button type="button" aria-label="Vista amplia" aria-pressed={viewport === 'desktop'} onClick={() => setViewport('desktop')}>
              <Monitor size={17}/>
            </button>
          </div>
        </header>
        <p>Último contenido válido del formulario. Los enlaces están desactivados.</p>
        <div className={`we-preview-canvas ${viewport}`}>
        
          {previewLoading && <LoadingIndicator overlay label="Cargando vista previa…"/>}
          <iframe ref={frame} title={`Vista previa de ${company.name}`} src="/admin/website/preview?embedded=1" onLoad={() => { setPreviewLoading(false); sendPreview(); }}/>
      
        </div>
        <div className="we-publication">
          <h3>Publicación del Website</h3>
          <p>{record?.publishedAt ? `Aplicada ${stamp(record.publishedAt)} (Lima)` : 'Todavía no se aplicó una versión.'}</p>
          <button type="button" className="we-button we-primary" onClick={apply} disabled={!ready || busy || !canApply || dirty || invalid || !unapplied}>Publicar revision
            <CheckCircle2 size={16}/>
          </button>{dirty && <small>Guarda el borrador antes de aplicar.</small>}{!canApply && <small>Necesitas permiso de publicación para aplicar una versión.</small>}
          <Link href="/admin/website/preview?source=published" target="_blank" rel="noopener noreferrer">Revisar última publicación
            <ArrowUpRight size={14}/>
          </Link>
          <Link href="/admin/website/preview" target="_blank" rel="noopener noreferrer">Abrir borrador guardado 
            <ArrowUpRight size={14}/>
          </Link>
        </div>
      </aside>
    </div>
    
    <section className="we-history"><h2>Imagenes del Website</h2>
      {capabilities.mediaUpload && <label className="we-file-picker">Subir imagen a la biblioteca (PNG/JPEG/WebP, máximo 5 MiB)<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={async event => {
        const file = event.target.files?.[0]; event.target.value = '';
        if (!file) return;
        setBusy(true);
        try { await djangoWebsiteRepository.uploadMedia(scope, file); setMediaItems((await djangoWebsiteRepository.media(scope)).results); }
        catch (cause) { setError(websiteErrorMessage(cause)); }
        finally { setBusy(false); }
      }}/></label>}
      <button type="button" className="we-button we-secondary" onClick={async () => { try { const page = await djangoWebsiteRepository.media(scope); setMediaItems(page.results); } catch (cause) { setError(websiteErrorMessage(cause)); } }}>Consultar biblioteca</button>
      {mediaItems.map(item => <p key={item.id}><a href={item.url} target="_blank" rel="noopener noreferrer">{item.altText || item.kind}</a>{capabilities.mediaUpload && <button type="button" onClick={async () => { try { await djangoWebsiteRepository.removeMedia(scope, item.id); setMediaItems(items => items.filter(asset => asset.id !== item.id)); } catch (cause) { setError(websiteErrorMessage(cause)); } }}>Desactivar imagen</button>}</p>)}
    </section>
    <section className="we-history">
      <h2>Historial de revisiones</h2>
      <p>Actividad registrada en APUDIG.</p>{record?.events.length ? <ol>{record.events.slice(0, 5).map(event => <li key={event.revision}>
          <span>{({ save: 'Borrador guardado', publish: 'Revision publicada', restore: 'Borrador restaurado' })[event.action] || event.action}</span>
          <small>Revisión {event.revision} · {stamp(event.at)} (Lima)</small>
        </li>)}</ol> : <p>No hay cambios guardados todavía.</p>}
    </section>
    
    <Dialog open={Boolean(confirmAction)} onOpenChange={open => { if (!open) setConfirmAction(null); }}>
      <DialogContent className="we-animated-modal">
        <DialogHeader>
          <DialogTitle>{confirmAction === 'reload' ? '¿Recargar el contenido guardado?' : '¿Recuperar la versión aplicada?'}</DialogTitle>
          <DialogDescription>Se reemplazarán los cambios que tienes en el formulario. Esta acción no modifica la web pública.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button className="we-button we-secondary" onClick={() => setConfirmAction(null)}>Cancelar</button>
          <button className="we-button we-primary" onClick={confirm}>Continuar</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div></WebsiteMediaContext.Provider>;
}
