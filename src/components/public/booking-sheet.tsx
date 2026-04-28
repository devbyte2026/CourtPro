"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { Tenant, Court } from "@/types/database";
import { Loader2, Calendar, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  tenant: Tenant;
  court: Court | null;
  slot: { date: string; time: string } | null;
  onLoginRequired: () => void;
  onJoinWaitlist?: (courtId: string, date: string, time: string) => void;
}

export function BookingSheet({ open, onClose, tenant, court, slot, onLoginRequired, onJoinWaitlist }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!slot || !court) return null;

  const price = court.default_price || 5000;
  const dateFormatted = new Date(slot.date + "T00:00:00").toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/public/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: tenant.id,
          court_id: court.id,
          date: slot.date,
          start_time: slot.time,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear la reserva");
      }

      if (data.auth_required) {
        onLoginRequired();
        return;
      }

      if (data.init_point) {
        window.location.href = data.init_point;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Confirmar reserva</SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-6">
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                {court.sport_type === "futbol" ? "⚽" : court.sport_type === "padel" ? "🎾" : "🏟"}
              </div>
              <div>
                <p className="font-medium">{court.name}</p>
                <p className="text-sm text-muted-foreground">{tenant.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="capitalize">{dateFormatted}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{slot.time} - {addHours(slot.time, 1)}</span>
              </div>
            </div>

            {tenant.address && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{tenant.address}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
            <span className="text-sm">Precio por turno</span>
            <span className="text-xl font-bold">${price.toLocaleString("es-AR")}</span>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {slot && onJoinWaitlist && (
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                onJoinWaitlist(court.id, slot.date, slot.time);
              }}
              className="w-full"
            >
              Unirme a la lista de espera
            </Button>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• La reserva se libera si no se completa el pago en 10 minutos</p>
            <p>• Cancelación gratis hasta 24hs antes del turno</p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={handleConfirm} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reservar y pagar"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function addHours(time: string, hours: number): string {
  const [h, m] = time.split(":").map(Number);
  const totalMinutes = h * 60 + m + hours * 60;
  const newH = Math.floor(totalMinutes / 60) % 24;
  return `${String(newH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}