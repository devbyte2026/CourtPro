"use client";

import { useEffect, useState } from "react";
import type { Tenant, Court } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, X, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

interface RecurringBooking {
  id: string;
  court_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  price: number;
  start_date: string;
  end_date: string | null;
  occurrences: number | null;
  instances_count: number;
  is_active: boolean;
  court: { name: string; sport_type: string };
  customer: { name: string; email: string };
}

interface Props {
  tenant: Tenant & { courts?: Court[] };
}

export function RecurringBookingsPage({ tenant }: Props) {
  const [recurring, setRecurring] = useState<RecurringBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    courtId: "",
    dayOfWeek: 1,
    startTime: "20:00",
    endTime: "21:00",
    occurrences: 12,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRecurring();
  }, [tenant.id]);

  const fetchRecurring = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/recurring?tenantId=${tenant.id}`);
      if (res.ok) {
        const data = await res.json();
        setRecurring(data.recurring || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/recurring`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recurringId: id, isActive: !currentActive }),
      });
      if (!res.ok) throw new Error();
      fetchRecurring();
    } catch {
      toast.error("No se pudo actualizar");
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const customerRes = await fetch(`/api/admin/customers?tenantId=${tenant.id}`);
      const customerData = await customerRes.json();
      const customer = customerData.customers?.[0];

      if (!customer) {
        toast.error("No se encontró cliente");
        return;
      }

      const res = await fetch(`/api/admin/recurring`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          courtId: formData.courtId,
          customerId: customer.id,
          dayOfWeek: formData.dayOfWeek,
          startTime: formData.startTime,
          endTime: formData.endTime,
          price: 0,
          startDate: new Date().toISOString().split("T")[0],
          occurrences: formData.occurrences,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Reserva recurrente creada");
      setShowForm(false);
      fetchRecurring();
    } catch {
      toast.error("No se pudo crear");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reservas recurrentes</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva grupo fijo
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Crear grupo fijo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cancha</Label>
                <select
                  value={formData.courtId}
                  onChange={(e) => setFormData((f) => ({ ...f, courtId: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar cancha</option>
                  {tenant.courts?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Día de la semana</Label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData((f) => ({ ...f, dayOfWeek: parseInt(e.target.value) }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {DAYS.map((d, i) => (
                    <option key={i} value={i}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Hora inicio</Label>
                <Input type="time" value={formData.startTime} onChange={(e) => setFormData((f) => ({ ...f, startTime: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Hora fin</Label>
                <Input type="time" value={formData.endTime} onChange={(e) => setFormData((f) => ({ ...f, endTime: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Cantidad de semanas</Label>
                <Input type="number" value={formData.occurrences} onChange={(e) => setFormData((f) => ({ ...f, occurrences: parseInt(e.target.value) }))} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={saving || !formData.courtId}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear grupo fijo"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : recurring.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No hay reservas recurrentes</p>
          <p className="text-sm">Creá un grupo fijo para reservas semanales automáticas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recurring.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                    {r.court.sport_type === "futbol" ? "⚽" : r.court.sport_type === "padel" ? "🎾" : "🏟"}
                  </div>
                  <div>
                    <p className="font-medium">{r.court.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {DAYS[r.day_of_week]} {r.start_time} - {r.end_time}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.customer?.name} • {r.instances_count}/{r.occurrences} turnos generados
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleActive(r.id, r.is_active)} className="p-2">
                    {r.is_active ? (
                      <ToggleRight className="h-6 w-6 text-success" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
