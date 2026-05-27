"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  login as apiLogin,
  logout as apiLogout,
  selectCompany as apiSelectCompany,
  getCurrentUser,
  refreshAccessToken,
  getAccessToken,
  getSelectedCompany,
} from "@/services/authService";
import {
  getSelectedStore,
  saveSelectedStore,
  clearSelectedStore,
  getMyAccessibleStores,
} from "@/services/storeAccessService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [accessibleStores, setAccessibleStores] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Decode token claims without verifying (client side, for display only)
  function decodeTokenPayload(token) {
    try {
      const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64));
    } catch {
      return {};
    }
  }

  // Initialize from localStorage on mount
  useEffect(() => {
    async function init() {
      const pathname = typeof window !== "undefined" ? window.location.pathname : "";
      const isPublicCatalog = pathname.startsWith("/catalog");

      // Public catalog now uses the MVP auth/service layer, not legacy authService.
      if (isPublicCatalog) {
        setLoading(false);
        return;
      }

      const token = getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }

      // Check token expiry
      const payload = decodeTokenPayload(token);
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          setLoading(false);
          return;
        }
      }

      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const company = getSelectedCompany();
        if (company) {
          setSelectedCompany(company);
          const scopedToken = getAccessToken();
          const scopedPayload = decodeTokenPayload(scopedToken || "");
          if (!scopedPayload.company_id) {
            try {
              await apiSelectCompany(company.company_id, company.company_name);
            } catch {
              // If re-scope fails, user can still continue and re-select company manually.
            }
          }
        }
        // Restaurar store seleccionada
        const store = getSelectedStore();
        if (store) setSelectedStore(store);
      }
      setLoading(false);
    }

    init();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password);
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setCompanies(data.companies || []);
    return data;
  }, []);

  const selectCompany = useCallback(async (companyId, companyName) => {
    await apiSelectCompany(companyId, companyName);
    setSelectedCompany({ company_id: companyId, company_name: companyName });
    // Al cambiar company, limpiar store anterior
    clearSelectedStore();
    setSelectedStore(null);
    setAccessibleStores([]);
    // Cargar stores accesibles del nuevo company
    try {
      const { store_ids } = await getMyAccessibleStores();
      setAccessibleStores(store_ids || []);
    } catch { /* sin stores asignadas aún */ }
    // Refresh user info with updated token
    const currentUser = await getCurrentUser();
    if (currentUser) setUser(currentUser);
  }, []);

  /**
   * Seleccionar una sucursal.
   * store = { store_id, name, address, ... }
   */
  const selectStore = useCallback((store) => {
    saveSelectedStore(store);
    setSelectedStore(store);
  }, []);

  const clearStore = useCallback(() => {
    clearSelectedStore();
    setSelectedStore(null);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    setSelectedCompany(null);
    setSelectedStore(null);
    setAccessibleStores([]);
    setCompanies([]);
  }, []);

  // Derive roles and permissions from token
  const tokenPayload = getAccessToken() ? decodeTokenPayload(getAccessToken()) : {};
  const roles = tokenPayload.roles || [];
  const permissions = tokenPayload.permissions || [];
  const isSuperuser = tokenPayload.is_superuser || user?.is_superuser || false;

  function hasRole(...requiredRoles) {
    if (isSuperuser) return true;
    return requiredRoles.some((r) => roles.includes(r));
  }

  function hasPermission(permissionCode) {
    if (isSuperuser) return true;
    return permissions.includes(permissionCode);
  }

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        selectedCompany,
        selectedStore,
        accessibleStores,
        companies,
        loading,
        isAuthenticated,
        isSuperuser,
        roles,
        permissions,
        login,
        logout,
        selectCompany,
        selectStore,
        clearStore,
        setCompanies,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
