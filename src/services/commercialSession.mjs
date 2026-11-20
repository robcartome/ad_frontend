import { jsonRequest } from './http/jsonRequest.mjs';

export const commercialSessionKey = websiteId => `apudig:commercial-session:${websiteId}`;

export function createCommercialSession({ baseUrl, hostname, websiteId, storage, fetchImpl = fetch }) {
  const base = baseUrl.replace(/\/$/, '');
  const key = commercialSessionKey(websiteId);
  let tokens = null, refreshing = null, generation = 0;
  let persistent = Boolean(storage);
  try { tokens = JSON.parse(storage?.getItem(key) || 'null'); } catch { persistent = false; }
  if (tokens?.websiteId !== websiteId || tokens?.context !== 'commercial') tokens = null;
  function remember(value) {
    generation++;
    tokens = value;
    try { if (value) storage?.setItem(key, JSON.stringify(value)); else storage?.removeItem(key); }
    catch { persistent = false; }
  }
  async function send(path, { body, token, method = body === undefined ? 'GET' : 'POST', signal, headers = {} } = {}) {
    return jsonRequest(`${base}${path}`, {
      method, cache: 'no-store', credentials: 'omit',
      headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(10000)]) : AbortSignal.timeout(10000),
    }, { fetchImpl, logError: () => {}, parseError: data => data.detail || 'No se pudo completar la solicitud.' });
  }
  function validateTokens(data, existing = {}) {
    if (data.context !== 'commercial' || data.websiteId !== websiteId || typeof data.access !== 'string') throw new Error('La sesión no corresponde a esta empresa.');
    return { context: data.context, websiteId, access: data.access, refresh: data.refresh || existing.refresh };
  }
  async function refresh() {
    if (!refreshing) {
      const current = tokens, started = generation;
      refreshing = (async () => {
        try {
          if (!current?.refresh) throw Object.assign(new Error('Inicia sesión para continuar.'), { status: 401 });
          const data = await send('/auth/refresh/', { body: { refresh_token: current.refresh, hostname } });
          if (generation !== started) throw Object.assign(new Error('La sesión cambió.'), { code: 'SESSION_CHANGED' });
          remember(validateTokens(data, current));
        } catch (error) { if (generation === started) remember(null); throw error; }
      })().finally(() => { refreshing = null; });
    }
    return refreshing;
  }
  async function profile({ signal } = {}) {
    const started = generation;
    let data;
    try { data = await send(`/storefront/sites/${encodeURIComponent(hostname)}/account/`, { token: tokens?.access, signal }); }
    catch (error) {
      if (signal?.aborted || generation !== started) throw error;
      if (error.status !== 401 || !tokens?.refresh) throw error;
      await refresh();
      data = await send(`/storefront/sites/${encodeURIComponent(hostname)}/account/`, { token: tokens?.access, signal });
    }
    if (data.context !== 'commercial' || data.websiteId !== websiteId || data.contactVerified !== true) {
      remember(null);
      throw new Error('No pudimos verificar tu cuenta comercial.');
    }
    return data;
  }
  async function establish(path, options) {
    const data = await send(path, options);
    remember(validateTokens(data));
    return profile();
  }
  async function accountRequest(suffix, body, headers = {}) {
    const path = `/storefront/sites/${encodeURIComponent(hostname)}/account/${suffix}`;
    const started = generation;
    let data;
    try { data = await send(path, { body, token: tokens?.access, headers }); }
    catch (error) {
      if (generation !== started || error.status !== 401 || !tokens?.refresh) throw error;
      await refresh();
      data = await send(path, { body, token: tokens?.access, headers });
    }
    if (data.websiteId !== websiteId) throw new Error('La respuesta no corresponde a esta empresa.');
    return data;
  }
  async function cartReview(items, offerFingerprint) {
    const suffix = offerFingerprint ? 'confirm/' : 'quote/';
    const body = { items, ...(offerFingerprint ? { offerFingerprint } : {}) };
    const data = await accountRequest(`cart/${suffix}`, body);
    if (!Array.isArray(data.items) || !/^[0-9a-f]{64}$/.test(data.offerFingerprint) || typeof data.ordersEnabled !== 'boolean') throw new Error('No pudimos comprobar el resumen de esta empresa.');
    return data;
  }
  return {
    profile,
    cartReview,
    requests: (offset = 0) => accountRequest(`order-requests/?limit=20&offset=${encodeURIComponent(offset)}`),
    requestDetail: id => accountRequest(`order-requests/${encodeURIComponent(id)}/`),
    cancelRequest: id => accountRequest(`order-requests/${encodeURIComponent(id)}/cancel/`, {}),
    prepareRequest: (items, offerFingerprint, note, key, shareConfirmed) => accountRequest('order-requests/', { items, offerFingerprint, note, shareConfirmed }, { 'Idempotency-Key': key }),
    privacy: () => accountRequest('privacy/'),
    acceptPrivacy: noticeVersion => accountRequest('privacy/', { noticeVersion, accepted: true }),
    login: (email, password) => establish('/auth/token/', { body: { email, password, context: 'commercial', hostname } }),
    enterFromIdentity: token => establish(`/storefront/sites/${encodeURIComponent(hostname)}/account/session/`, { body: {}, token }),
    async logout() {
      const refreshToken = tokens?.refresh;
      // Keep the session available for retry if the server cannot revoke it.
      if (refreshToken) await send('/auth/logout/', { body: { refresh_token: refreshToken } });
      remember(null);
    },
    hasSession: () => Boolean(tokens?.access),
    isPersistent: () => persistent,
  };
}
