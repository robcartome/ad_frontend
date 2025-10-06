"use client";
import { useEffect, useState } from "react";
import { getProducts } from "@/services/productsService";
import ProductCard from "@/components/admin/ProductCard";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then(setProducts).catch(console.error);
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Productos</h1>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
