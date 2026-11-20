'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createCommercialSession } from '@/services/commercialSession.mjs';
import { API_URL } from '@/lib/apiConfig';
import { createCommercialRegistration } from '@/services/commercialRegistration.mjs';

const CommercialContext = createContext(null);
function browserStorage() {
  try { return typeof window === 'undefined' ? undefined : window.localStorage; } catch { return undefined; }
}

export default function CommercialProvider({ hostname, websiteId, companyName, children }) {
  const client = useMemo(() => createCommercialSession({ baseUrl: API_URL, hostname, websiteId, storage: browserStorage() }), [hostname, websiteId]);
  const [profile, setProfile] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [registrationEnabled, setRegistrationEnabled] = useState(false);
  useEffect(() => {
    let active = true;
    const registration = createCommercialRegistration({ baseUrl: API_URL, hostname, websiteId });
    registration.policy().then(policy => { if (active) setRegistrationEnabled(policy.registrationEnabled === true); }).catch(() => { if (active) setRegistrationEnabled(false); });
    return () => { active = false; };
  }, [hostname, websiteId]);
  const sequence = useRef(0);
  const perform = useCallback(async (operation, preserveOnFailure = false) => {
    const current = ++sequence.current;
    setBusy(true); setError('');
    try {
      const value = await operation();
      if (current === sequence.current) setProfile(value || null);
    } catch (failure) {
      if (current === sequence.current && failure.name !== 'AbortError') {
        if (!preserveOnFailure) setProfile(null);
        setError(failure.message || 'No pudimos comprobar tu cuenta. Inténtalo nuevamente.');
      }
    } finally { if (current === sequence.current) setBusy(false); }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const check = () => { if (client.hasSession()) perform(() => client.profile({ signal: controller.signal })); };
    if (client.hasSession()) check(); else setBusy(false);
    window.addEventListener('focus', check);
    return () => { sequence.current++; controller.abort(); window.removeEventListener('focus', check); };
  }, [client, perform]);
  return <CommercialContext.Provider value={{ profile, busy, error, companyName, registrationEnabled,
    login: (email, password) => perform(() => client.login(email, password)),
    enterFromIdentity: token => perform(() => client.enterFromIdentity(token)),
    logout: () => perform(async () => { await client.logout(); return null; }, true),
    refresh: () => perform(() => client.profile()),
    cartReview: async (...args) => {
      try { return await client.cartReview(...args); }
      catch (failure) {
        if (failure.status === 401 || failure.status === 403) await perform(() => client.profile());
        throw failure;
      }
    },
    persistent: client.isPersistent(),
    requests: client.requests,
    requestDetail: client.requestDetail,
    cancelRequest: client.cancelRequest,
    prepareRequest: client.prepareRequest,
    privacy: client.privacy,
    acceptPrivacy: client.acceptPrivacy,
  }}>{children}</CommercialContext.Provider>;
}

export const useCommercialAccount = () => useContext(CommercialContext);
