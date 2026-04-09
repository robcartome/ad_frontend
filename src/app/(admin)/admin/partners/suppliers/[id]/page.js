"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import SupplierForm from "@/components/admin/partners/SupplierForm";
import { getPartnerSupplier } from "@/services/partnersService";

export default function SupplierDetailPage() {
  const { id } = useParams();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getPartnerSupplier(id)
      .then(setSupplier)
      .catch((err) => toast.error("Error al cargar proveedor: " + err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="p-8 text-center text-gray-400">
        Proveedor no encontrado
      </div>
    );
  }

  return <SupplierForm initialData={supplier} mode="edit" />;
}
