import { ServerApiError } from "@/lib/api/serverClient";
import { normalizeHost } from "@/lib/tenant/normalizeHost";
import { quoteStorefrontCart } from "@/services/storefrontService";

export async function POST(request) {
  const hostname = normalizeHost(request.headers.get("host"));
  if (!hostname) {
    return Response.json({ detail: "Dominio de tienda inválido." }, { status: 400 });
  }
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.lines)) {
    return Response.json({ detail: "Carrito inválido." }, { status: 400 });
  }

  try {
    const quote = await quoteStorefrontCart(
      hostname,
      body.lines,
      request.headers.get("x-forwarded-for") || "",
    );
    return Response.json(quote, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ServerApiError) {
      const detail = error.status === 429
        ? "Se alcanzó el límite de cotizaciones. Inténtalo nuevamente en un minuto."
        : "No pudimos validar el carrito.";
      return Response.json({ detail }, { status: error.status });
    }
    return Response.json({ detail: "No pudimos validar el carrito." }, { status: 502 });
  }
}
