export const SOCIAL_NETWORKS = [
  { id: 'facebook', label: 'Facebook', hosts: ['facebook.com', 'fb.com'] },
  { id: 'instagram', label: 'Instagram', hosts: ['instagram.com'] },
  { id: 'tiktok', label: 'TikTok', hosts: ['tiktok.com'] },
  { id: 'youtube', label: 'YouTube', hosts: ['youtube.com', 'youtu.be'] },
  { id: 'x', label: 'X', hosts: ['x.com', 'twitter.com'] },
];

export function socialUrl(value, networkId) {
  const network = SOCIAL_NETWORKS.find(item => item.id === networkId);
  if (!network || typeof value !== 'string' || !value || value.length > 300 || /\s/.test(value)) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
    return network.hosts.some(host => url.hostname === host || url.hostname.endsWith(`.${host}`)) ? url.href : null;
  } catch { return null; }
}

export function validEmail(value) {
  return typeof value === 'string' && value.length <= 180 && /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?)+$/i.test(value);
}

export function emailHref(value) {
  return validEmail(value) ? `mailto:${encodeURIComponent(value)}` : null;
}

export function phoneHref(value) {
  if (typeof value !== 'string' || !/^[+\d().\s-]+$/.test(value)) return null;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 6 && digits.length <= 15 ? `tel:${value.trim().startsWith('+') ? '+' : ''}${digits}` : null;
}

export function socialLinks(store) {
  return SOCIAL_NETWORKS.map(network => ({ ...network, href: socialUrl(store.socials?.[network.id], network.id) })).filter(network => network.href);
}
