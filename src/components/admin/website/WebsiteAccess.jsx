'use client';

import { useWebsiteAccess } from './useWebsiteAccess';
import WebsiteEditor from './WebsiteEditor';
import WebsitePreview from './WebsitePreview';

export default function WebsiteAccess({ preview = false }) {
  const { selectedCompany, canView, canEdit, canApply } = useWebsiteAccess();
  if (!canView) return <div className="we-empty"><h1>Gestión de página web</h1><p>No tienes permisos para gestionar el contenido web de esta empresa.</p></div>;
  if (!selectedCompany?.company_id) return null;
  const company = { id: String(selectedCompany.company_id), name: selectedCompany.company_name || 'Mi empresa' };
  return preview ? <WebsitePreview key={company.id} company={company}/> : <WebsiteEditor key={company.id} company={company} canEdit={canEdit} canApply={canApply}/>;
}
