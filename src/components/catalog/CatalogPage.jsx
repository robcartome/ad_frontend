"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getCatalogProducts, getCatalogProductsPrivate } from "@/services/productsService";
import { ArrowUpCircle } from "lucide-react";

import { useAuth } from "@/lib/AuthContext";
import AuthGuard from "@/components/auth/AuthGuard";
import ProductCard from "@/components/admin/ProductCard";
import ProductDetailModal from "@/components/admin/ProductDetailModal";
import { isRequestCancellation } from '@/services/http/jsonRequest.mjs';

export default function CatalogPage({isAdmin = false}) {
  const { user, selectedCompany, selectedStore } = useAuth();
  const scope = JSON.stringify([user?.id, selectedCompany?.company_id, selectedStore?.store_id, isAdmin]);
  return <AuthGuard><CatalogWorkspace key={scope} isAdmin={isAdmin}/></AuthGuard>;
}

function CatalogWorkspace({isAdmin}) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // INFINITE SCROLL
  const [pagination, setPagination] = useState({ search: "", page: 1 });
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);

  const [selectedProduct, setSelectedProduct] = useState(null);

  // ---------------------------
  // 🔍 Debounced Search (para que no pegue 100 renders)
  // ---------------------------
  function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      const t = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(t);
    }, [value]);
    return debounced;
  }

  const debouncedSearch = useDebounce(search);

  const page = pagination.search === debouncedSearch ? pagination.page : 1;
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    inFlight.current = true;
    setLoading(true);
    setError("");
    if (page === 1) { setProducts([]); setSelectedProduct(null); }
    const load = isAdmin ? getCatalogProductsPrivate : getCatalogProducts;
    load(page, 50, debouncedSearch, { signal: controller.signal }).then(res => {
      if (!active || controller.signal.aborted) return;
      const rows = res.results.map(product => ({ ...product, brand: product.brand || 'Sin marca', category: product.category || 'Sin categoria', sku: product.sku || '', name: product.name || '' }));
      setProducts(previous => page === 1 ? rows : [...previous, ...rows]);
      setHasMore(res.offset + rows.length < res.total);
    }).catch(cause => {
      if (!active || isRequestCancellation(cause, controller.signal)) return;
      setProducts([]);
      setHasMore(false);
      setSelectedProduct(null);
      setError(cause.status === 401 ? 'Tu sesion caduco. Inicia sesion nuevamente.' : cause.status === 403 ? 'No tienes permiso para este catalogo o contexto de empresa.' : cause.message);
    }).finally(() => {
      if (active) { inFlight.current = false; setLoading(false); }
    });
    return () => { active = false; controller.abort(); };
  }, [page, debouncedSearch, isAdmin]);

  const lastItemRef = useCallback(
    (node) => {
      if (loading || inFlight.current) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !inFlight.current) {
          inFlight.current = true;
          setPagination({ search: debouncedSearch, page: page + 1 });
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, page, debouncedSearch]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;
      const matchesBrand =
        brandFilter === "all" || product.brand === brandFilter;
      return matchesCategory && matchesBrand;
    });
  }, [products, categoryFilter, brandFilter]);

  const categories = useMemo(
    () => ["all", ...new Set(products.map((p) => p.category))],
    [products]
  );
  const brands = useMemo(
    () => ["all", ...new Set(products.map((p) => p.brand))],
    [products]
  );

  function ScrollTopButton() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
      const onScroll = () => setVisible(window.scrollY > 250);
      window.addEventListener("scroll", onScroll);
      return () => window.removeEventListener("scroll", onScroll);
    }, []);

    if (!visible) return null;

    return (
      <button
        onClick={() =>
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
        className="
          fixed bottom-4 left-4 z-50
          p-2 rounded-full bg-white border shadow-xl
          hover:shadow-2xl transition-all
        "
      >
        <ArrowUpCircle className="w-8 h-8 text-green-600 drop-shadow-sm" />
      </button>
    );
  }

  return (
    <div className="px-4 sm:px-6 md:px-8 space-y-6">
      {error && <div role="alert" className="rounded border border-red-200 bg-red-50 p-4">{error} <a href="/login" className="underline">Revisar sesion y empresa</a></div>}
      {/* 🔍 Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <h2 className="text-xl font-semibold w-full sm:w-auto text-center">Productos MFT</h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:max-w-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.65 5.65a7.5 7.5 0 0010.6 10.6z"
              />
            </svg>

            <Input
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full pl-10 pr-4 py-2
                rounded-full border border-gray-300
                focus:ring-2 focus:ring-green-500 focus:border-green-500
                transition-all bg-white shadow-sm
              "
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[150px] bg-white">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === "all" ? "Todas" : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="w-full sm:w-[150px] bg-white">
              <SelectValue placeholder="Marca" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand === "all" ? "Todas" : brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredProducts.map((product, idx) => {
          if (idx === filteredProducts.length - 1) {
            return (
              <div key={product.id} ref={lastItemRef}>
                <ProductCard
                  product={product}
                  onClick={() => setSelectedProduct(product.id)}
                  isAdmin={isAdmin}
                />
              </div>
            );
          }

          return (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => setSelectedProduct(product.id)}
              isAdmin={isAdmin}
            />
          );
        })}
      </div>

      {loading && (
        <div className="flex justify-center py-6">
          <Skeleton className="w-32 h-6 rounded-md" />
        </div>
      )}

      {/* 🪟 Modal */}
      {selectedProduct && (
        <ProductDetailModal
          key={selectedProduct}
          productId={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          isAdmin={isAdmin}
        />
      )}

      <ScrollTopButton />
    </div>
  );
}
