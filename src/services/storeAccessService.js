/**
 * storeAccessService.js — Gestión de acceso por sucursal (store)
 *
 * Maneja:
 * - Recuperar las stores accesibles del usuario autenticado
 * - Persistir la store seleccionada en localStorage
 * - Asignar/remover usuarios de stores (solo admins)
 */

import { API_URL, getAccessToken } from "./authService";

const BASE = `${API_URL}/auth/store-access`;

// ── Storage ────────────────────────────────────────────────────────────────

export const STORE_KEY = "selected_store";

export function getSelectedStore() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSelectedStore(store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function clearSelectedStore() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORE_KEY);
}

// ── Headers helpers ────────────────────────────────────────────────────────

function authHeaders() {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── API calls ──────────────────────────────────────────────────────────────

/**
 * Retorna las stores accesibles para el usuario autenticado.
 * El backend resuelve si es admin (todas las stores del company)
 * o usuario normal (solo sus stores asignadas).
 *
 * @returns {Promise<{ store_ids: string[] }>}
 */
export async function getMyAccessibleStores() {
  const res = await fetch(`${BASE}/stores/me`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error obteniendo sucursales accesibles");
  return res.json();
}

/**
 * Obtiene el detalle completo de las stores accesibles.
 * Útil para mostrar nombre y dirección en la UI de selección.
 *
 * @returns {Promise<Store[]>}
 */
export async function getMyStoresDetail() {
  // 1. Obtener IDs permitidos
  const { store_ids } = await getMyAccessibleStores();
  if (!store_ids || store_ids.length === 0) return [];

  // 2. Obtener detalle de cada store
  // Si el backend tuviera un endpoint batch lo usaríamos; por ahora
  // hacemos las llamadas individuales (tipicamente pocas stores).
  const details = await Promise.all(
    store_ids.map((id) =>
      fetch(`${API_URL}/stores/${id}`, { headers: authHeaders() })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)
    )
  );
  return details.filter(Boolean);
}

/**
 * Asigna un usuario a una sucursal (solo admins).
 */
export async function assignUserToStore(storeId, userId, role = "SELLER") {
  const res = await fetch(`${BASE}/stores/${storeId}/users`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ user_id: userId, role }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Error asignando usuario a sucursal");
  }
  return res.json();
}

/**
 * Quita el acceso de un usuario a una sucursal (solo admins).
 */
export async function removeUserFromStore(storeId, userId) {
  const res = await fetch(`${BASE}/stores/${storeId}/users/${userId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Error removiendo usuario de sucursal");
  }
}

/**
 * Lista los usuarios con acceso a una sucursal (admins/store admins).
 */
export async function getUsersInStore(storeId) {
  const res = await fetch(`${BASE}/stores/${storeId}/users`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error listando usuarios de sucursal");
  return res.json();
}

/**
 * Lista las stores asignadas a un usuario específico.
 */
export async function getStoresForUser(userId) {
  const res = await fetch(`${BASE}/users/${userId}/stores`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error obteniendo stores del usuario");
  return res.json();
}
