import { useEffect, useState } from "react";
import { getCategories } from "@/services/categoriesService";
import { getBrands } from "@/services/brandsService";
import { getUnits } from "@/services/unitService";

export function useProductForm(open, product) {
  const emptyForm = {
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

  const [formData, setFormData] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const toStr = (v) => (v !== null && v !== undefined ? String(v) : "");

  const normalizeList = (list) =>
    list.map((item) => ({
      ...item,
      id: toStr(item.id),
    }));

  const setField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleChange = (e) =>
    setField(e.target.name, e.target.value);

  const resetAll = () => {
    setFormData(emptyForm);
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
          ...emptyForm,
          ...product,
          unit_id: toStr(product.unit_id),
          category_id: toStr(product.category_id),
          brand_id: toStr(product.brand_id),
          barcode: product.barcode || "",
        });
      } else {
        setFormData(emptyForm);
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
