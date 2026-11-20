import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createCommercialRegistration } from '../src/services/commercialRegistration.mjs';
import { createCommercialSession } from '../src/services/commercialSession.mjs';
const context = JSON.parse(await readFile('../.tools/b4c-http-context.json', 'utf8'));
assert.equal(context.database, 'test_apudig_b4c_http');
assert.equal(context.emailSimulation, true, 'external SMTP simulation must be explicitly selected');
const scenario = process.argv[2];
assert.ok(['start', 'complete', 'recovery-start', 'recovery-complete'].includes(scenario));
const config = { baseUrl: context.backend, hostname: context.hostA, websiteId: context.websiteA };
const registration = createCommercialRegistration(config);
const email = 'new-d5-client@integration.invalid';
const password = 'Synthetic-D5-Only-Password-2026!';
const policy = await registration.policy();
assert.equal(policy.registrationEnabled, true);
if (scenario.endsWith('start')) {
  await registration.start({ email, name: 'D5 synthetic client', noticeVersion: policy.notice.version, consent: true, purpose: scenario === 'start' ? 'REGISTER' : 'RECOVERY' });
} else {
  const { token } = JSON.parse(await readFile('../.tools/d5-email-proof.json', 'utf8'));
  const changedPassword = 'Changed-Synthetic-D5-Password-2026!';
  const storage = new Map();
  const client = createCommercialSession({ ...config, storage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) } });
  if (scenario === 'complete') {
    const response = await registration.complete({ token, password, purpose: 'REGISTER' });
    assert.equal(response.status, 'COMPLETE');
    await assert.rejects(registration.complete({ token, password, purpose: 'REGISTER' }), error => error.status === 400);
    const profile = await client.login(email, password);
    assert.equal(profile.wholesaleApproved, false);
    assert.equal(profile.contactVerified, true);
    assert.equal(profile.capabilities.prepareOrders, true);
    const productResponse = await fetch(`${context.backend}/storefront/sites/${context.hostA}/products/${context.productA}/`);
    const product = (await productResponse.json()).product;
    const items = [{ productId: product.id, unitId: product.unitId, quantity: 1 }];
    const offer = await client.cartReview(items);
    assert.equal((await client.cartReview(items, offer.offerFingerprint)).confirmed, true);
    const row = await client.prepareRequest(items, offer.offerFingerprint, '', crypto.randomUUID(), true);
    assert.equal(row.status, 'PREPARED');
    assert.match(row.whatsappUrl, /^https:\/\/wa\.me\/51900000001\?text=/);
    assert.equal((await client.requests()).count, 1);
    const b = createCommercialSession({ ...config, hostname: context.hostB, websiteId: context.websiteB });
    await assert.rejects(b.login(email, password), error => [401, 403].includes(error.status));
  } else {
    await client.login(email, password);
    const result = await registration.complete({ token, password: changedPassword, purpose: 'RECOVERY' });
    assert.equal(result.status, 'COMPLETE');
    await assert.rejects(client.profile(), error => [401, 403].includes(error.status));
    assert.equal((await client.login(email, changedPassword)).contactVerified, true);
  }
}
await writeFile(`../.tools/d5-registration-${scenario}.json`, JSON.stringify({ passed: true, scenario, database: context.database, HTTP: 'real Django/PostgreSQL; frontend transport', externalEmail: 'locmem SMTP adapter simulation; no real delivery', whatsapp: 'URL only, no message' }, null, 2));
console.log(`D5 ${scenario} passed; SMTP external adapter simulated`);
