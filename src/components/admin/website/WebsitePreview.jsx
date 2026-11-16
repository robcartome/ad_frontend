'use client';
import LoadingIndicator from '@/components/feedback/LoadingIndicator';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { validateWebsite, previewStore } from '@/lib/website/content.mjs';
import { djangoWebsiteRepository } from './useWebsiteAccess';
const editorialCategories = [], editorialProducts = [];
import { CartProvider } from '@/components/commerce/CartProvider';
import StoreHome from '@/components/storefront/StoreHome';
import StoreHeader from '@/components/storefront/StoreHeader';
import StoreFooter from '@/components/storefront/StoreFooter';

export default function WebsitePreview({ company, discovery }) {
  const params = useSearchParams();
  const source = params.get('source') === 'published' ? 'published' : 'draft';
  const embedded = params.get('embedded') === '1';
  const [document, setDocument] = useState(null);
  const [error, setError] = useState('');
  const [now, setNow] = useState(null);

  useEffect(() => {
    const scope = ({ companyId: company.id, websiteId: discovery.id });
    let active = true;
    async function load() {
      try {
        const record = source === 'published' ? await djangoWebsiteRepository.load(scope) : { draft: (await djangoWebsiteRepository.preview(scope)).content };
        if (!active) return;
        setDocument(source === 'published' ? record.published : record.draft);
        setError(source === 'published' && !record.published ? 'Aun no hay una revision publicada. Guarda y publica desde el editor.' : '');
        setNow(Date.now());
      } catch (cause) { if (active) setError(cause.message); }
    }
    function message(event) {
      if (!embedded || source !== 'draft' || event.origin !== window.location.origin || event.source !== window.parent || event.data?.type !== 'apudig:website-preview' || event.data.companyId !== company.id) return;
      if (!Object.keys(validateWebsite(event.data.document, editorialProducts.map(product => product.id))).length) {
        setDocument(event.data.document);
        setError('');
        setNow(Date.now());
      }
    }
    load();
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    window.addEventListener('message', message);
    if (embedded) window.parent.postMessage({ type: 'apudig:website-preview-ready' }, window.location.origin);
    return () => { active = false; clearInterval(timer); window.removeEventListener('message', message); };
  }, [company.id, company.name, discovery.id, source, embedded]);

  if (error) return <div className="we-empty" role="alert">
    <h1>Vista previa no disponible</h1>
    <p>{error}</p>
  </div>;
  if (!document || !now) return <LoadingIndicator fullScreen label="Preparando vista previa…"/>;
  const store = previewStore({ id: `website-preview-${company.id}`, colors: { background: '#F5F5F6', muted: '#F2F2F2' } }, document);
  return <div className="storefront" style={{ '--sf-orange': document.identity.primaryColor }}>
    {!embedded && <div className="we-preview-notice">
      <Link href="/admin/website">← Volver al editor</Link> · Vista previa autenticada · {company.name} · {source === 'draft' ? 'Borrador guardado' : 'Revision publicada'} · Vista administrativa
    </div>}
    
    <CartProvider key={store.id} store={store} products={editorialProducts}>
      
      <div inert aria-label="Vista previa de la tienda; enlaces y compra desactivados">
        
        <StoreHeader store={store} categories={editorialCategories}/>
        
        <main>
          <StoreHome store={store} categories={editorialCategories} products={editorialProducts} content={document} now={now}/>
        </main>
        
        <StoreFooter store={store} categories={editorialCategories}/>
      
      </div>
    </CartProvider>
  </div>;
}
