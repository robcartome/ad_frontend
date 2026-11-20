import { jsonRequest } from './http/jsonRequest.mjs';

export function createCommercialRegistration({ baseUrl, hostname, websiteId, fetchImpl = fetch }) {
  const base = baseUrl.replace(/\/$/, '');
  async function request(path, body, token) {
    return jsonRequest(base + path, {
      method: body === undefined ? 'GET' : 'POST', credentials: 'omit', cache: 'no-store',
      headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(10000),
    }, { fetchImpl, logError: () => {}, parseError: data => data.detail || 'No pudimos completar la solicitud.' });
  }
  const site = `/storefront/sites/${encodeURIComponent(hostname)}/`;
  return {
    async policy() {
      const policy = await request(site + 'registration-policy/');
      if (policy.websiteId !== websiteId) throw new Error('El aviso no corresponde a esta empresa.');
      if (policy.registrationEnabled === true && (!policy.notice?.version || !policy.notice?.text)) throw new Error('El aviso de registro no está completo.');
      return policy;
    },
    start: data => request(site + 'registrations/', data),
    complete: (data, identity) => request(site + 'registrations/complete/', data, identity),
    async existingIdentity(email, password) {
      // Reuse the credential endpoint without replacing the employee session.
      const response = await request('/auth/token/', { email, password });
      return response.access;
    },
  };
}

export function consumeProofFragment(location, history) {
  const token = new URLSearchParams(location.hash.slice(1)).get('token') || '';
  if (location.hash) history.replaceState(null, '', location.pathname);
  return token;
}
