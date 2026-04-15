
import { parseApiError } from "./errors/parseError";
import { getFakeUserUUID } from "@/utils/fakeAuth";
import { generateFakeJwt } from "@/utils/fakeJwt";


export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function getStoredAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }
  const candidates = ["access_token", "auth_token", "token"];
  for (const key of candidates) {
    const token = localStorage.getItem(key);
    if (token) {
      return token;
    }
  }
  return null;
}

async function buildAuthHeaders() {
  if (typeof window === "undefined") {
    return {};
  }

  const accessToken = getStoredAccessToken();
  if (accessToken) {
    return { Authorization: `Bearer ${accessToken}` };
  }

  const uuid = getFakeUserUUID && getFakeUserUUID();
  if (!uuid) {
    return {};
  }

  const companyId = localStorage.getItem("company_id") || undefined;
  const jwt = await generateFakeJwt(uuid, companyId ? { company_id: companyId } : {});
  return { Authorization: `Bearer ${jwt}` };
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