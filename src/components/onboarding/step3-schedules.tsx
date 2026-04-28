"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step3Schema, type Step3Data } from "@/lib/schemas/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

interface ScheduleEntry {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface Props {
  onComplete: (data: Step3Data) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
}

export function Step3Schedules({ onComplete, onBack, isLoading }: Props) {
  const [schedules, setSchedules] = useState<ScheduleEntry[]>(
    [0, 1, 2, 3, 4].map((day) => ({
      day_of_week: day,
      start_time: day >= 1 && day <= 5 ? "09:00" : "08:00",
      end_time: day >= 1 && day <= 5 ? "22:00" : "21:00",
      is_active: true,
    }))
  );

  const [pricingRules, setPricingRules] = useState([
    { day_of_week: null, start_time: "00:00", end_time: "23:59", price_modifier: 1.0 },
  ]);

  const updateSchedule = (index: number, field: keyof ScheduleEntry, value: string | boolean) => {
    setSchedules((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onComplete({ schedules, pricing_rules: pricingRules });
      }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label className="text-lg font-medium">Horarios de operación</Label>
        <p className="text-sm text-muted-foreground">Definí los horarios en que se pueden hacer reservas.</p>
      </div>

      <div className="space-y-2">
        {DAYS.slice(1).map((day, i) => {
          const schedule = schedules.find((s) => s.day_of_week === i + 1) || schedules[0];
          return (
            <Card key={i} className="p-3 flex items-center gap-4">
              <span className="w-24 text-sm font-medium">{day}</span>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={schedule.is_active}
                  onChange={(e) => {
                    const idx = schedules.findIndex((s) => s.day_of_week === i + 1);
                    if (idx >= 0) updateSchedule(idx, "is_active", e.target.checked);
                  }}
                  className="rounded"
                />
                <span className="text-sm">Abierto</span>
              </label>
              {schedule.is_active && (
                <div className="flex items-center gap-2 ml-auto">
                  <Input
                    type="time"
                    value={schedule.start_time}
                    onChange={(e) => {
                      const idx = schedules.findIndex((s) => s.day_of_week === i + 1);
                      if (idx >= 0) updateSchedule(idx, "start_time", e.target.value);
                    }}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">a</span>
                  <Input
                    type="time"
                    value={schedule.end_time}
                    onChange={(e) => {
                      const idx = schedules.findIndex((s) => s.day_of_week === i + 1);
                      if (idx >= 0) updateSchedule(idx, "end_time", e.target.value);
                    }}
                    className="w-24"
                  />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="space-y-2">
        <Label className="text-lg font-medium">Reglas de precio (opcional)</Label>
        <p className="text-sm text-muted-foreground">Definí modificadores de precio por franja horaria.</p>
        {pricingRules.map((rule, i) => (
          <Card key={i} className="p-3 flex items-center gap-3">
            <span className="text-sm text-muted-foreground w-20">Todos los días</span>
            <Input
              type="time"
              value={rule.start_time}
              onChange={(e) => {
                const updated = [...pricingRules];
                updated[i].start_time = e.target.value;
                setPricingRules(updated);
              }}
              className="w-28"
            />
            <span className="text-muted-foreground">a</span>
            <Input
              type="time"
              value={rule.end_time}
              onChange={(e) => {
                const updated = [...pricingRules];
                updated[i].end_time = e.target.value;
                setPricingRules(updated);
              }}
              className="w-28"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm">×</span>
              <Input
                type="number"
                step="0.1"
                value={rule.price_modifier}
                onChange={(e) => {
                  const updated = [...pricingRules];
                  updated[i].price_modifier = parseFloat(e.target.value) || 1;
                  setPricingRules(updated);
                }}
                className="w-20"
              />
            </div>
            <button type="button" onClick={() => setPricingRules((p) => p.filter((_, idx) => idx !== i))} className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </Card>
        ))}
        <button type="button" onClick={() => setPricingRules((p) => [...p, { day_of_week: null, start_time: "00:00", end_time: "23:59", price_modifier: 1.0 }])} className="text-sm text-primary hover:underline">
          + Agregar regla de precio
        </button>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">Volver</Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continuar"}
        </Button>
      </div>
    </form>
  );
}