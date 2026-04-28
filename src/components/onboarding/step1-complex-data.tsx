"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step1Schema, type Step1Data } from "@/lib/schemas/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface Props {
  onComplete: (data: Step1Data) => Promise<void>;
  isLoading: boolean;
}

export function Step1ComplexData({ onComplete, isLoading }: Props) {
  const [slugPreview, setSlugPreview] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { name: "", slug: "", description: "", address: "", city: "", phone: "" },
  });

  const nameValue = watch("name");

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue("name", name);
    setSlugPreview(generateSlug(name));
    if (!watch("slug") || watch("slug") === generateSlug(name)) {
      setValue("slug", generateSlug(name));
    }
  };

  return (
    <form onSubmit={handleSubmit(onComplete)} className="space-y-4">
      <div className="space-y-2">
        <Label>Nombre del complejo *</Label>
        <Input {...register("name")} onChange={handleNameChange} placeholder="Ej: Complejo Los Andes" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Subdominio *</Label>
        <div className="flex items-center gap-2">
          <Input {...register("slug")} className="flex-1" placeholder="los-andes" />
          <span className="text-muted-foreground text-sm">.canchapro.app</span>
        </div>
        {slugPreview && (
          <p className="text-xs text-muted-foreground">Preview: {slugPreview}.canchapro.app</p>
        )}
        {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Descripción</Label>
        <textarea
          {...register("description")}
          className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Canchas de fútbol 5 y pádel con iluminación LED y buffet"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Dirección *</Label>
          <Input {...register("address")} placeholder="Av. Libertador 1234" />
          {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Ciudad *</Label>
          <Input {...register("city")} placeholder="Buenos Aires" />
          {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Teléfono</Label>
        <Input {...register("phone")} placeholder="+54 11 1234 5678" />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continuar"}
      </Button>
    </form>
  );
}