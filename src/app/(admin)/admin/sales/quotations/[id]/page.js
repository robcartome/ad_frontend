"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import QuotationForm from "@/components/admin/sales/QuotationForm";
import { getQuotation } from "@/services/salesService";

export default function QuotationDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const requestedMode = searchParams.get("mode");

  useEffect(() => {
    if (!id) return;
    getQuotation(id)
      .then(setData)
      .catch((err) => toast.error("No se pudo cargar la cotización: " + err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 size={24} className="animate-spin mr-2" />
        Cargando cotización...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">
        Cotización no encontrada.
      </div>
    );
  }

  const mode = requestedMode === "edit" && data?.status === "DRAFT" ? "edit" : "view";
  return <QuotationForm initialData={data} mode={mode} />;
}
