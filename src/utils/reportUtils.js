export const MOVEMENT_TYPE_LABELS = {
  ENTRY: "Entrada",
  EXIT: "Salida",
  ADJUSTMENT: "Ajuste",
  TRANSFER: "Transferencia",
};

export const MOVEMENT_TYPE_OPTIONS = [
  { value: "ENTRY", label: "Entrada" },
  { value: "EXIT", label: "Salida" },
  { value: "TRANSFER", label: "Transferencia" },
  { value: "ADJUSTMENT", label: "Ajuste" },
];

export function getMovementLabel(type) {
  return MOVEMENT_TYPE_LABELS[type] || type;
}

export const PAGE_SIZE = 50;

/** Format a number in Peruvian locale with 2 decimal places. */
export function formatNumber(value, decimals = 2) {
  return Number(value || 0).toLocaleString("es-PE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Format an ISO date/datetime string as a short locale date. */
export function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("es-PE");
}
