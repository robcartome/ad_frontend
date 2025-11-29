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
import { getCatalogProducts } from "@/services/productsService";
import { ArrowUpCircle } from "lucide-react";

import ProductCard from "@/components/admin/ProductCard";
import ProductDetailModal from "@/components/admin/ProductDetailModal";

export default function CatalogPage({isAdmin = false}) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // INFINITE SCROLL
  const [page, setPage] = useState(1);
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

  // ---------------------------
  // 📌 Cargar productos por página (API)
  // ---------------------------
  const loadProducts = useCallback(
    async (reset = false) => {
      setLoading(true);

      const currentPage = reset ? 1 : page;
      const res = await getCatalogProducts(currentPage, 50, debouncedSearch);

      const normalized = res.results.map((p) => ({
        ...p,
        brand: p.brand || "Sin marca",
        category: p.category || "Sin categoría",
        sku: p.sku || "",
        name: p.name || "",
      }));

      if (reset) {
        setProducts(normalized);
      } else {
        setProducts((prev) => [...prev, ...normalized]);
      }

      setHasMore(res.results.length > 0);
      setLoading(false);
    },
    [page, debouncedSearch]
  );

  // ---------------------------
  // 🧨 Ejecutar carga cuando cambia búsqueda
  // ---------------------------
  useEffect(() => {
    setPage(1);
    loadProducts(true);
  }, [debouncedSearch]);

  // ---------------------------
  // 🚀 Infinite Scroll Observer
  // ---------------------------
  const lastItemRef = useCallback(
    (node) => {
      if (loading) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore]
  );

  // ---------------------------
  // 📌 Cargar siguiente página cuando page cambia
  // ---------------------------
  useEffect(() => {
    if (page !== 1) loadProducts(false);
  }, [page]);

  // ---------------------------
  // 🧪 Filtros locales
  // ---------------------------
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
          productId={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          isAdmin={isAdmin}
        />
      )}

      <ScrollTopButton />
    </div>
  );
}
