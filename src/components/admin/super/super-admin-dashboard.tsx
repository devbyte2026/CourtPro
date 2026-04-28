"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, Building2, CreditCard, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Metrics {
  totalTenants: number;
  activeTenants: number;
  pendingTenants: number;
  mrr: number;
  totalBookings: number;
  totalGMV: number;
  topTenants: { name: string; mrr: number; bookings: number }[];
  recentSignups: { name: string; plan: string; created_at: string }[];
  churnRisk: { name: string; daysSinceLastBooking: number }[];
}

export function SuperAdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/superadmin/metrics");
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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#CAFF00]" />
      </div>
    );
  }

  const cards = [
    {
      title: "Tenants activos",
      value: metrics?.activeTenants || 0,
      subtext: `${metrics?.pendingTenants || 0} pendientes`,
      icon: Building2,
      color: "text-[#CAFF00]",
    },
    {
      title: "Total tenants",
      value: metrics?.totalTenants || 0,
      subtext: "registrados",
      icon: Users,
      color: "text-[#CAFF00]",
    },
    {
      title: "MRR",
      value: `$${(metrics?.mrr || 0).toLocaleString("es-AR")}`,
      subtext: "ingresos mensuales",
      icon: CreditCard,
      color: "text-[#CAFF00]",
    },
    {
      title: "GMV total",
      value: `$${((metrics?.totalGMV || 0) / 1000000).toFixed(1)}M`,
      subtext: `${metrics?.totalBookings || 0} reservas`,
      icon: TrendingUp,
      color: "text-[#CAFF00]",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F0F4F8] font-[family-name:var(--font-bebas-neue)]">SUPER ADMIN</h1>
        <p className="text-[#6B7F94]">Panel maestro de CanchaPro</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title} className="bg-[#1A2D47] border-[#1E3A5F]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[#6B7F94]">{card.title}</p>
                  <p className="text-2xl font-bold mt-1 text-[#F0F4F8]">{card.value}</p>
                  <p className="text-xs text-[#6B7F94] mt-1">{card.subtext}</p>
                </div>
                <div className={cn("p-2 rounded-lg bg-[#111F35]", card.color)}>
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1A2D47] border-[#1E3A5F]">
          <CardHeader>
            <CardTitle className="text-base text-[#F0F4F8]">Top tenants por uso</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics?.topTenants && metrics.topTenants.length > 0 ? (
              <div className="space-y-3">
                {metrics.topTenants.map((t, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-[#F0F4F8]">{t.name}</span>
                    <div className="text-right">
                      <span className="text-sm font-medium text-[#F0F4F8]">{t.bookings} turnos</span>
                      <span className="text-xs text-[#6B7F94] ml-2">${t.mrr}/mes</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#6B7F94]">Sin datos aún</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#1A2D47] border-[#1E3A5F]">
          <CardHeader>
            <CardTitle className="text-base text-[#F0F4F8] flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#CAFF00]" />
              Registro de actividad
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics?.recentSignups && metrics.recentSignups.length > 0 ? (
              <div className="space-y-3">
                {metrics.recentSignups.slice(0, 5).map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#F0F4F8]">{s.name}</p>
                      <p className="text-xs text-[#6B7F94]">{new Date(s.created_at).toLocaleDateString("es-AR")}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#111F35] text-[#CAFF00] capitalize">{s.plan}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#6B7F94]">Sin registros recientes</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}