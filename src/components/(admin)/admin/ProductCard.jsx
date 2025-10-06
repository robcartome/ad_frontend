"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProductCard({ product }) {
  console.log(product);
  return (
    <Card className="hover:shadow-md transition">
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-32 object-cover rounded mb-2"
        />
        <p className="text-sm text-gray-500">SKU: {product.sku}</p>
        <p className="text-sm font-medium text-gray-700">
          Precio: S/ {product.price_purchase}
        </p>
      </CardContent>
    </Card>
  );
}
