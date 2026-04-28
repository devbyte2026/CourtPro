"use client";

import { useState } from "react";
import type { Tenant } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  tenant: Tenant;
}

export function CancellationConfig({ tenant }: Props) {
  const policy = tenant.cancellation_policy as { free_cancellation_hours?: number; refund_percentage?: number } | null || {};
  const [freeHours, setFreeHours] = useState(policy.free_cancellation_hours || 24);
  const [refundPct, setRefundPct] = useState(policy.refund_percentage || 100);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tenant`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          cancellation_policy: {
            free_cancellation_hours: freeHours,
            refund_percentage: refundPct,
          },
        }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      toast.success("Política de cancelación guardada");
    } catch {
      toast.error("No se pudieron guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Política de cancelación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Definí las condiciones para cancelación gratuita y reembolso.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Horas antes para cancelación gratis</Label>
            <Input
              type="number"
              value={freeHours}
              onChange={(e) => setFreeHours(parseInt(e.target.value) || 0)}
              className="w-40"
            />
            <p className="text-xs text-muted-foreground">
              Si el jugador cancela con al menos esta cantidad de horas de anticipación, la cancelación es gratuita.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Porcentaje de reembolso (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={refundPct}
              onChange={(e) => setRefundPct(parseInt(e.target.value) || 0)}
              className="w-40"
            />
            <p className="text-xs text-muted-foreground">
              Porcentaje del monto que se reembolsa si la cancelación es dentro del período gratuito.
            </p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-medium">Ejemplo</h4>
          <p className="text-sm text-muted-foreground">
            Si un jugador reserva y cancela {freeHours}hs antes del turno, recibe el {refundPct}% del pago de vuelta.
          </p>
        </div>

        <Button onClick={onSubmit} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar política"}
        </Button>
      </CardContent>
    </Card>
  );
}
