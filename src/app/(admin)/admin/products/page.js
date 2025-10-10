"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/services/productsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Productos</h2>
        <Button onClick={() => alert("Nuevo producto próximamente")}>
          Nuevo producto
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition">
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">SKU: {product.sku}</p>
              <p className="text-sm text-gray-600 mb-2">
                Unidad: {product.unit}
              </p>
              <p className="font-medium text-gray-800">
                Precio compra: S/ {product.price_purchase}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
