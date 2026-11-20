export function requestHostname(value) {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9.-]+(?::[0-9]{1,5})?$/.test(value)) return null;
  const [hostname, port] = value.split(':');
  if (port && (+port < 1 || +port > 65535)) return null;
  return hostname.toLowerCase().replace(/\.$/, '');
}

export function resolveRequestHostname(host, { nodeEnv, devHostname } = {}) {
  const hostname = requestHostname(host);
  if (nodeEnv !== 'development' || hostname !== 'localhost' || !devHostname) return hostname;
  const configured = requestHostname(devHostname);
  // The override is a hostname, never a URL, port, IP address or partial label.
  if (!configured || configured !== devHostname.toLowerCase().replace(/\.$/, '') ||
      !configured.includes('.') || /^\d+(?:\.\d+)*$/.test(configured) ||
      configured.split('.').some(label => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))) return null;
  return configured;
}

export async function fetchPublicWebsite(apiUrl, hostname, fetcher = fetch) {
  if (!hostname) throw Object.assign(new Error('Website inexistente.'), { status: 404 });
  const response = await fetcher(`${apiUrl.replace(/\/$/, '')}/storefront/sites/${encodeURIComponent(hostname)}/content/`, { cache: 'no-store', headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw Object.assign(new Error(response.status === 404 ? 'Website inexistente.' : 'No se pudo cargar el Website.'), { status: response.status });
  const data = await response.json();
  if (data.hostname !== hostname || data.content?.schemaVersion !== 3 || typeof data.commerceEnabled !== 'boolean') throw new Error('Contrato público incompatible.');
  return data;
}
