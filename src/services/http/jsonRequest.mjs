export function isRequestCancellation(error, signal) {
  return Boolean(signal?.aborted || error?.name === 'AbortError');
}

export async function readJsonResponse(response, signal) {
  try { return await response.json(); }
  catch (error) {
    if (isRequestCancellation(error, signal)) throw error;
    return {};
  }
}

// Keep cancellation observable to callers, without treating effect cleanup as
// an application failure. HTTP/network failures retain their original details.
export async function jsonRequest(url, options, { fetchImpl = fetch, parseError = () => 'No se pudo completar la solicitud.', logError = console.error } = {}) {
  try {
    options.signal?.throwIfAborted();
    const response = await fetchImpl(url, options);
    const data = await readJsonResponse(response, options.signal);
    if (!response.ok) {
      throw Object.assign(new Error(data.message || parseError(data)), { status: response.status, code: data.code || 'API_ERROR', fields: data.fields || {}, etag: response.headers.get('ETag'), retryAfter: response.headers.get('Retry-After') });
    }
    return options.withResponse ? { data, etag: response.headers.get('ETag'), status: response.status } : data;
  } catch (error) {
    if (!isRequestCancellation(error, options.signal)) logError('API Error:', error);
    throw error;
  }
}
