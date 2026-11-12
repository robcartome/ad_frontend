import "server-only";

import { randomUUID } from "node:crypto";

const serverApiUrl = (
  process.env.APUDIG_API_V1_URL ||
  process.env.NEXT_PUBLIC_API_V1_URL ||
  "http://127.0.0.1:8000/api/v1"
).replace(/\/$/, "");

export class ServerApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ServerApiError";
    this.status = status;
  }
}

export async function serverApiFetch(endpoint, options = {}) {
  const requestId = randomUUID();
  const response = await fetch(`${serverApiUrl}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "X-Request-ID": requestId,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new ServerApiError(
      `Django respondiÃ³ ${response.status} para request ${requestId}`,
      response.status,
    );
  }

  return response.json();
}
