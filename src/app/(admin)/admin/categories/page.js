"use client";

import { useEffect, useState } from "react";
import { getCategories } from "@/services/categoriesService";
import CategoriesTable from "@/components/admin/CategoriesTable";


export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  return (
    <div className="p-6">
        <CategoriesTable categories={categories} setCategories={setCategories} />
    </div>
  );
}
