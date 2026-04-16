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

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
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
        if (company) setSelectedCompany(company);
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
    // Refresh user info with updated token
    const currentUser = await getCurrentUser();
    if (currentUser) setUser(currentUser);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    setSelectedCompany(null);
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
        companies,
        loading,
        isAuthenticated,
        isSuperuser,
        roles,
        permissions,
        login,
        logout,
        selectCompany,
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
