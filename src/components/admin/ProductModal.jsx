"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { getCategories } from "@/services/categoriesService";
import { getBrands } from "@/services/brandsService";

export default function ProductModal({ open, onClose, onSave, product }) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    unit: "",
    description: "",
    image: "",
    category_id: "",
    price_purchase: "",
    brand_id: "",
    active: true,
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // 🔁 Cargar datos al abrir el modal
  useEffect(() => {
    if (open) {
      loadCategories();
      loadBrands();

      if (product) {
        setFormData({
          name: product.name || "",
          sku: product.sku || "",
          unit: product.unit || "",
          description: product.description || "",
          image: product.image || "",
          category_id: product.category_id || "",
          price_purchase: product.price_purchase || "",
          brand_id: product.brand_id || "",
          active: product.active ?? true,
        });
      } else {
        resetForm();
      }
    }
  }, [open, product]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  const loadBrands = async () => {
    try {
      const data = await getBrands();
      setBrands(data);
    } catch (err) {
      console.error("Error al cargar marcas:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      unit: "",
      description: "",
      image: "",
      category_id: "",
      price_purchase: "",
      brand_id: "",
      active: true,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.sku || !formData.category_id) {
      alert("El nombre, SKU y categoría son obligatorios");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      unit: formData.unit.trim(),
      description: formData.description.trim(),
      image: formData.image.trim(),
      category_id: formData.category_id || null,
      price_purchase: parseFloat(formData.price_purchase) || 0,
      brand_id: formData.brand_id || null,
      active: formData.active,
    };

    onSave(payload);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {product ? "Editar producto" : "Agregar producto"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Nombre */}
          <div>
            <Label>Nombre</Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Codo 32mm"
              required
            />
          </div>

          {/* SKU */}
          <div>
            <Label>SKU</Label>
            <Input
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="Ej: RI01001"
              required
            />
          </div>

          {/* Unidad */}
          <div>
            <Label>Unidad</Label>
            <Input
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="Ej: und"
            />
          </div>

          {/* Descripción */}
          <div>
            <Label>Descripción</Label>
            <Input
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ej: Codo de 32mm HDPE"
            />
          </div>

          {/* Imagen */}
          <div>
            <Label>Imagen (URL opcional)</Label>
            <Input
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          {/* Categoría */}
          <div>
            <Label>Categoría</Label>
            <Select
              value={formData.category_id}
              onValueChange={(v) => handleSelect("category_id", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Marca (opcional) */}
          <div>
            <Label>Marca (opcional)</Label>
            <Select
              value={formData.brand_id || ""}
              onValueChange={(v) => handleSelect("brand_id", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una marca" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Precio de compra */}
          <div>
            <Label>Precio Compra (S/)</Label>
            <Input
              type="number"
              name="price_purchase"
              value={formData.price_purchase}
              onChange={handleChange}
              placeholder="Ej: 10.00"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {product ? "Guardar cambios" : "Agregar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
