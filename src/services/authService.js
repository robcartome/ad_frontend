/**
 * authService.js — Authentication API calls
 * All auth operations go through here, no JWT required (public endpoints).
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const AUTH_BASE = `${API_URL}/auth`;

// Storage keys
export const TOKEN_KEY = "access_token";
export const REFRESH_KEY = "refresh_token";
export const COMPANY_KEY = "selected_company";

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function getSelectedCompany() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COMPANY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAuthStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(COMPANY_KEY);
}

function saveTokens({ access_token, refresh_token }) {
  localStorage.setItem(TOKEN_KEY, access_token);
  if (refresh_token) {
    localStorage.setItem(REFRESH_KEY, refresh_token);
  }
}

/**
 * Login — returns { access_token, refresh_token, companies[] }
 */
export async function login(email, password) {
  const res = await fetch(`${AUTH_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Credenciales inválidas");
  }

  const data = await res.json();
  // Save initial token (no company_id yet)
  saveTokens({ access_token: data.access_token, refresh_token: data.refresh_token });
  return data;
}

/**
 * Select company — gets a scoped token with company_id + roles + permissions
 */
export async function selectCompany(companyId, companyName) {
  const token = getAccessToken();
  const res = await fetch(`${AUTH_BASE}/select-company`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ company_id: companyId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "No se pudo seleccionar la empresa");
  }

  const data = await res.json();
  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(
    COMPANY_KEY,
    JSON.stringify({ company_id: companyId, company_name: companyName })
  );
  return data;
}

/**
 * Get current user info — requires valid token
 */
export async function getCurrentUser() {
  const token = getAccessToken();
  if (!token) return null;

  const res = await fetch(`${AUTH_BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;
  return res.json();
}

/**
 * Get companies for current user
 */
export async function getMyCompanies() {
  const token = getAccessToken();
  const res = await fetch(`${AUTH_BASE}/my-companies`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("No se pudieron cargar las empresas");
  return res.json();
}

/**
 * Refresh access token using refresh_token
 */
export async function refreshAccessToken() {
  const refresh_token = getRefreshToken();
  if (!refresh_token) return null;

  const res = await fetch(`${AUTH_BASE}/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token }),
  });

  if (!res.ok) {
    clearAuthStorage();
    return null;
  }

  const data = await res.json();
  localStorage.setItem(TOKEN_KEY, data.access_token);

  // Important: refresh returns a generic token; restore selected company scope.
  const selectedCompany = getSelectedCompany();
  if (selectedCompany?.company_id) {
    try {
      const scoped = await fetch(`${AUTH_BASE}/select-company`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.access_token}`,
        },
        body: JSON.stringify({ company_id: selectedCompany.company_id }),
      });
      if (scoped.ok) {
        const scopedData = await scoped.json();
        localStorage.setItem(TOKEN_KEY, scopedData.access_token);
        return scopedData.access_token;
      }
    } catch {
      // Fallback: keep generic token; caller may prompt for company re-selection.
    }
  }

  return data.access_token;
}

/**
 * Logout — revokes refresh token on server
 */
export async function logout() {
  const refresh_token = getRefreshToken();
  if (refresh_token) {
    fetch(`${AUTH_BASE}/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token }),
    }).catch(() => {});
  }
  clearAuthStorage();
}

// ============================================================================
// Admin endpoints
// ============================================================================

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAccessToken()}`,
  };
}

export async function listUsers() {
  const res = await fetch(`${AUTH_BASE}/users`, { headers: authHeaders() });
  if (!res.ok) throw new Error("No se pudieron cargar los usuarios");
  return res.json();
}

export async function listRoles() {
  const res = await fetch(`${AUTH_BASE}/roles`, { headers: authHeaders() });
  if (!res.ok) throw new Error("No se pudieron cargar los roles");
  return res.json();
}

export async function listPermissions() {
  const res = await fetch(`${AUTH_BASE}/permissions`, { headers: authHeaders() });
  if (!res.ok) throw new Error("No se pudieron cargar los permisos");
  return res.json();
}

export async function createRole(name, description = "") {
  const res = await fetch(`${AUTH_BASE}/roles`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "No se pudo crear el rol");
  }
  return res.json();
}

export async function createPermission(code, description = "") {
  const res = await fetch(`${AUTH_BASE}/permissions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ code, description }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "No se pudo crear el permiso");
  }
  return res.json();
}

export async function assignRoleToUser(userId, roleId, companyId) {
  const res = await fetch(`${AUTH_BASE}/roles/assign`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ user_id: userId, role_id: roleId, company_id: companyId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "No se pudo asignar el rol");
  }
}

export async function removeRoleFromUser(userId, roleId, companyId) {
  const res = await fetch(`${AUTH_BASE}/roles/remove`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ user_id: userId, role_id: roleId, company_id: companyId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "No se pudo quitar el rol");
  }
}

export async function registerUser(email, password, name = "", phone = "") {
  const res = await fetch(`${AUTH_BASE}/register`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email, password, name, phone }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "No se pudo registrar el usuario");
  }
  return res.json();
}
