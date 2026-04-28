"use client";

import { useState } from "react";
import type { Tenant } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  tenant: Tenant;
}

export function BrandingConfig({ tenant }: Props) {
  const branding = tenant.branding_config as { primary_color?: string; secondary_color?: string; logo_url?: string; cover_url?: string } | null || {};
  const [form, setForm] = useState({
    primary_color: branding.primary_color || "#078930",
    secondary_color: branding.secondary_color || "#00AEEF",
    logo_url: branding.logo_url || "",
    cover_url: branding.cover_url || "",
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tenant`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          branding_config: {
            primary_color: form.primary_color,
            secondary_color: form.secondary_color,
            logo_url: form.logo_url || null,
            cover_url: form.cover_url || null,
          },
        }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      toast.success("Branding actualizado");
    } catch {
      toast.error("No se pudieron guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalización visual</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Color principal</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={form.primary_color}
                onChange={(e) => setForm((f) => ({ ...f, primary_color: e.target.value }))}
                className="h-10 w-10 rounded border cursor-pointer"
              />
              <Input
                value={form.primary_color}
                onChange={(e) => setForm((f) => ({ ...f, primary_color: e.target.value }))}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Color secundario</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={form.secondary_color}
                onChange={(e) => setForm((f) => ({ ...f, secondary_color: e.target.value }))}
                className="h-10 w-10 rounded border cursor-pointer"
              />
              <Input
                value={form.secondary_color}
                onChange={(e) => setForm((f) => ({ ...f, secondary_color: e.target.value }))}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>URL del logo</Label>
          <Input
            value={form.logo_url}
            onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))}
            placeholder="https://..."
          />
          {form.logo_url && (
            <img src={form.logo_url} alt="Logo preview" className="h-12 w-12 rounded-lg object-contain bg-muted p-1" />
          )}
        </div>

        <div className="space-y-2">
          <Label>URL de foto de portada</Label>
          <Input
            value={form.cover_url}
            onChange={(e) => setForm((f) => ({ ...f, cover_url: e.target.value }))}
            placeholder="https://..."
          />
          {form.cover_url && (
            <div className="h-32 rounded-lg bg-muted bg-cover bg-center" style={{ backgroundImage: `url(${form.cover_url})` }} />
          )}
        </div>

        <Button onClick={onSubmit} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar branding"}
        </Button>
      </CardContent>
    </Card>
  );
}
