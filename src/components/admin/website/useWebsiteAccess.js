'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { apiFetch } from '@/services/api';
import { createDjangoWebsiteRepository } from '@/services/websiteRepository.mjs';
export const djangoWebsiteRepository = createDjangoWebsiteRepository(apiFetch);
export function useWebsiteAccess() {
  const auth = useAuth();
  const companyId = auth.selectedCompany?.company_id;
  const [state, setState] = useState({ companyId: null, discovery: null, error: null });
  useEffect(() => {
    let active = true;
    if (companyId) djangoWebsiteRepository.discover(window.location.hostname).then(discovery => {
      if (active && discovery.companyId === String(companyId)) setState({ companyId, discovery, error: null });
      else if (active) setState({ companyId, discovery: null, error: new Error('La empresa de la sesión cambió. Vuelve a seleccionarla.') });
    }).catch(error => { if (active) setState({ companyId, discovery: null, error }); });
    return () => { active = false; };
  }, [companyId]);
  const discovery = state.companyId === companyId ? state.discovery : null;
  const capabilities = discovery?.capabilities || {};
  return { ...auth, discovery, capabilities, accessError: state.companyId === companyId ? state.error : null, accessLoading: Boolean(companyId && !discovery && !(state.companyId === companyId && state.error)), canView: Boolean(capabilities.view), canEdit: Boolean(capabilities.edit), canApply: Boolean(capabilities.publish && capabilities.realPublication) };
}
