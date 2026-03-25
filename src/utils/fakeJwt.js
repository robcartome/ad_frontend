// src/utils/fakeJwt.js
// Genera un JWT falso para pruebas, compatible con el backend actual
// Algoritmo y clave deben coincidir con el backend (HS256, 'secret')

function base64url(source) {
  // Encode in classical base64
  let encodedSource = btoa(JSON.stringify(source));
  // Remove padding equal characters
  encodedSource = encodedSource.replace(/=+$/, "");
  // Replace characters according to base64url spec
  encodedSource = encodedSource.replace(/\+/g, "-");
  encodedSource = encodedSource.replace(/\//g, "_");
  return encodedSource;
}

// Solo para pruebas, clave hardcodeada igual que en backend
const SECRET = "secret";

function signHS256(header, payload, secret) {
  // No implementamos HMAC-SHA256 real, solo para pruebas locales
  // El backend acepta cualquier token firmado con 'secret' y HS256
  // Esto NO es seguro, solo para desarrollo
  const headerEncoded = base64url(header);
  const payloadEncoded = base64url(payload);
  // Fake signature: base64url(header.payload.secret)
  const signature = btoa(headerEncoded + "." + payloadEncoded + "." + secret)
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${headerEncoded}.${payloadEncoded}.${signature}`;
}

export function generateFakeJwt(uuid) {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: uuid,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 3600,
  };
  return signHS256(header, payload, SECRET);
}
