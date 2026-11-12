'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createWebsiteDocument, validateWebsite, previewStore } from '@/lib/website/content.mjs';
import { createLocalWebsiteRepository, websiteKey, localWebsiteScope } from '@/services/websiteRepository.mjs';
import { demoCategories, demoProducts } from '@/data/demo/storefront';
import { CartProvider } from '@/components/commerce/CartProvider';
import StoreHome from '@/components/storefront/StoreHome';
import StoreHeader from '@/components/storefront/StoreHeader';
import StoreFooter from '@/components/storefront/StoreFooter';

export default function WebsitePreview({ company }) {
  const params = useSearchParams();
  const source = params.get('source') === 'published' ? 'published' : 'draft';
  const embedded = params.get('embedded') === '1';
  const [document, setDocument] = useState(null);
  const [error, setError] = useState('');
  const [now, setNow] = useState(null);

  useEffect(() => {
    const scope = localWebsiteScope(company.id);
    let active = true;
    async function load() {
      try {
        const repository = createLocalWebsiteRepository(localStorage, demoProducts.map(product => product.id));
        const record = await repository.load(scope, createWebsiteDocument(company.name));
        if (!active) return;
        setDocument(source === 'published' ? record.published : record.draft);
        setError(source === 'published' && !record.published ? 'Aún no hay una versión aplicada a la demo. Guarda y aplica una versión desde el editor.' : '');
        setNow(Date.now());
      } catch (cause) { if (active) setError(cause.message); }
    }
    function storage(event) { if (event.key === websiteKey(scope) || event.key === null) load(); }
    function message(event) {
      if (!embedded || source !== 'draft' || event.origin !== window.location.origin || event.source !== window.parent || event.data?.type !== 'apudig:website-preview' || event.data.companyId !== company.id) return;
      if (!Object.keys(validateWebsite(event.data.document, demoProducts.map(product => product.id))).length) {
        setDocument(event.data.document);
        setError('');
        setNow(Date.now());
      }
    }
    load();
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    window.addEventListener('storage', storage);
    window.addEventListener('message', message);
    if (embedded) window.parent.postMessage({ type: 'apudig:website-preview-ready' }, window.location.origin);
    return () => { active = false; clearInterval(timer); window.removeEventListener('storage', storage); window.removeEventListener('message', message); };
  }, [company.id, company.name, source, embedded]);

  if (error) return <div className="we-empty" role="alert">
    <h1>Vista previa no disponible</h1>
    <p>{error}</p>
  </div>;
  if (!document || !now) return <p className="we-loading" role="status">Preparando vista previa…</p>;
  const store = previewStore({ id: `website-preview-${company.id}`, colors: { background: '#F5F5F6', muted: '#F2F2F2' } }, document);
  return <div className="storefront" style={{ '--sf-orange': document.identity.primaryColor }}>
    {!embedded && <div className="we-preview-notice">
      <Link href="/admin/website">← Volver al editor</Link> · Vista previa local · {company.name} · {source === 'draft' ? 'Borrador guardado' : 'Versión aplicada a la demo'} · No publicada en Internet
    </div>}
    
    <CartProvider key={store.id} store={store} products={demoProducts}>
      
      <div inert aria-label="Vista previa de la tienda; enlaces y compra desactivados">
        
        <StoreHeader store={store} categories={demoCategories}/>
        
        <main>
          <StoreHome store={store} categories={demoCategories} products={demoProducts} content={document} now={now}/>
        </main>
        
        <StoreFooter store={store} categories={demoCategories}/>
      
      </div>
    </CartProvider>
  </div>;
}
