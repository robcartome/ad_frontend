/**
 * mvpApi.js — Base fetch layer for apudig_mvp (Django) backend.
 *
 * This is completely separate from api.js (which points to ad_backend / FastAPI).
 * Use mvpAuthService for login and token management against apudig_mvp.
 */

export const MVP_API_URL =
  process.env.NEXT_PUBLIC_MVP_API_URL || "http://localhost:8000";

const MVP_TOKEN_KEY = "mvp_access_token";
const MVP_REFRESH_KEY = "mvp_refresh_token";

// ── Token storage ────────────────────────────────────────────────────────────

export function getMvpAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(MVP_TOKEN_KEY);
}

export function getMvpRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(MVP_REFRESH_KEY);
}

export function saveMvpTokens({ access_token, refresh_token }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MVP_TOKEN_KEY, access_token);
  if (refresh_token) localStorage.setItem(MVP_REFRESH_KEY, refresh_token);
}

export function clearMvpTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(MVP_TOKEN_KEY);
  localStorage.removeItem(MVP_REFRESH_KEY);
}

// ── Token refresh ────────────────────────────────────────────────────────────

async function _refreshMvpToken() {
  const refresh = getMvpRefreshToken();
  if (!refresh) return null;

  const res = await fetch(`${MVP_API_URL}/api/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
  });

  if (!res.ok) {
    clearMvpTokens();
    return null;
  }

  const data = await res.json();
  localStorage.setItem(MVP_TOKEN_KEY, data.access_token);
  return data.access_token;
}

function _isTokenExpired(token) {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    const now = Math.floor(Date.now() / 1000);
    return payload.exp && payload.exp < now;
  } catch {
    return true;
  }
}

async function _getValidToken() {
  let token = getMvpAccessToken();
  if (!token) return null;
  if (_isTokenExpired(token)) {
    token = await _refreshMvpToken();
  }
  return token;
}

// ── Core fetch ───────────────────────────────────────────────────────────────

/**
 * Fetch against apudig_mvp.
 * If a valid MVP token exists it is sent as Bearer; otherwise the request is
 * made anonymously (public catalog access).
 */
export async function mvpFetch(endpoint, options = {}) {
  const token = await _getValidToken();

  const headers = {
    Accept: "application/json",
    ...options.headers,
  };

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${MVP_API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      detail = err.detail || err.message || detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }

  try {
    return await res.json();
  } catch {
    return {};
  }
}
