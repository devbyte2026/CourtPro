"use client";

import { useEffect, useState } from "react";
import type { Tenant } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, Users, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  tenant: Tenant;
}

interface Metrics {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  todayBookings: number;
  weekBookings: number;
  pendingBookings: number;
  occupancyRate: number;
  topCourts: { name: string; bookings: number }[];
  noShows: number;
}

export function AdminDashboard({ tenant }: Props) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch(`/api/admin/metrics?tenantId=${tenant.id}`);
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [tenant.id]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 h-24" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: "Hoy",
      value: `$${(metrics?.todayRevenue || 0).toLocaleString("es-AR")}`,
      subtext: `${metrics?.todayBookings || 0} reservas`,
      icon: DollarSign,
      color: "text-success",
    },
    {
      title: "Esta semana",
      value: `$${(metrics?.weekRevenue || 0).toLocaleString("es-AR")}`,
      subtext: `${metrics?.weekBookings || 0} reservas`,
      icon: Calendar,
      color: "text-blue-500",
    },
    {
      title: "Este mes",
      value: `$${(metrics?.monthRevenue || 0).toLocaleString("es-AR")}`,
      subtext: `${(metrics?.occupancyRate || 0).toFixed(0)}% ocupación`,
      icon: TrendingUp,
      color: "text-purple-500",
    },
    {
      title: "Pendientes",
      value: metrics?.pendingBookings || 0,
      subtext: "reservas sin confirmar",
      icon: Clock,
      color: "text-yellow-500",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{tenant.name}</h1>
          <p className="text-muted-foreground">Panel de administración</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Plan</p>
          <p className="font-medium capitalize">{tenant.plan}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.subtext}</p>
                </div>
                <div className={cn("p-2 rounded-lg bg-muted", card.color)}>
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Canchas más reservadas</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics?.topCourts && metrics.topCourts.length > 0 ? (
              <div className="space-y-3">
                {metrics.topCourts.map((court, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{court.name}</span>
                    <span className="text-sm font-medium">{court.bookings} turnos</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sin datos aún</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              No-shows del mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics?.noShows || 0}</p>
            <p className="text-sm text-muted-foreground">jugadores que no se presentaron</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
