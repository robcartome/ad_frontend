"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSeries, createSeries, deactivateSeries } from "@/services/salesService";
import { getMyStoresDetail } from "@/services/storeAccessService";
import { getSelectedCompany } from "@/services/authService";

const VOUCHER_TYPE_LABELS = {
  "01": "Factura",
  "03": "Boleta",
  "07": "Nota Crédito",
  "08": "Nota Débito",
  "09": "Guía Remisión",
  OV: "Orden de Venta",
  COT: "Cotización",
};

const VOUCHER_TYPES = Object.entries(VOUCHER_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function SeriesAdminPage() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [stores, setStores] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // New series form
  const [newType, setNewType] = useState("COT");
  const [newStoreId, setNewStoreId] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newStartNum, setNewStartNum] = useState("0");
  const [creating, setCreating] = useState(false);

  const storeNameById = useCallback(
    (id) => stores.find((s) => s.id === id)?.name || "—",
    [stores]
  );

  const totalSeries = series.length;
  const activeSeries = series.filter((item) => item.active).length;
  const storesWithSeries = new Set(series.map((item) => item.store_id).filter(Boolean)).size;
  const legacySeriesCount = series.filter((item) => !item.company_id).length;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSeries(filterType || null);
      setSeries(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Error cargando series");
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getMyStoresDetail()
      .then((items) => {
        const data = Array.isArray(items) ? items : [];
        setStores(data);
        if (data.length === 1) {
          setNewStoreId(data[0].id);
        }
      })
      .catch(() => setStores([]));

    setSelectedCompany(getSelectedCompany());
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newCode.trim()) {
      toast.error("Ingrese el código de serie (ej: C001)");
      return;
    }
    if (stores.length > 1 && !newStoreId) {
      toast.error("Seleccione la sucursal para la serie");
      return;
    }
    setCreating(true);
    try {
      await createSeries({
        voucher_type: newType,
        series: newCode.trim().toUpperCase(),
        store_id: newStoreId || null,
        current_number: parseInt(newStartNum, 10) || 0,
      });
      toast.success(`Serie ${newCode.toUpperCase()} creada`);
      setNewCode("");
      setNewStartNum("0");
      await load();
    } catch (err) {
      toast.error(err.message || "Error al crear serie");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Series y Correlativos por Sucursal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configura comprobantes y series para la empresa actual y sus sucursales accesibles.
          </p>
          {selectedCompany?.company_name && (
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline">Empresa actual</Badge>
              <span className="text-sm text-muted-foreground">{selectedCompany.company_name}</span>
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-1">
          <RefreshCw size={14} />
          Actualizar
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de series</CardDescription>
            <CardTitle className="text-2xl">{totalSeries}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Series activas</CardDescription>
            <CardTitle className="text-2xl">{activeSeries}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sucursales con series</CardDescription>
            <CardTitle className="text-2xl">{storesWithSeries}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {legacySeriesCount > 0 && (
        <Card className="border-amber-200 bg-amber-50/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-amber-900">Series legacy detectadas</CardTitle>
            <CardDescription className="text-amber-800">
              Hay {legacySeriesCount} serie(s) antiguas sin empresa asociada. Conviene revisarlas o recrearlas para mantener la numeración totalmente alineada a multiempresa.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Listado de series</CardTitle>
            <CardDescription>
              Visualiza series por comprobante y sucursal.
            </CardDescription>
          </div>
          <Select value={filterType || "ALL"} onValueChange={(value) => setFilterType(value === "ALL" ? "" : value)}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Todos los comprobantes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los comprobantes</SelectItem>
              {VOUCHER_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comprobante</TableHead>
                <TableHead>Sucursal</TableHead>
                <TableHead>Serie</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead className="text-right">Nro. Actual</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead>Creada</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Cargando…
                </TableCell>
              </TableRow>
            ) : series.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No hay series registradas
                </TableCell>
              </TableRow>
            ) : (
              series.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">
                    {VOUCHER_TYPE_LABELS[s.voucher_type] || s.voucher_type}
                  </TableCell>
                  <TableCell>
                    {storeNameById(s.store_id)}
                  </TableCell>
                  <TableCell className="font-mono font-semibold">
                    {s.series}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.company_id ? "outline" : "destructive"}>
                      {s.company_id ? "Empresa" : "Legacy"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {s.current_number.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={s.active ? "secondary" : "outline"}>
                      {s.active ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {s.created_at
                      ? new Date(s.created_at).toLocaleDateString("es-PE")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    {s.active && (
                      <button
                        onClick={async () => {
                          if (!confirm(`¿Desactivar serie ${s.series}?`)) return;
                          try {
                            await deactivateSeries(s.id);
                            toast.success(`Serie ${s.series} desactivada`);
                            load();
                          } catch {
                            toast.error("Error al desactivar");
                          }
                        }}
                        className="text-destructive hover:opacity-80"
                        title="Desactivar serie"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nueva serie</CardTitle>
          <CardDescription>
            Registra una serie para un comprobante y sucursal específica.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Comprobante</label>
            <Select value={newType} onValueChange={setNewType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Seleccione tipo" />
              </SelectTrigger>
              <SelectContent>
              {VOUCHER_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Sucursal</label>
            <Select
              value={newStoreId || (stores.length === 1 ? stores[0]?.id : "NONE") || "NONE"}
              onValueChange={(value) => setNewStoreId(value === "NONE" ? "" : value)}
              disabled={stores.length <= 1}
            >
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Seleccionar sucursal" />
              </SelectTrigger>
              <SelectContent>
              {stores.length > 1 && <SelectItem value="NONE">Seleccionar sucursal</SelectItem>}
              {stores.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">
              Código serie
            </label>
            <Input
              placeholder="C001"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              className="w-28 font-mono uppercase"
              maxLength={4}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">
              Número inicio
            </label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={newStartNum}
              onChange={(e) => setNewStartNum(e.target.value)}
              className="w-24"
            />
          </div>
          <Button type="submit" disabled={creating} className="gap-1">
            <Plus size={14} />
            {creating ? "Creando…" : "Crear Serie"}
          </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
