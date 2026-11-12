"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/AuthContext";
import {
  createWebsiteMenu,
  getWebsiteMenus,
  getWebsitePages,
  publishWebsiteMenu,
  replaceWebsiteMenuItems,
} from "@/services/websiteService";

function itemReference(item) {
  return item.id || item.clientRef || crypto.randomUUID();
}

function flattenItems(items) {
  const roots = items.filter((item) => !item.parent_id);
  const result = [];

  roots.forEach((root) => {
    const rootRef = itemReference(root);
    result.push({ ...root, clientRef: rootRef, parentRef: null });
    items
      .filter((item) => item.parent_id === root.id)
      .forEach((child) =>
        result.push({
          ...child,
          clientRef: itemReference(child),
          parentRef: rootRef,
        }),
      );
  });

  return result;
}

function orderedItems(items) {
  const roots = items.filter((item) => !item.parentRef);
  return roots.flatMap((root) => [
    root,
    ...items.filter((item) => item.parentRef === root.clientRef),
  ]);
}

export default function WebsiteMenusPage() {
  const { hasPermission } = useAuth();
  const [menus, setMenus] = useState([]);
  const [pages, setPages] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const current = menus.find((menu) => menu.id === selectedId);
  const displayedItems = orderedItems(items);

  const load = () =>
    Promise.all([getWebsiteMenus(), getWebsitePages()])
      .then(([menuData, pageData]) => {
        const menuList = Array.isArray(menuData)
          ? menuData
          : menuData.results || [];
        setMenus(menuList);
        setPages(Array.isArray(pageData) ? pageData : pageData.results || []);
        const id = selectedId || menuList[0]?.id || "";
        setSelectedId(id);
        const menu = menuList.find((entry) => entry.id === id);
        setItems(menu ? flattenItems(menu.items) : []);
      })
      .catch((err) => setError(err.message));

  useEffect(() => {
    load();
    // Initial load intentionally keeps the first selected menu stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function choose(id) {
    setSelectedId(id);
    setItems(flattenItems(menus.find((menu) => menu.id === id)?.items || []));
  }

  function update(clientRef, changes) {
    setItems((list) =>
      list.map((item) =>
        item.clientRef === clientRef ? { ...item, ...changes } : item,
      ),
    );
  }

  function move(clientRef, direction) {
    setItems((list) => {
      const next = [...list];
      const index = next.findIndex((item) => item.clientRef === clientRef);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function add() {
    setItems((list) => [
      ...list,
      {
        clientRef: crypto.randomUUID(),
        parentRef: null,
        label: "Nuevo enlace",
        target_type: "PAGE",
        page_id: pages[0]?.id || null,
        url: "",
        enabled: true,
        open_in_new_tab: false,
      },
    ]);
  }

  function remove(clientRef) {
    setItems((list) =>
      list
        .filter((item) => item.clientRef !== clientRef)
        .map((item) =>
          item.parentRef === clientRef ? { ...item, parentRef: null } : item,
        ),
    );
  }

  async function ensureMenus() {
    for (const [name, location] of [
      ["Navegación principal", "HEADER"],
      ["Pie de página", "FOOTER"],
    ]) {
      if (!menus.some((menu) => menu.location === location)) {
        await createWebsiteMenu({ name, location, enabled: true });
      }
    }
    load();
  }

  async function save() {
    if (!current) return;

    const ordered = orderedItems(items);
    const indexByReference = new Map(
      ordered.map((item, index) => [item.clientRef, index]),
    );
    const counters = new Map();
    const payload = ordered.map((item) => {
      const parentIndex = item.parentRef
        ? indexByReference.get(item.parentRef)
        : null;
      const counterKey = parentIndex ?? "root";
      const position = counters.get(counterKey) || 0;
      counters.set(counterKey, position + 1);

      return {
        parent_index: parentIndex,
        position,
        label: item.label,
        target_type: item.target_type,
        page_id: item.target_type === "PAGE" ? item.page_id : null,
        url: item.target_type === "URL" ? item.url : "",
        enabled: item.enabled,
        open_in_new_tab: item.open_in_new_tab,
      };
    });

    try {
      const saved = await replaceWebsiteMenuItems(
        current.id,
        current.draft_version,
        payload,
      );
      setMenus((list) =>
        list.map((menu) => (menu.id === saved.id ? saved : menu)),
      );
      setItems(flattenItems(saved.items));
      setMessage("Borrador del menú guardado.");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function publish() {
    try {
      const saved = await publishWebsiteMenu(
        current.id,
        current.draft_version,
      );
      setMenus((list) =>
        list.map((menu) => (menu.id === saved.id ? saved : menu)),
      );
      setMessage("Menú publicado.");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  if (!menus.length) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Menús</h1>
        <p>No hay menús configurados.</p>
        <Button onClick={ensureMenus}>Crear menús iniciales</Button>
        {error ? <p className="text-red-600">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Menús</h1>
          <p className="text-sm text-slate-500">
            La navegación pública usa únicamente la última versión publicada.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={add}>
            Agregar enlace
          </Button>
          <Button variant="outline" onClick={save}>
            Guardar borrador
          </Button>
          {hasPermission("publish.website") ? (
            <Button onClick={publish}>Publicar</Button>
          ) : null}
        </div>
      </div>

      <div className="flex gap-2">
        {menus.map((menu) => (
          <Button
            key={menu.id}
            variant={menu.id === selectedId ? "default" : "outline"}
            onClick={() => choose(menu.id)}
          >
            {menu.name}
          </Button>
        ))}
      </div>

      <p className="text-xs text-slate-500">
        Borrador v{current?.draft_version} · Publicado v
        {current?.published_version}
      </p>

      {displayedItems.map((item, index) => (
        <article
          className="grid gap-3 rounded-xl border bg-white p-4 lg:grid-cols-[1fr_150px_1fr_180px_auto]"
          key={item.clientRef}
        >
          <Input
            value={item.label}
            onChange={(event) =>
              update(item.clientRef, { label: event.target.value })
            }
          />
          <select
            className="h-9 rounded-md border px-3 text-sm"
            value={item.target_type}
            onChange={(event) =>
              update(item.clientRef, { target_type: event.target.value })
            }
          >
            <option value="PAGE">Página</option>
            <option value="URL">URL</option>
          </select>
          {item.target_type === "PAGE" ? (
            <select
              className="h-9 rounded-md border px-3 text-sm"
              value={item.page_id || ""}
              onChange={(event) =>
                update(item.clientRef, { page_id: event.target.value })
              }
            >
              {pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.title}
                </option>
              ))}
            </select>
          ) : (
            <Input
              value={item.url || ""}
              placeholder="/ruta o https://"
              onChange={(event) =>
                update(item.clientRef, { url: event.target.value })
              }
            />
          )}
          <select
            className="h-9 rounded-md border px-3 text-sm"
            value={item.parentRef || ""}
            onChange={(event) =>
              update(item.clientRef, {
                parentRef: event.target.value || null,
              })
            }
          >
            <option value="">Nivel principal</option>
            {items
              .filter(
                (candidate) =>
                  !candidate.parentRef && candidate.clientRef !== item.clientRef,
              )
              .map((candidate) => (
                <option key={candidate.clientRef} value={candidate.clientRef}>
                  Dentro de {candidate.label}
                </option>
              ))}
          </select>
          <div className="flex gap-1">
            <Button
              size="icon-sm"
              variant="ghost"
              disabled={!index}
              onClick={() => move(item.clientRef, -1)}
              aria-label={`Subir ${item.label}`}
            >
              <ArrowUp />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              disabled={index === displayedItems.length - 1}
              onClick={() => move(item.clientRef, 1)}
              aria-label={`Bajar ${item.label}`}
            >
              <ArrowDown />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => remove(item.clientRef)}
              aria-label={`Eliminar ${item.label}`}
            >
              <Trash2 />
            </Button>
          </div>
        </article>
      ))}

      {message ? <p className="text-green-700">{message}</p> : null}
      {error ? <p className="text-red-600">{error}</p> : null}
    </div>
  );
}
