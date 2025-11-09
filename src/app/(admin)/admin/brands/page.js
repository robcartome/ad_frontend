"use client";

import { useEffect, useState } from "react";
import { getBrands } from "@/services/brandsService";
import BrandsTable from "@/components/admin/BrandsTable";


export default function CategoriesPage() {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    getBrands().then(setBrands);
  }, []);

  return (
    <div className="p-6">
        <BrandsTable Brands={brands} setBrands={setBrands} />
    </div>
  );
}
