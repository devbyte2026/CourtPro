"use client";

import { useState } from "react";
import type { Tenant, Court, SportType } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SPORT_LABELS: Record<SportType, string> = {
  futbol: "Fútbol 5",
  padel: "Pádel",
  volleyball: "Vóley",
  tennis: "Tenis",
  basketball: "Básquet",
  other: "Otro",
};

interface Props {
  tenant: Tenant & { courts?: Court[] };
}

interface CourtForm {
  id?: string;
  name: string;
  sport_type: SportType;
  capacity: number;
  default_price: number;
  is_active: boolean;
}

export function CourtsConfig({ tenant }: Props) {
  const courts = tenant.courts || [];
  const [courtList, setCourtList] = useState<CourtForm[]>(
    courts.length > 0
      ? courts.map((c) => ({
          id: c.id,
          name: c.name,
          sport_type: c.sport_type,
          capacity: c.capacity,
          default_price: c.default_price,
          is_active: c.is_active,
        }))
      : [{ name: "", sport_type: "futbol" as SportType, capacity: 10, default_price: 5000, is_active: true }]
  );
  const [loading, setLoading] = useState(false);

  const updateCourt = (index: number, field: keyof CourtForm, value: string | number | boolean) => {
    setCourtList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addCourt = () => {
    setCourtList((prev) => [
      ...prev,
      { name: "", sport_type: "futbol" as SportType, capacity: 10, default_price: 5000, is_active: true },
    ]);
  };

  const removeCourt = (index: number) => {
    setCourtList((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/courts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: tenant.id, courts: courtList }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      toast.success("Canchas actualizadas");
    } catch {
      toast.error("No se pudieron guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Canchas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {courtList.map((court, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cancha {i + 1}</span>
              {courtList.length > 1 && (
                <button onClick={() => removeCourt(i)} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Nombre</Label>
                <Input
                  value={court.name}
                  onChange={(e) => updateCourt(i, "name", e.target.value)}
                  placeholder="Cancha 1"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Deporte</Label>
                <select
                  value={court.sport_type}
                  onChange={(e) => updateCourt(i, "sport_type", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {Object.entries(SPORT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Capacidad</Label>
                <Input
                  type="number"
                  value={court.capacity}
                  onChange={(e) => updateCourt(i, "capacity", parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Precio ($)</Label>
                <Input
                  type="number"
                  value={court.default_price}
                  onChange={(e) => updateCourt(i, "default_price", parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={court.is_active}
                onChange={(e) => updateCourt(i, "is_active", e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Activa</span>
            </label>
          </div>
        ))}

        <button
          onClick={addCourt}
          className="w-full py-3 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-4 w-4" /> Agregar cancha
        </button>

        <Button onClick={onSubmit} disabled={loading} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar canchas"}
        </Button>
      </CardContent>
    </Card>
  );
}
