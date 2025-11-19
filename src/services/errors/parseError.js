export function parseApiError(errorData) {
  if (!errorData) return "Error desconocido del servidor.";

  if (Array.isArray(errorData?.detail)) {
    return errorData.detail
      .map((err) => {
        const loc = err.loc?.slice(1) || [];
        const field = loc
          .map((p) => (typeof p === "number" ? `ítem ${p + 1}` : p))
          .join(" → ");
        return `${field}: ${translateMsg(err.msg)}`;
      })
      .join("\n");
  }

  if (typeof errorData.detail === "string") {
    return translateServerMsg(errorData.detail);
  }

  return "Error inesperado en el servidor.";
}

function translateMsg(msg) {
  if (msg.includes("field required")) return "Campo obligatorio.";
  if (msg.includes("valid UUID")) return "Debe ser un UUID válido.";
  return msg;
}

function translateServerMsg(message) {
  if (message.includes("llave duplicada")) return "Registro duplicado.";
  if (message.includes("foreign key")) return "Referencia no encontrada.";
  if (message.includes("uuid")) return "UUID inválido.";
  return message;
}
