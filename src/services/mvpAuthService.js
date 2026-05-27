/**
 * mvpAuthService.js — Authentication against apudig_mvp (Django backend).
 *
 * Completely separate from authService.js which handles ad_backend (FastAPI).
 */

import { MVP_API_URL, saveMvpTokens, clearMvpTokens } from "./mvpApi";

export const MVP_COMPANY_KEY = "mvp_company";

export function getMvpCompany() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MVP_COMPANY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearMvpAuth() {
  clearMvpTokens();
  if (typeof window !== "undefined") {
    localStorage.removeItem(MVP_COMPANY_KEY);
  }
}

/**
 * Login against apudig_mvp.
 * Returns { access_token, refresh_token, user, company }
 */
export async function mvpLogin(email, password) {
  const res = await fetch(`${MVP_API_URL}/api/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Credenciales incorrectas.");
  }

  const data = await res.json();
  saveMvpTokens({ access_token: data.access_token, refresh_token: data.refresh_token });

  if (data.company) {
    localStorage.setItem(MVP_COMPANY_KEY, JSON.stringify(data.company));
  }

  return data;
}

export function mvpLogout() {
  clearMvpAuth();
}
