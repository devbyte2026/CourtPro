"use client";

import { useEffect, useState } from "react";
import type { Tenant } from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, X, Ban, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_amount: number;
  created_at: string;
  court: { name: string; sport_type: string };
  customer: { name: string; email: string };
}

interface Props {
  tenant: Tenant;
}

export function AdminReservationsList({ tenant }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          tenantId: tenant.id,
          date: dateFilter,
        });
        if (statusFilter !== "all") {
          params.set("status", statusFilter);
        }

        const res = await fetch(`/api/admin/bookings?${params}`);
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
  }, [tenant.id, dateFilter, statusFilter]);

  const filteredBookings = bookings.filter((b) => {
    if (!filter) return true;
    const searchLower = filter.toLowerCase();
    return (
      b.customer.name.toLowerCase().includes(searchLower) ||
      b.customer.email.toLowerCase().includes(searchLower) ||
      b.court.name.toLowerCase().includes(searchLower)
    );
  });

  const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    confirmed: { label: "Confirmada", color: "bg-success/10 text-success", icon: CheckCircle },
    pending: { label: "Pendiente", color: "bg-yellow-500/10 text-yellow-600", icon: Clock },
    cancelled: { label: "Cancelada", color: "bg-destructive/10 text-destructive", icon: X },
    completed: { label: "Completada", color: "bg-muted text-muted-foreground", icon: CheckCircle },
    no_show: { label: "No se presentó", color: "bg-destructive/10 text-destructive", icon: AlertCircle },
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reservas</h1>
        <div className="flex gap-2">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      <div className="flex gap-2">
        {["all", "confirmed", "pending", "cancelled", "completed"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
            )}
          >
            {s === "all" ? "Todas" : statusConfig[s]?.label || s}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por cliente o cancha..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No hay reservas para esta fecha</p>
            </div>
          ) : (
            filteredBookings.map((booking) => {
              const status = statusConfig[booking.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <Card key={booking.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                        {booking.court.sport_type === "futbol" ? "⚽" : booking.court.sport_type === "padel" ? "🎾" : "🏟"}
                      </div>
                      <div>
                        <p className="font-medium">{booking.court.name}</p>
                        <p className="text-sm text-muted-foreground">{booking.customer.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{new Date(booking.date + "T00:00:00").toLocaleDateString("es-AR")}</span>
                          <span>{booking.start_time} - {booking.end_time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={cn("text-xs px-2 py-1 rounded-full flex items-center gap-1", status.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                      <p className="font-medium">${booking.total_amount.toLocaleString("es-AR")}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
