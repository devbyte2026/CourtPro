"use client";

import type { Tenant, CancellationPolicy } from "@/types/database";
import { Clock, Users, MapPin, CreditCard, Shield, Calendar } from "lucide-react";

interface Props {
  tenant: Tenant;
}

export function ComplexInfo({ tenant }: Props) {
  const policy: CancellationPolicy = tenant.cancellation_policy as CancellationPolicy || {
    free_cancellation_hours: 24,
    refund_percentage: 100,
  };

  return (
    <div className="space-y-4">
      {tenant.description && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Sobre el complejo</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{tenant.description}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {tenant.address && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">{tenant.address}</span>
          </div>
        )}
        {tenant.phone && (
          <div className="flex items-start gap-2 text-sm">
            <Users className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">{tenant.phone}</span>
          </div>
        )}
        <div className="flex items-start gap-2 text-sm">
          <CreditCard className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">Mercado Pago</span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <Clock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">Turnos de 1 hora</span>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h4 className="font-medium flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Política de cancelación
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li className="flex items-center gap-2">
            <Calendar className="h-3 w-3 shrink-0" />
            Cancelación gratis hasta {policy.free_cancellation_hours || 24}hs antes
          </li>
          <li>
            Reembolso del {policy.refund_percentage || 100}% si cancelás en término
          </li>
        </ul>
      </div>
    </div>
  );
}
