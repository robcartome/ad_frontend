import { useEffect, useState } from "react";
import { getCategories } from "@/services/categoriesService";
import { getBrands } from "@/services/brandsService";
import { getUnits } from "@/services/unitService";

const EMPTY_FORM = {
  name: "",
  sku: "",
  price_sale: "",
  barcode: "",
  unit_id: "",
  description: "",
  image: "",
  category_id: "",
  price_purchase: "",
  brand_id: "",
  active: true,
};

function toStringValue(value) {
  return value !== null && value !== undefined ? String(value) : "";
}

function normalizeList(list) {
  return list.map((item) => ({
    ...item,
    id: toStringValue(item.id),
  }));
}

export function useProductForm(open, product) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const setField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleChange = (e) =>
    setField(e.target.name, e.target.value);

  const resetAll = () => {
    setFormData(EMPTY_FORM);
    setLoaded(false);
  };

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoaded(false);

      const [u, c, b] = await Promise.all([
        getUnits(),
        getCategories(),
        getBrands(),
      ]);

      // Normalizar IDs a string
      setUnits(normalizeList(u));
      setCategories(normalizeList(c));
      setBrands(normalizeList(b));

      if (product) {
        setFormData({
          ...EMPTY_FORM,
          ...product,
          unit_id: toStringValue(product.unit_id),
          category_id: toStringValue(product.category_id),
          brand_id: toStringValue(product.brand_id),
          barcode: product.barcode || "",
        });
      } else {
        setFormData(EMPTY_FORM);
      }

      setLoaded(true);
    };

    load();
  }, [open, product]);

  return {
    formData,
    setField,
    handleChange,
    categories,
    brands,
    units,
    loaded,
    resetAll,
  };
}
