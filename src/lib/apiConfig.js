const DEFAULT_APUDIG_MVP_API_URL = "http://127.0.0.1:8000/api/v1";

const configuredApiUrl =
  process.env.NEXT_PUBLIC_API_V1_URL || DEFAULT_APUDIG_MVP_API_URL;

export const API_URL = configuredApiUrl.replace(/\/$/, "");
