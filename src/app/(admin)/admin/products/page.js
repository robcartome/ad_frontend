"use client";
import { useEffect, useState } from "react";
import { getProducts } from "@/services/productsService";
import ProductsTable from "@/components/admin/ProductsTable";

export default function ProductsPage() {
  const [productsData, setProductsData] = useState({
    total: 0,
    count: 0,
    limit: 5,
    offset: 0,
    results: [],
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getProducts(page, productsData.limit, search)
      .then(setProductsData)
      .catch(console.error);
  }, [page, search, productsData.limit]);

  return (
    <div className="p-6">
      <ProductsTable
        products={productsData.results}
        total={productsData.total}
        count={productsData.count}
        page={page}
        setPage={setPage}
        limit={productsData.limit}
        search={search}
        setSearch={setSearch}
        setProducts={setProductsData}
      />
    </div>
  );
}
