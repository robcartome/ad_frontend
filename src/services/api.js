
import { parseApiError } from "./errors/parseError";
import { TOKEN_KEY, refreshAccessToken } from "@/services/authService";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function getStoredAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

async function buildAuthHeaders() {
  if (typeof window === "undefined") return {};

  let token = getStoredAccessToken();
  if (!token) return {};

  // Check expiry and refresh if needed
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      token = await refreshAccessToken();
      if (!token) return {};
    }
  } catch {
    // Ignore decode errors
  }

  return { Authorization: `Bearer ${token}` };
}

async function buildHeaders(options = {}) {
  const headers = {
    Accept: "application/json",
    ...(await buildAuthHeaders()),
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

export async function apiFetch(endpoint, options = {}) {
  const config = {
    ...options,
    headers: await buildHeaders(options),
  };

  try {
    const res = await fetch(`${API_URL}${endpoint}`, config);

    if (!res.ok) {
      const errorData = await safeJson(res);
      const msg = parseApiError(errorData);
      throw new Error(msg);
    }

    return await safeJson(res);
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
}

export async function apiFetchBlob(endpoint, options = {}) {
  const config = {
    ...options,
    headers: await buildHeaders({ ...options, headers: { Accept: "application/pdf", ...(options.headers || {}) } }),
  };

  try {
    const res = await fetch(`${API_URL}${endpoint}`, config);

    if (!res.ok) {
      const errorData = await safeJson(res);
      const msg = parseApiError(errorData);
      throw new Error(msg);
    }

    const blob = await res.blob();
    const disposition = res.headers.get("content-disposition") || "";
    const filenameMatch = disposition.match(/filename=\"?([^\"]+)\"?/i);

    return {
      blob,
      filename: filenameMatch?.[1] || "documento.pdf",
    };
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}