"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/services/productsService";
import ProductsTable from "@/components/admin/ProductsTable";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  return (
    <div className="p-6">
      <ProductsTable products={products} setProducts={setProducts} />
    </div>
  );
}
