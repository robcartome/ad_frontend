"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import CustomerForm from "@/components/admin/partners/CustomerForm";
import { getPartnerCustomer } from "@/services/partnersService";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getPartnerCustomer(id)
      .then(setCustomer)
      .catch((err) => toast.error("Error al cargar cliente: " + err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center text-gray-400">
        Cliente no encontrado
      </div>
    );
  }

  return <CustomerForm initialData={customer} mode="edit" />;
}
