"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

/**
 * AuthGuard — wraps protected content.
 * Redirects to /login if not authenticated or no company selected.
 */
export default function AuthGuard({ children, requireCompany = true }) {
  const { isAuthenticated, selectedCompany, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (requireCompany && !selectedCompany) {
      router.replace("/login");
    }
  }, [isAuthenticated, selectedCompany, loading, requireCompany, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (requireCompany && !selectedCompany)) {
    return null;
  }

  return children;
}
