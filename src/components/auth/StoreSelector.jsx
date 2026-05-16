"use client";

/**
 * StoreSelector — Modal/Panel para seleccionar la sucursal de trabajo.
 *
 * Se muestra después de seleccionar la company, listando solo las
 * sucursales a las que el usuario tiene acceso.
 *
 * - Admin/Superadmin: ve todas las stores del company.
 * - Usuario normal: solo sus stores asignadas.
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { getMyStoresDetail } from "@/services/storeAccessService";

export default function StoreSelector({ onSelected }) {
  const { selectedStore, selectStore, hasRole, isSuperuser } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getMyStoresDetail();
        setStores(data);
      } catch (e) {
        setError("No se pudieron cargar las sucursales.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleSelect(store) {
    selectStore(store);
    if (onSelected) onSelected(store);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-red-600 text-sm">{error}</div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm">
        No tienes sucursales asignadas. Contacta a tu administrador.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-2">
        {isSuperuser || hasRole("ADMIN")
          ? "Tienes acceso a todas las sucursales de la empresa."
          : "Selecciona la sucursal en la que trabajarás:"}
      </p>

      {stores.map((store) => {
        const isActive = selectedStore?.store_id === store.store_id || selectedStore?.id === store.id;
        return (
          <button
            key={store.id || store.store_id}
            onClick={() => handleSelect(store)}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
              isActive
                ? "border-blue-600 bg-blue-50 ring-2 ring-blue-400"
                : "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50"
            }`}
          >
            <p className="font-semibold text-gray-800 text-sm">{store.name}</p>
            {store.address && (
              <p className="text-xs text-gray-500 mt-0.5">{store.address}</p>
            )}
          </button>
        );
      })}
    </div>
  );
}
