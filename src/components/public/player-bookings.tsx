"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Clock, MapPin, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_amount: number;
  court: { id: string; name: string; sport_type: string };
  tenant: { id: string; name: string };
}

interface Props {
  userId: string;
  tenantId: string;
  onRepeatBooking?: (courtId: string, date: string, time: string) => void;
}

export function PlayerBookings({ userId, tenantId, onRepeatBooking }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`/api/player/bookings?tenantId=${tenantId}&filter=${filter}`);
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId, tenantId, filter]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No tenés reservas {filter === "upcoming" ? "pendientes" : "pasadas"}</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    confirmed: "bg-success/10 text-success",
    pending: "bg-yellow-500/10 text-yellow-600",
    cancelled: "bg-destructive/10 text-destructive",
    completed: "bg-muted text-muted-foreground",
    no_show: "bg-destructive/10 text-destructive",
  };

  const statusLabels: Record<string, string> = {
    confirmed: "Confirmada",
    pending: "Pendiente",
    cancelled: "Cancelada",
    completed: "Completada",
    no_show: "No se presentó",
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["upcoming", "past", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {f === "upcoming" ? "Próximas" : f === "past" ? "Pasadas" : "Todas"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                  {booking.court.sport_type === "futbol" ? "⚽" : booking.court.sport_type === "padel" ? "🎾" : "🏟"}
                </div>
                <div>
                  <p className="font-medium">{booking.court.name}</p>
                  <p className="text-sm text-muted-foreground">{booking.tenant.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(booking.date + "T00:00:00").toLocaleDateString("es-AR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {booking.start_time} - {booking.end_time}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <span className={cn("text-xs px-2 py-1 rounded-full", statusColors[booking.status])}>
                  {statusLabels[booking.status]}
                </span>
                {booking.status === "completed" && onRepeatBooking && (
                  <button
                    onClick={() => onRepeatBooking(booking.court.id, booking.date, booking.start_time)}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Repeat className="h-3 w-3" />
                    Repetir
                  </button>
                )}
                <p className="text-sm font-medium">${booking.total_amount.toLocaleString("es-AR")}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
