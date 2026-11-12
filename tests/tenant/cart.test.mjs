import assert from "node:assert/strict";
import test from "node:test";

import {
  CART_MAX_QUANTITY,
  addCartItem,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  cartFingerprint,
  cartStorageKey,
  normalizeQuantity,
  sanitizeStoredCart,
} from "../../src/lib/cart/cart.js";

const product = {
  id: "11111111-1111-1111-1111-111111111111",
  slug: "taladro",
  sku: "TAL-01",
  name: "Taladro",
  price: "150.00",
  currency: "PEN",
  availability: "AVAILABLE",
};

test("la clave y el contenido persistido quedan aislados por website", () => {
  assert.notEqual(cartStorageKey("site-a"), cartStorageKey("site-b"));
  const stored = { version: 1, website_id: "site-a", items: [{ product, quantity: 2 }] };
  assert.equal(sanitizeStoredCart(stored, "site-a").length, 1);
  assert.deepEqual(sanitizeStoredCart(stored, "site-b"), []);
});

test("cantidades y duplicados se normalizan con límites", () => {
  assert.equal(normalizeQuantity(0), 1);
  assert.equal(normalizeQuantity(5000), CART_MAX_QUANTITY);
  const once = addCartItem([], product, 2);
  const twice = addCartItem(once, { ...product, price: "999.00" }, 3);
  assert.equal(twice.length, 1);
  assert.equal(twice[0].quantity, 5);
  assert.equal(twice[0].product.price, "999.00");
  assert.equal(cartFingerprint(twice), `${product.id}:5`);
});

test("el mensaje WhatsApp usa sólo la cotización autoritativa", () => {
  const quote = {
    quote_id: "abcdef12-0000-0000-0000-000000000000",
    currency: "PEN",
    total: "300.00",
    quote_token: "secret-signed-token",
    lines: [{
      product_id: product.id,
      status: "ACTIVE",
      quantity: 2,
      sku: "TAL-01",
      name: "Taladro validado",
      price: "150.00",
      subtotal: "300.00",
    }],
  };
  const message = buildWhatsAppMessage({ websiteName: "Tienda A", quote });
  assert.match(message, /2 × TAL-01/);
  assert.match(message, /Total cotizado: PEN 300.00/);
  assert.doesNotMatch(message, /secret-signed-token/);
  const url = buildWhatsAppUrl({ phone: "+51 999-888-777", websiteName: "Tienda A", quote });
  assert.ok(url.startsWith("https://wa.me/51999888777?text="));
  assert.match(decodeURIComponent(url), /solicitud de cotización/i);
});
