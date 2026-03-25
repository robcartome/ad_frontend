
import { parseApiError } from "./errors/parseError";
import { getFakeUserUUID } from "@/utils/fakeAuth";
import { generateFakeJwt } from "@/utils/fakeJwt";


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function apiFetch(endpoint, options = {}) {
  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Si hay UUID fake, agrega Authorization con JWT fake
  let authHeader = {};
  if (typeof window !== "undefined") {
    const uuid = getFakeUserUUID && getFakeUserUUID();
    if (uuid) {
      const jwt = generateFakeJwt(uuid);
      authHeader = { Authorization: `Bearer ${jwt}` };
    }
  }

  const config = {
    ...options,
    headers: { ...defaultHeaders, ...authHeader, ...(options.headers || {}) },
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

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}