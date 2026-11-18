'use client';

import { useWebsiteAccess } from './useWebsiteAccess';
import WebsiteEditor from './WebsiteEditor';
import WebsitePreview from './WebsitePreview';
import { LockKeyhole } from 'lucide-react';
import Link from 'next/link';

export default function WebsiteAccess({ preview = false }) {
  const { user, selectedCompany, canView, canEdit, canApply, discovery, capabilities, accessError, accessLoading } = useWebsiteAccess();
  if (accessLoading) return <div className="we-empty" role="status">Cargando permisos y Website…</div>;
  if (accessError) return <div className="we-empty" role="alert"><h1>Website no disponible</h1><p>{accessError.message}</p><Link href="/login">Revisar sesión</Link></div>;
  if (!canView) return <div className="we-empty" role="status"><LockKeyhole/><h1>Administrar página web</h1><p>No tienes permisos para consultar o editar el contenido web de esta empresa.</p><p>Solicita al administrador los permisos de lectura, edición o publicación que necesites.</p><Link href="/admin" className="we-button we-secondary mt-5">Volver al inicio</Link></div>;
  if (!selectedCompany?.company_id) return null;
  const company = { id: String(selectedCompany.company_id), name: selectedCompany.company_name || 'Mi empresa' };
  const canReadCatalog = canEdit || canApply || (String(user?.company?.id) === company.id && user.company.permissions?.includes('read.website'));
  return preview ? <WebsitePreview key={company.id} company={company} discovery={discovery}/> : <WebsiteEditor key={company.id} company={company} discovery={discovery} capabilities={capabilities} canEdit={canEdit} canApply={canApply} canReadCatalog={Boolean(canReadCatalog)}/>;
}
