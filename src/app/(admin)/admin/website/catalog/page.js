"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/AuthContext";
import {
  createWebsiteProduct,
  deleteWebsiteProduct,
  getWebsiteCatalogProductOptions,
  getWebsiteCatalogSettings,
  getWebsiteProducts,
  updateWebsiteCatalogSettings,
  updateWebsiteProduct,
} from "@/services/websiteService";

export default function WebsiteCatalogPage() {
  const { hasPermission } = useAuth();
  const [settings, setSettings] = useState(null);
  const [publications, setPublications] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const [catalogSettings, websiteProducts, productOptions] = await Promise.all([
        getWebsiteCatalogSettings(),
        getWebsiteProducts(),
        getWebsiteCatalogProductOptions(),
      ]);
      setSettings(catalogSettings);
      setPublications(Array.isArray(websiteProducts) ? websiteProducts : websiteProducts.results || []);
      setOptions(Array.isArray(productOptions) ? productOptions : productOptions.results || []);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, []);

  const publishedIds = useMemo(
    () => new Set(publications.map((item) => item.product)),
    [publications],
  );
  const availableOptions = options.filter((item) =>
    !publishedIds.has(item.id)
    && `${item.name} ${item.sku}`.toLowerCase().includes(search.toLowerCase()),
  );

  function updateLocal(id, changes) {
    setPublications((items) => items.map((item) => item.id === id ? { ...item, ...changes } : item));
  }

  async function saveSettings() {
    try {
      setSettings(await updateWebsiteCatalogSettings({
        default_price_list: settings.default_price_list || null,
        warehouses: settings.warehouses,
        show_out_of_stock: settings.show_out_of_stock,
        products_per_page: Number(settings.products_per_page),
      }));
      setMessage("Configuración pública guardada.");
      setError("");
    } catch (err) { setError(err.message); }
  }

  async function addProduct() {
    if (!selectedProduct) return;
    try {
      const created = await createWebsiteProduct({
        product: selectedProduct,
        is_published: false,
        position: publications.length,
      });
      setPublications((items) => [...items, created]);
      setSelectedProduct("");
      setMessage("Producto agregado como borrador.");
      setError("");
    } catch (err) { setError(err.message); }
  }

  async function saveProduct(item) {
    try {
      const saved = await updateWebsiteProduct(item.id, {
        commercial_title: item.commercial_title,
        commercial_description: item.commercial_description,
        price_list: item.price_list || null,
        is_published: item.is_published,
        is_featured: item.is_featured,
        position: Number(item.position),
      });
      setPublications((items) => items.map((entry) => entry.id === saved.id ? saved : entry));
      setMessage(`${saved.product_name} actualizado.`);
      setError("");
    } catch (err) { setError(err.message); }
  }

  async function removeProduct(item) {
    try {
      await deleteWebsiteProduct(item.id);
      setPublications((items) => items.filter((entry) => entry.id !== item.id));
      setMessage(`${item.product_name} retirado del sitio.`);
      setError("");
    } catch (err) { setError(err.message); }
  }

  if (!settings) return <p>{error || "Cargando catálogo…"}</p>;

  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-2xl font-bold">Catálogo del sitio</h1>
        <p className="text-sm text-slate-500">Publica productos del ERP y define sus fuentes de precio y disponibilidad.</p>
      </header>

      <section className="space-y-4 rounded-xl border bg-white p-5">
        <h2 className="font-semibold">Configuración comercial</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-medium"><span>Lista de precios</span>
            <select className="h-10 w-full rounded-md border px-3" value={settings.default_price_list || ""} onChange={(event) => setSettings({ ...settings, default_price_list: event.target.value || null })}>
              <option value="">Precio de venta general</option>
              {settings.price_list_options.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium"><span>Productos por página</span>
            <Input type="number" min="1" max="60" value={settings.products_per_page} onChange={(event) => setSettings({ ...settings, products_per_page: event.target.value })} />
          </label>
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Almacenes para disponibilidad</legend>
          <p className="text-xs text-slate-500">Sin selección se mostrará “Consultar disponibilidad”.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {settings.warehouse_options.map((item) => <label key={item.id} className="flex items-center gap-2 rounded-lg border p-3 text-sm">
              <input type="checkbox" checked={settings.warehouses.includes(item.id)} onChange={(event) => setSettings({ ...settings, warehouses: event.target.checked ? [...settings.warehouses, item.id] : settings.warehouses.filter((id) => id !== item.id) })} />
              {item.store} · {item.name}
            </label>)}
          </div>
        </fieldset>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.show_out_of_stock} onChange={(event) => setSettings({ ...settings, show_out_of_stock: event.target.checked })} />Mostrar productos agotados</label>
        <Button onClick={saveSettings}>Guardar configuración</Button>
      </section>

      <section className="space-y-4 rounded-xl border bg-white p-5">
        <h2 className="font-semibold">Agregar producto</h2>
        <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filtrar por nombre o SKU" />
          <select className="h-10 rounded-md border px-3" value={selectedProduct} onChange={(event) => setSelectedProduct(event.target.value)}>
            <option value="">Selecciona un producto activo</option>
            {availableOptions.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.sku}</option>)}
          </select>
          <Button onClick={addProduct} disabled={!selectedProduct}>Agregar borrador</Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Productos vinculados ({publications.length})</h2>
        {publications.map((item) => <article key={item.id} className="space-y-3 rounded-xl border bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><strong>{item.product_name}</strong><p className="text-xs text-slate-500">SKU {item.sku} · /productos/{item.slug}</p></div>
            <div className="flex gap-2"><Button variant="outline" onClick={() => saveProduct(item)}>Guardar</Button><Button variant="ghost" onClick={() => removeProduct(item)}>Retirar</Button></div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input value={item.commercial_title || ""} placeholder="Título comercial opcional" onChange={(event) => updateLocal(item.id, { commercial_title: event.target.value })} />
            <select className="h-9 rounded-md border px-3 text-sm" value={item.price_list || ""} onChange={(event) => updateLocal(item.id, { price_list: event.target.value || null })}>
              <option value="">Lista predeterminada</option>
              {settings.price_list_options.map((priceList) => <option key={priceList.id} value={priceList.id}>{priceList.name}</option>)}
            </select>
            <Input type="number" min="0" value={item.position} onChange={(event) => updateLocal(item.id, { position: event.target.value })} />
          </div>
          <textarea className="min-h-20 w-full rounded-md border p-3 text-sm" value={item.commercial_description || ""} placeholder="Descripción comercial opcional" onChange={(event) => updateLocal(item.id, { commercial_description: event.target.value })} />
          <div className="flex flex-wrap gap-5 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" disabled={!hasPermission("publish.website")} checked={item.is_published} onChange={(event) => updateLocal(item.id, { is_published: event.target.checked })} />Publicado</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={item.is_featured} onChange={(event) => updateLocal(item.id, { is_featured: event.target.checked })} />Destacado</label>
          </div>
        </article>)}
      </section>
      {message ? <p className="text-green-700">{message}</p> : null}
      {error ? <p className="text-red-600">{error}</p> : null}
    </div>
  );
}
