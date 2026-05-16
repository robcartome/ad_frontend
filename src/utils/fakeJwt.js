// src/utils/fakeJwt.js
// Genera JWT válido HS256 para desarrollo local.

const DEV_SECRET =
  process.env.NEXT_PUBLIC_JWT_SECRET_KEY || "CHANGE_THIS_SECRET_IN_PRODUCTION";

function base64UrlEncodeString(value) {
  return btoa(value).replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64UrlEncodeJson(obj) {
  return base64UrlEncodeString(JSON.stringify(obj));
}

function arrayBufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return base64UrlEncodeString(binary);
}

async function signHS256(unsignedToken, secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(unsignedToken);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  return arrayBufferToBase64Url(signature);
}

export async function generateFakeJwt(uuid, extraClaims = {}) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: uuid,
    iat: now,
    exp: now + 24 * 3600,
    type: "access",
    ...extraClaims,
  };

  const headerEncoded = base64UrlEncodeJson(header);
  const payloadEncoded = base64UrlEncodeJson(payload);
  const unsignedToken = `${headerEncoded}.${payloadEncoded}`;
  const signature = await signHS256(unsignedToken, DEV_SECRET);
  return `${unsignedToken}.${signature}`;
}
