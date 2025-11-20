"use client";

import { PlusCircle } from "lucide-react";

/** Reusar la misma función helper */
function formatPrice(value) {
  if (value === undefined || value === null) return null;
  const cleaned = String(value).replace(/[^\d.-]/g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n.toFixed(2) : null;
}

export default function ProductCard({ product, onClick }) {
  return (
    <div
      onClick={onClick}
      className="w-full rounded-xl border p-3 flex items-center gap-3 bg-white shadow-sm hover:shadow-md transition cursor-pointer"
    >
      <img
        src={product.image || "/placeholder.png"}
        alt={product.name}
        className="w-16 h-16 object-contain rounded-md flex-shrink-0"
      />
      <div className="flex flex-col flex-1 min-w-0">
        <p className="font-medium text-sm leading-tight truncate">{product.name}</p>
        <div className="text-xs text-gray-500 flex flex-wrap gap-x-2">
          <span>Stock: {product.stock}</span>
          <span>Unidad: {product.unit}</span>
          <span>SKU: {product.sku}</span>
        </div>
        <div className="flex flex-wrap gap-x-2">
          {/* <span className="text-green-600 font-semibold text-sm mt-1">
            P.C. {formatPrice(product.price_sale) ? `S/ ${formatPrice(product.price_sale)}` : "S/ 0.00"}
          </span> */}
          <span className="text-green-600 font-semibold text-sm mt-1">
            P.V. {formatPrice(product.price_sale) ? `S/ ${formatPrice(product.price_sale)}` : "S/ 0.00"}
          </span>
        </div>

      </div>

      <PlusCircle className="text-green-600 w-6 h-6 flex-shrink-0" />
    </div>
  );
}
