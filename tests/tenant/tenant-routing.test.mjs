import assert from "node:assert/strict";
import test from "node:test";

import { normalizeHost, parseHostList } from "../../src/lib/tenant/normalizeHost.js";
import { decideTenantRoute } from "../../src/lib/tenant/routing.js";

test("normaliza mayÃºsculas, puerto local, punto final e IDN", () => {
  assert.equal(normalizeHost("TOLENTINO.LOCALHOST:3000."), "tolentino.localhost");
  assert.equal(normalizeHost("FerreterÃ­a.pe"), "xn--ferretera-s2a.pe");
});

test("rechaza protocolos, rutas e IP", () => {
  assert.equal(normalizeHost("https://tolentino.apudig.com"), null);
  assert.equal(normalizeHost("tolentino.apudig.com/catalog"), null);
  assert.equal(normalizeHost("127.0.0.1"), null);
});

test("un host de control conserva las rutas existentes", () => {
  const decision = decideTenantRoute({
    hostname: "web.apudig.com",
    pathname: "/admin",
    controlHosts: parseHostList("web.apudig.com"),
  });
  assert.deepEqual(decision, { action: "next" });
});

test("un storefront se reescribe sin convertir el host en company_id", () => {
  const decision = decideTenantRoute({
    hostname: "Tolentino.ApuDig.com",
    pathname: "/",
    controlHosts: parseHostList("web.apudig.com"),
  });
  assert.deepEqual(decision, {
    action: "rewrite",
    hostname: "tolentino.apudig.com",
    pathname: "/sites/tolentino.apudig.com",
  });
});

test("bloquea acceso externo directo a la ruta interna", () => {
  const decision = decideTenantRoute({
    hostname: "tolentino.apudig.com",
    pathname: "/sites/otra.apudig.com",
    controlHosts: new Set(),
  });
  assert.deepEqual(decision, { action: "not-found" });
});

test("admin y login en un host pÃºblico se envÃ­an al host de control", () => {
  const decision = decideTenantRoute({
    hostname: "tolentino.apudig.com",
    pathname: "/admin/products",
    controlHosts: new Set(),
  });
  assert.deepEqual(decision, { action: "redirect-admin" });
});

test("sitemap y robots se resuelven dentro del tenant", () => {
  for (const pathname of ["/sitemap.xml", "/robots.txt"]) {
    const decision = decideTenantRoute({
      hostname: "tolentino.apudig.com",
      pathname,
      controlHosts: new Set(),
    });
    assert.equal(decision.action, "rewrite");
    assert.equal(decision.pathname, `/sites/tolentino.apudig.com${pathname}`);
  }
});

test("catálogo y detalle de producto conservan la ruta dentro del tenant", () => {
  for (const pathname of ["/catalog", "/productos/taladro-profesional"]) {
    const decision = decideTenantRoute({
      hostname: "tolentino.apudig.com",
      pathname,
      controlHosts: new Set(),
    });
    assert.deepEqual(decision, {
      action: "rewrite",
      hostname: "tolentino.apudig.com",
      pathname: `/sites/tolentino.apudig.com${pathname}`,
    });
  }
});
