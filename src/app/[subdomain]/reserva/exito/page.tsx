"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");
  const [status, setStatus] = useState<"loading" | "confirmed" | "pending">("loading");

  useEffect(() => {
    if (!bookingId) {
      setStatus("pending");
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}/status`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data.status === "confirmed" ? "confirmed" : "pending");
        }
      } catch {
        setStatus("pending");
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Procesando pago...</h1>
            <p className="text-muted-foreground">Verificando el estado de tu reserva</p>
          </>
        )}

        {status === "confirmed" && (
          <>
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-success" />
            <h1 className="text-2xl font-bold mb-2">¡Reserva confirmada!</h1>
            <p className="text-muted-foreground mb-6">
              Tu turno quedó reservado. Te enviamos un email con los detalles.
            </p>
            <div className="bg-muted rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">Referencia</p>
              <p className="font-mono text-lg">{bookingId?.slice(0, 8)}</p>
            </div>
            <Button className="w-full">
              <Link href="/">Volver al inicio</Link>
            </Button>
          </>
        )}

        {status === "pending" && (
          <>
            <Clock className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            <h1 className="text-2xl font-bold mb-2">Pago en progreso</h1>
            <p className="text-muted-foreground mb-6">
              Tu pago está siendo procesado. Te confirmaremos por email cuando se acredite.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1">
                <Link href="/">Volver al inicio</Link>
              </Button>
              <Button className="flex-1">
                <Link href="/onboarding">Ver estado</Link>
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
