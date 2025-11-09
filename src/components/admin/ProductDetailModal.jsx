"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function formatPrice(value) {
  if (value === undefined || value === null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : null;
}

export default function ProductDetailModal({ product, onClose }) {
  if (!product) return null;

  const stockEntries = Object.entries(product.stock ?? {});

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <img
            src={product.image || "/placeholder.png"}
            alt={product.name}
            className="w-full h-40 object-contain rounded-md"
          />

          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>SKU:</strong> {product.sku ?? "—"}</p>
            <p><strong>Unidad:</strong> {product.unit ?? "—"}</p>
            <p><strong>Categoría:</strong> {product.category ?? "—"}</p>
            <p><strong>Marca:</strong> {product.brand ?? "—"}</p>
          </div>

          <div className="border-t pt-2 text-sm space-y-1">
            <p>
              <strong>Precio de compra:</strong>{" "}
              {formatPrice(product.purchase_price)
                ? `S/ ${formatPrice(product.purchase_price)}`
                : "—"}
            </p>
            <p>
              <strong>Precio menor:</strong>{" "}
              {formatPrice(product.prices?.menor)
                ? `S/ ${formatPrice(product.prices.menor)}`
                : "—"}
            </p>
            <p>
              <strong>Precio mayor:</strong>{" "}
              {formatPrice(product.prices?.mayor)
                ? `S/ ${formatPrice(product.prices.mayor)}`
                : "—"}
            </p>
            <p>
              <strong>Distribución:</strong>{" "}
              {formatPrice(product.prices?.distribucion)
                ? `S/ ${formatPrice(product.prices.distribucion)}`
                : "—"}
            </p>
          </div>

          {stockEntries.length > 0 && (
            <div className="border-t pt-3">
              <strong>Stock por almacén:</strong>
              <ul className="list-disc ml-5 mt-1 text-sm">
                {stockEntries.map(([warehouse, stock]) => (
                  <li key={warehouse}>
                    {warehouse}: {Number(stock) || 0}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.description && (
            <div className="border-t pt-3">
              <strong>Descripción:</strong>
              <p className="text-sm text-gray-700 mt-1">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
