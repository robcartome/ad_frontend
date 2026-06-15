"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getProductDetail, getPrivateProductDetail } from "@/services/productsService";

// MEMO CACHE (global en este módulo)
const productDetailCache = {};

function formatPrice(value) {
  if (!value) return "—";
  const n = Number(value);
  return Number.isFinite(n) ? `S/ ${n.toFixed(2)}` : "—";
}

export default function ProductDetailModal({ productId, onClose, isAdmin = false }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  // ================================
  //   Cargar detalle + MEMO CACHE
  // ================================
  const fetchDetail = useCallback(async () => {
    if (!productId) return;

    // 1️⃣ Si existe en cache → úsalo
    if (productDetailCache[productId]) {
      setDetail(productDetailCache[productId]);
      return;
    }

    // 2️⃣ Sino, fetch al backend
    setLoading(true);
    try {
      const data = isAdmin
        ? await getPrivateProductDetail(productId)
        : await getProductDetail(productId);
      productDetailCache[productId] = data; // guardar en cache
      setDetail(data);
    } catch (err) {
      console.error("Error loading detail:", err);
    } finally {
      setLoading(false);
    }
  }, [productId, isAdmin]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (!productId) return null;

  return (
    <Dialog open={!!productId} onOpenChange={onClose}>
      <DialogContent className="w-[95%] max-w-lg md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl font-semibold">
            {detail?.name || "Cargando..."}
          </DialogTitle>
        </DialogHeader>

        {/* ==========================
            LOADING STATE
        ========================== */}
        {!detail || loading ? (
          <div className="space-y-4">
            <Skeleton className="w-full h-40" />
            <Skeleton className="h-4 w-2/4" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ) : (
          <>
            {/* ==========================
                IMAGE + BASIC DATA
            ========================== */}
            <div className="space-y-4 md:flex md:gap-4">
              <img
                src={detail.image || "/placeholder.png"}
                alt={detail.name}
                className="w-full md:w-60 h-40 md:h-48 object-contain border rounded-md bg-white"
              />

              <div className="flex-1 space-y-2 text-sm text-gray-700">
                <p><strong>SKU:</strong> {detail.sku}</p>
                <p><strong>Unidad:</strong> {detail.unit}</p>
                <p><strong>Categoría:</strong> {detail.category}</p>
                <p><strong>Marca:</strong> {detail.brand ?? "—"}</p>
              </div>
            </div>

            {/* ==========================
                PRECIOS
            ========================== */}
            <div className="border-t pt-3 text-sm space-y-1">
              <strong>Precios</strong>
              { isAdmin && (<p><strong>Compra:</strong> {formatPrice(detail.price_purchase)}</p>) }
              <p><strong>Venta:</strong> {formatPrice(detail.price_sale)}</p>

              {detail.price_list?.length > 0 && (
                <div>
                  <strong>Lista de precios:</strong>
                  <ul className="list-disc ml-5 mt-1">
                    {detail.price_list.map((p, i) => (
                      <li key={i}>
                        {p.price_list_name}: {formatPrice(p.amount)} ({p.currency})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* ==========================
                STOCK POR ALMACÉN
            ========================== */}
            {detail.stock_by_warehouse?.length > 0 && (
              <div className="border-t pt-3">
                <strong>Stock por almacén</strong>
                <ul className="list-disc ml-5 text-sm mt-1">
                  {detail.stock_by_warehouse.map((w, i) => (
                    <li key={i}>
                      {w.warehouse_name}: {w.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ==========================
                DESCRIPCIÓN
            ========================== */}
            {detail.description && (
              <div className="border-t pt-3">
                <strong>Descripción:</strong>
                <p className="text-sm text-gray-700 mt-1">
                  {detail.description}
                </p>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
