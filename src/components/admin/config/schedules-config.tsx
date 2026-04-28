"use client";

import { useState } from "react";
import type { Tenant, Court } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

interface ScheduleEntry {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface Props {
  tenant: Tenant & { courts?: Court[] };
}

export function SchedulesConfig({ tenant }: Props) {
  const courts = tenant.courts || [];
  const [schedule, setSchedule] = useState<ScheduleEntry[]>(
    [0, 1, 2, 3, 4, 5, 6].map((day) => ({
      day_of_week: day,
      start_time: day >= 1 && day <= 5 ? "09:00" : "08:00",
      end_time: day >= 1 && day <= 5 ? "22:00" : "21:00",
      is_active: day !== 0,
    }))
  );
  const [loading, setLoading] = useState(false);

  const updateSchedule = (day: number, field: keyof ScheduleEntry, value: string | boolean) => {
    setSchedule((prev) =>
      prev.map((s) => (s.day_of_week === day ? { ...s, [field]: value } : s))
    );
  };

  const onSubmit = async () => {
    if (courts.length === 0) {
      toast.error("Primero creá canchas para asignar horarios");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/schedules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: tenant.id, schedules: schedule }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      toast.success("Horarios actualizados");
    } catch {
      toast.error("No se pudieron guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horarios de operación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Definí los horarios en que se pueden hacer reservas para cada día de la semana.
        </p>

        {schedule.map((s) => (
          <div key={s.day_of_week} className="flex items-center gap-4 p-3 border rounded-lg">
            <span className="w-24 text-sm font-medium">{DAYS[s.day_of_week]}</span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={s.is_active}
                onChange={(e) => updateSchedule(s.day_of_week, "is_active", e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Abierto</span>
            </label>
            {s.is_active && (
              <div className="flex items-center gap-2 ml-auto">
                <Input
                  type="time"
                  value={s.start_time}
                  onChange={(e) => updateSchedule(s.day_of_week, "start_time", e.target.value)}
                  className="w-28"
                />
                <span className="text-muted-foreground">a</span>
                <Input
                  type="time"
                  value={s.end_time}
                  onChange={(e) => updateSchedule(s.day_of_week, "end_time", e.target.value)}
                  className="w-28"
                />
              </div>
            )}
          </div>
        ))}

        <Button onClick={onSubmit} disabled={loading} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar horarios"}
        </Button>
      </CardContent>
    </Card>
  );
}
