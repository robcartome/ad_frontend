import { Suspense } from 'react';
import WebsiteAccess from '@/components/admin/website/WebsiteAccess';
export default function WebsitePreviewPage() {
  return <Suspense fallback={<p className="we-loading">Preparando vista previa…</p>}><WebsiteAccess preview/></Suspense>;
}
