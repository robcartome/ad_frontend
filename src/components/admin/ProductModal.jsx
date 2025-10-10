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

export default function ProductModal({ open, onClose, onSave, product }) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    unit: "",
    price_purchase: "",
    active: true,
  });

  // 🔁 Cuando se edita un producto, se carga su data
  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: "",
        sku: "",
        unit: "",
        price_purchase: "",
        active: true,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.sku) return;
    onSave(formData);
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
          <div>
            <Label>Nombre</Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Codo 32mm"
            />
          </div>

          <div>
            <Label>SKU</Label>
            <Input
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="Ej: RI01001"
            />
          </div>

          <div>
            <Label>Unidad</Label>
            <Input
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="Ej: und"
            />
          </div>

          <div>
            <Label>Precio Compra</Label>
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
