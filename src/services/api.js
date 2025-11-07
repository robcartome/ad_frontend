const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function apiFetch(endpoint, options = {}) {
  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const config = {
    ...options,
    headers: { ...defaultHeaders, ...(options.headers || {}) },
  };

  try {
    const res = await fetch(`${API_URL}${endpoint}`, config);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || res.statusText);
    }
    return await res.json();
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
}
