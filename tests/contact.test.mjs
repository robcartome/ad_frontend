import test from 'node:test';
import assert from 'node:assert/strict';
import { emailHref, phoneHref, socialUrl, socialLinks } from '../src/lib/website/contact.mjs';
import { createWebsiteDocument, validateWebsite, previewStore } from '../src/lib/website/content.mjs';

test('contact links encode email addresses and never turn arbitrary text into telephone or email destinations', () => {
  assert.equal(phoneHref('+51 (987) 654-321'), 'tel:+51987654321');
  assert.equal(phoneHref('javascript:123456789'), null);
  assert.equal(phoneHref('Por confirmar'), null);
  assert.equal(phoneHref(''), null);
  assert.equal(emailHref('ventas+web@example.pe'), 'mailto:ventas%2Bweb%40example.pe');
  assert.equal(emailHref('ventas@example.pe?subject=test'), null);
  assert.equal(emailHref('ventas@example.pe\r\nBcc:other@example.pe'), null);
});

test('social links only allow the chosen network HTTPS hosts and skip blank or unsafe profiles', () => {
  assert.equal(socialUrl('https://www.instagram.com/mi_tienda', 'instagram'), 'https://www.instagram.com/mi_tienda');
  for (const url of ['javascript:alert(1)', 'http://instagram.com/tienda', 'https://instagram.com.evil.test/', 'https://user:password@instagram.com/tienda', 'https://facebook.com/tienda', 'https://instagram.com:8080/tienda']) assert.equal(socialUrl(url, 'instagram'), null);
  assert.deepEqual(socialLinks({ socials: {} }), []);
  assert.deepEqual(socialLinks({ socials: { instagram: 'https://instagram.com/mi_tienda', x: 'javascript:alert(1)', unknown: 'https://example.com' } }).map(item => item.id), ['instagram']);
});

test('optional contact fields preserve old v3 drafts while validating new details and projecting only known networks', () => {
  const old = createWebsiteDocument();
  delete old.contact.secondaryPhone;
  delete old.contact.email;
  delete old.contact.socials;
  assert.deepEqual(validateWebsite(old), {});
  old.contact.email = 'not-an-email';
  old.contact.socials = { instagram: 'https://facebook.com/mi_tienda' };
  assert.ok(validateWebsite(old)['contact.email']);
  assert.ok(validateWebsite(old)['contact.socials.instagram']);
  old.contact.email = 'ventas@example.pe';
  old.contact.secondaryPhone = '+51 987 654 321';
  old.contact.socials.instagram = 'https://instagram.com/mi_tienda';
  old.contact.socials.unknown = 'https://other.example';
  assert.deepEqual(validateWebsite(old), {});
  const store = previewStore({ id: 'company-a', colors: {} }, old);
  assert.equal(store.email, 'ventas@example.pe');
  assert.equal(store.secondaryPhone, '+51 987 654 321');
  assert.equal(store.socials.instagram, 'https://instagram.com/mi_tienda');
  assert.equal(store.socials.unknown, undefined);
});
