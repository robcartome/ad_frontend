import { apiFetch } from "./api";

export function getCurrentWebsite() {
  return apiFetch("/websites/current/");
}

export function updateCurrentWebsite(changes) {
  return apiFetch("/websites/current/", {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

export function getWebsiteSettings() {
  return apiFetch("/websites/current/settings/");
}

export function updateWebsiteSettings(changes) {
  return apiFetch("/websites/current/settings/", {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

export function getWebsiteDomains() {
  return apiFetch("/websites/current/domains/");
}

export function registerWebsiteDomain(domain) {
  return apiFetch("/websites/current/domains/", {
    method: "POST",
    body: JSON.stringify(domain),
  });
}

export function getWebsitePages() { return apiFetch("/websites/current/pages/"); }
export function createWebsitePage(page) { return apiFetch("/websites/current/pages/", { method: "POST", body: JSON.stringify(page) }); }
export function getWebsitePage(id) { return apiFetch(`/websites/current/pages/${id}/`); }
export function updateWebsitePage(id, changes) { return apiFetch(`/websites/current/pages/${id}/`, { method: "PATCH", body: JSON.stringify(changes) }); }
export function replaceWebsitePageSections(id, expectedVersion, sections) { return apiFetch(`/websites/current/pages/${id}/sections/`, { method: "PUT", body: JSON.stringify({ expected_version: expectedVersion, sections }) }); }
export function publishWebsitePage(id, expectedVersion) { return apiFetch(`/websites/current/pages/${id}/publish/`, { method: "POST", body: JSON.stringify({ expected_version: expectedVersion }) }); }
export function restoreWebsitePageRevision(id, version, expectedVersion) { return apiFetch(`/websites/current/pages/${id}/revisions/${version}/restore/`, { method: "POST", body: JSON.stringify({ expected_version: expectedVersion }) }); }
export function createWebsitePagePreviewToken(id) { return apiFetch(`/websites/current/pages/${id}/preview-token/`, { method: "POST" }); }

export function setPrimaryWebsiteDomain(id) { return apiFetch(`/websites/current/domains/${id}/primary/`, { method: "PATCH" }); }
export function getWebsiteMenus() { return apiFetch("/websites/current/menus/"); }
export function createWebsiteMenu(menu) { return apiFetch("/websites/current/menus/", { method: "POST", body: JSON.stringify(menu) }); }
export function updateWebsiteMenu(id, changes) { return apiFetch(`/websites/current/menus/${id}/`, { method: "PATCH", body: JSON.stringify(changes) }); }
export function replaceWebsiteMenuItems(id, expectedVersion, items) { return apiFetch(`/websites/current/menus/${id}/items/`, { method: "PUT", body: JSON.stringify({ expected_version: expectedVersion, items }) }); }
export function publishWebsiteMenu(id, expectedVersion) { return apiFetch(`/websites/current/menus/${id}/publish/`, { method: "POST", body: JSON.stringify({ expected_version: expectedVersion }) }); }
export function getWebsiteMedia() { return apiFetch("/websites/current/media/"); }
export function uploadWebsiteMedia({ file, kind = "IMAGE", altText = "" }) { const body = new FormData(); body.append("file", file); body.append("kind", kind); body.append("alt_text", altText); return apiFetch("/websites/current/media/", { method: "POST", body }); }
export function updateWebsiteMedia(id, changes) { return apiFetch(`/websites/current/media/${id}/`, { method: "PATCH", body: JSON.stringify(changes) }); }
export function deleteWebsiteMedia(id) { return apiFetch(`/websites/current/media/${id}/`, { method: "DELETE" }); }
export function getWebsiteCatalogSettings() { return apiFetch("/websites/current/catalog-settings/"); }
export function updateWebsiteCatalogSettings(changes) { return apiFetch("/websites/current/catalog-settings/", { method: "PATCH", body: JSON.stringify(changes) }); }
export function getWebsiteProducts() { return apiFetch("/websites/current/products/"); }
export function getWebsiteCatalogProductOptions(search = "") { return apiFetch(`/websites/current/catalog-product-options/?search=${encodeURIComponent(search)}`); }
export function createWebsiteProduct(product) { return apiFetch("/websites/current/products/", { method: "POST", body: JSON.stringify(product) }); }
export function updateWebsiteProduct(id, changes) { return apiFetch(`/websites/current/products/${id}/`, { method: "PATCH", body: JSON.stringify(changes) }); }
export function deleteWebsiteProduct(id) { return apiFetch(`/websites/current/products/${id}/`, { method: "DELETE" }); }
