"use client";

import { useProductForm } from "./useProductForm";
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

export default function ProductModal({ open, onClose, onSave, product }) {
  const {
    formData,
    setField,
    handleChange,
    categories,
    brands,
    units,
    loaded,
    resetAll,
  } = useProductForm(open, product);

  const handleSave = () => {
    if (!formData.name || !formData.sku || !formData.barcode || !formData.category_id) {
      alert("El nombre, SKU y categoría son obligatorios");
      return;
    }

    onSave({
      ...formData,
      brand_id: formData.brand_id || null,
      price_purchase: parseFloat(formData.price_purchase) || 0,
      price_sale: parseFloat(formData.price_sale) || 0,
    });

    resetAll();
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

        {!loaded ? (
          <div className="py-6 text-center text-gray-500">Cargando...</div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Nombre */}
            <div>
              <Label>Nombre</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
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
                required
              />
            </div>

            <div>
              <Label>Barcode</Label>
              <Input
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                placeholder="Código de barras"
              />
            </div>

            {/* Unidad */}
            <div>
              <Label>Unidad</Label>
              <Select
                value={formData.unit_id}
                onValueChange={(v) => setField("unit_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona unidad" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Descripción */}
            <div>
              <Label>Descripción</Label>
              <Input
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Imagen */}
            <div>
              <Label>Imagen</Label>
              <Input
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="URL opcional"
              />
            </div>

            {/* Categoría */}
            <div>
              <Label>Categoría</Label>
              <Select
                value={formData.category_id}
                onValueChange={(v) => setField("category_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona categoría" />
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

            {/* Marca */}
            <div>
              <Label>Marca (opcional)</Label>
              <Select
                value={formData.brand_id || ""}
                onValueChange={(v) => setField("brand_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona marca" />
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

            {/* Precio */}
            <div>
              <Label>Precio Compra C/IGV (S/)</Label>
              <Input
                type="number"
                name="price_purchase"
                value={formData.price_purchase}
                onChange={handleChange}
              />
            </div>
            {/* Precio */}
            <div>
              <Label>Precio Venta (S/)</Label>
              <Input
                type="number"
                name="price_sale"
                value={formData.price_sale}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!loaded}>
            {product ? "Guardar cambios" : "Agregar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
