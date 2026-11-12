'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, Eye, FileText, Globe, ImageIcon, LayoutTemplate, Megaphone, Palette, Phone, Save, Search, Smartphone, Monitor, RotateCcw, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createWebsiteDocument, validateWebsite } from '@/lib/website/content.mjs';
import { createLocalWebsiteRepository, websiteKey, localWebsiteScope } from '@/services/websiteRepository.mjs';
import { demoProducts } from '@/data/demo/storefront';
import { CollectionEditor, Field, SectionsEditor } from './WebsiteFields';

const options = [
  ['overview', 'Resumen', Globe], ['identity', 'Identidad visual', Palette],
  ['banners', 'Banners', ImageIcon], ['promotions', 'Campañas', Megaphone],
  ['sections', 'Secciones', LayoutTemplate], ['contact', 'Contacto', Phone], ['seo', 'SEO', Search],
];
const stamp = value => value ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Lima' }).format(new Date(value)) : 'Sin guardar';
const copy = value => JSON.parse(JSON.stringify(value));

export default function WebsiteEditor({ company, canEdit, canApply }) {
  const initial = useMemo(() => createWebsiteDocument(company.name), [company.name]);
  const scope = useMemo(() => localWebsiteScope(company.id), [company.id]);
  const [record, setRecord] = useState(null);
  const [document, setDocument] = useState(initial);
  const [tab, setTab] = useState('overview');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [externalChange, setExternalChange] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [viewport, setViewport] = useState('mobile');
  const frame = useRef(null);
  const repository = useRef(null);
  const errors = useMemo(() => validateWebsite(document, demoProducts.map(product => product.id)), [document]);
  const invalid = Object.keys(errors).length > 0;
  const dirty = Boolean(record && JSON.stringify(document) !== JSON.stringify(record.draft));
  const unapplied = Boolean(record && JSON.stringify(record.draft) !== JSON.stringify(record.published));

  const load = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      repository.current = createLocalWebsiteRepository(localStorage, demoProducts.map(product => product.id));
      const saved = await repository.current.load(scope, initial);
      setRecord(saved);
      setDocument(saved.draft);
      setExternalChange(false);
      setReady(true);
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  }, [scope, initial]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!dirty) return;
    const warn = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  useEffect(() => {
    const changed = event => { if (event.key === websiteKey(scope) || event.key === null) setExternalChange(true); };
    window.addEventListener('storage', changed);
    return () => window.removeEventListener('storage', changed);
  }, [scope]);

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
    setNotice('');
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
      setNotice('Borrador guardado en este navegador. La web pública no ha cambiado.');
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  }
  async function apply() {
    if (!canApply || dirty || invalid || !record) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const saved = await repository.current.publish(scope, record.revision, initial);
      setRecord(saved); setExternalChange(false);
      setNotice('Versión aplicada a la demo local. Ya puedes abrir su vista previa. No se publicó en Internet.');
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  }
  function confirm() {
    if (confirmAction === 'reload') load();
    else if (record?.published) { setDocument(copy(record.published)); setNotice('Versión aplicada recuperada en el formulario. Guarda para reemplazar el borrador.'); }
    setConfirmAction(null);
  }

  return <div className="web-editor">
    
    <header className="we-heading">
      <div>
        <span className="we-eyebrow">CANAL DIGITAL / PÁGINA WEB</span>
        <h1>Tu web, a tu manera.</h1>
        <p>Gestiona lo que tus clientes ven, desde un solo lugar.</p>
      </div>
      <Link className="we-button we-secondary" href="/" target="_blank" rel="noopener noreferrer">Ver web de referencia 
        <ArrowUpRight size={16}/>
      </Link>
    </header>
    
    <div className="we-scope">
      <span>
        <Globe size={17}/>
        <strong>{company.name}</strong>
        <span className="we-chip">Demo local</span>
      </span>
      <small>{dirty ? 'Cambios sin guardar' : record?.revision ? `Revisión ${record.revision} · Guardado ${stamp(record.updatedAt)} (Lima)` : 'Configuración inicial'}</small>
    </div>
    
    <p className="we-note">Los cambios se guardan solo en este navegador y por empresa. La vista previa refleja tu contenido; la web pública y otros equipos recibirán los cambios cuando se integre Django.</p>
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
      
      <nav className="we-navigation" aria-label="Opciones de administración web">{options.map(([id, label, Icon]) => <button type="button" key={id} aria-pressed={tab === id} className={tab === id ? 'is-active' : ''} onClick={() => setTab(id)}>
          <Icon size={18}/>{label}{['banners', 'promotions'].includes(id) && <small>{document[id].length}</small>}
        </button>)}
        <div className="we-navigation-foot">
          <span>PLANTILLA ACTIVA</span>
          <strong>E-commerce ferretero</strong>
          <small>Contenido estructurado y reutilizable.</small>
        </div>
      </nav>
      
      <div className="we-editing-area">
        {!ready ? <div className="we-empty" role="status">
          <FileText/>
          <h2>{error ? 'Contenido no disponible' : 'Cargando contenido…'}</h2>
          <p>{error ? 'Recarga el contenido o revisa el almacenamiento del navegador.' : 'Preparando el espacio de trabajo de esta empresa.'}</p>
        </div> : <form id="website-form" onSubmit={save} noValidate>
          
          <fieldset disabled={!canEdit || busy} className="we-form-fieldset">
            {tab === 'overview' && <>
              
              <div className="we-section-intro">
                <div>
                  <h2>Todo listo para dar el siguiente paso</h2>
                  <p>Edita, guarda y revisa antes de aplicar una versión a la demo.</p>
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
                    <strong>Aplica a la demo local.</strong> La publicación real se habilitará con Django.
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
              <div className="we-fields-grid">{field('identity', 'name', 'Nombre comercial', { maxLength: 100 })}{field('identity', 'shortName', 'Nombre corto del header', { maxLength: 40 })}{field('identity', 'location', 'Zona de atención', { maxLength: 100 })}{field('identity', 'primaryColor', 'Color principal', { placeholder: '#FF8000', hint: 'Color hexadecimal. Referencia de marca: #FF8000.' })}</div>{field('identity', 'logoUrl', 'Logo (URL)', { hint: 'Ruta local o URL HTTPS. Se mantiene el nombre como alternativa accesible.' })}{field('identity', 'announcement', 'Barra informativa', { maxLength: 180 })}
            </>}
            {['banners', 'promotions'].includes(tab) && <CollectionEditor type={tab} items={document[tab]} errors={errors} products={demoProducts} onChange={items => setDocument(previous => ({ ...previous, [tab]: items }))}/>}
            {tab === 'sections' && <SectionsEditor sections={document.sections} errors={errors} onChange={sections => setDocument(previous => ({ ...previous, sections }))}/>}
            {tab === 'contact' && <>
              <div className="we-section-intro">
                <div>
                  <h2>Contacto y atención</h2>
                  <p>Datos comerciales de esta tienda; no alteran la ficha fiscal del ERP.</p>
                </div>
              </div>
              <div className="we-fields-grid">{field('contact', 'phone', 'Teléfono comercial', { maxLength: 40 })}{field('contact', 'whatsapp', 'WhatsApp', { inputMode: 'numeric', hint: 'Código de país y número, sin + ni espacios. Permanecerá inactivo en la demo.' })}</div>{field('contact', 'address', 'Dirección', { multiline: true, maxLength: 300 })}{field('contact', 'hours', 'Horario de atención', { maxLength: 180 })}
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
              <p className="we-note">La demo mantiene noindex. Guardar estos datos no activa la indexación ni configura un dominio.</p>
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
            <span className={`we-status-dot ${dirty ? 'is-dirty' : ''}`}/>{dirty ? 'Cambios sin guardar' : record?.publishedAt ? 'Versión local aplicada' : 'Borrador local'}
          </div>
          <button type="button" className="we-button we-secondary" onClick={() => setConfirmAction('restore')} disabled={!record?.published || !canEdit || busy}>
            <RotateCcw size={15}/> Recuperar aplicada
          </button>
          <button form="website-form" type="submit" className="we-button we-primary" disabled={!ready || busy || !canEdit || !dirty || invalid}>
            <Save size={16}/>{busy ? 'Procesando…' : 'Guardar borrador'}
          </button>
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
        
          <iframe ref={frame} title={`Vista previa de ${company.name}`} src="/admin/website/preview?embedded=1" onLoad={sendPreview}/>
      
        </div>
        <div className="we-publication">
          <h3>Versión de la demo</h3>
          <p>{record?.publishedAt ? `Aplicada ${stamp(record.publishedAt)} (Lima)` : 'Todavía no se aplicó una versión.'}</p>
          <button type="button" className="we-button we-primary" onClick={apply} disabled={!ready || busy || !canApply || dirty || invalid || !unapplied}>Aplicar a demo local 
            <CheckCircle2 size={16}/>
          </button>{dirty && <small>Guarda el borrador antes de aplicar.</small>}{!canApply && <small>Necesitas permiso de publicación para aplicar una versión.</small>}
          <Link href="/admin/website/preview?source=published" target="_blank" rel="noopener noreferrer">Abrir versión aplicada 
            <ArrowUpRight size={14}/>
          </Link>
          <Link href="/admin/website/preview" target="_blank" rel="noopener noreferrer">Abrir borrador guardado 
            <ArrowUpRight size={14}/>
          </Link>
        </div>
      </aside>
    </div>
    
    <section className="we-history">
      <h2>Actividad local</h2>
      <p>Registro orientativo de este navegador. La auditoría centralizada se incorporará en Django.</p>{record?.events.length ? <ol>{record.events.slice(0, 5).map(event => <li key={event.revision}>
          <span>{event.action === 'save' ? 'Borrador guardado' : 'Versión aplicada a demo'}</span>
          <small>Revisión {event.revision} · {stamp(event.at)} (Lima)</small>
        </li>)}</ol> : <p>No hay cambios guardados todavía.</p>}
    </section>
    
    <Dialog open={Boolean(confirmAction)} onOpenChange={open => { if (!open) setConfirmAction(null); }}>
      <DialogContent>
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
  </div>;
}
