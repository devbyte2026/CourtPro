"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step2Schema, type Step2Data } from "@/lib/schemas/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

const SPORT_TYPES = [
  { value: "futbol", label: "Fútbol 5" },
  { value: "padel", label: "Pádel" },
  { value: "volleyball", label: "Vóley" },
  { value: "tennis", label: "Tenis" },
  { value: "basketball", label: "Básquet" },
];

const COURT_TEMPLATES = [
  { name: "Cancha 1", sport_type: "futbol" as const, capacity: 10, default_price: 5000 },
  { name: "Cancha 2", sport_type: "futbol" as const, capacity: 10, default_price: 5000 },
  { name: "Cancha Pádel 1", sport_type: "padel" as const, capacity: 4, default_price: 4000 },
];

interface Props {
  onComplete: (data: Step2Data) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
}

export function Step2Courts({ onComplete, onBack, isLoading }: Props) {
  const { control, handleSubmit, formState: { errors } } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { courts: COURT_TEMPLATES },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "courts" });

  const addFromTemplate = (template: typeof COURT_TEMPLATES[0]) => {
    append(template);
  };

  return (
    <form onSubmit={handleSubmit(onComplete)} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-lg font-medium">Canchas del complejo</Label>
        <p className="text-sm text-muted-foreground">Agregá las canchas que ofrecés. Podés usar templates predefinidos.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {COURT_TEMPLATES.map((t, i) => (
          <button key={i} type="button" onClick={() => addFromTemplate(t)} className="text-xs px-3 py-1.5 rounded-full border hover:bg-muted transition-colors">
            + {t.name}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <Card key={field.id} className="p-4">
            <div className="flex items-start gap-3">
              <GripVertical className="h-5 w-5 mt-6 text-muted-foreground cursor-grab" />
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nombre</Label>
                  <Input {...control.register(`courts.${index}.name`)} placeholder="Cancha 1" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Deporte</Label>
                  <select {...control.register(`courts.${index}.sport_type`)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {SPORT_TYPES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Capacidad</Label>
                  <Input type="number" {...control.register(`courts.${index}.capacity`, { valueAsNumber: true })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Precio default ($)</Label>
                  <Input type="number" {...control.register(`courts.${index}.default_price`, { valueAsNumber: true })} />
                </div>
              </div>
              <button type="button" onClick={() => remove(index)} className="text-destructive hover:bg-destructive/10 p-2 rounded">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <button type="button" onClick={() => append({ name: "", sport_type: "futbol", capacity: 10, default_price: 5000 })} className="w-full py-3 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
        <Plus className="h-4 w-4" /> Agregar cancha
      </button>

      {errors.courts?.root && <p className="text-sm text-destructive">{errors.courts.root.message}</p>}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">Volver</Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continuar"}
        </Button>
      </div>
    </form>
  );
}