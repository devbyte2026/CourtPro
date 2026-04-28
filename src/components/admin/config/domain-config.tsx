"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Globe, Loader2, Trash2 } from "lucide-react";
import type { Tenant } from "@/types/database";

interface Props {
  tenant: Tenant;
}

export function DomainConfig({ tenant }: Props) {
  const [customDomain, setCustomDomain] = useState(tenant.custom_domain || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verificationData, setVerificationData] = useState<{
    token: string;
    instructions: { type: string; host: string; value: string; description: string };
  } | null>(null);
  const [verified, setVerified] = useState(!!tenant.domain_verified_at);

  const handleSetDomain = async () => {
    if (!customDomain.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          action: "set_domain",
          customDomain: customDomain.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al configurar dominio");
        return;
      }

      setVerificationData(data);
      setSuccess("Dominio configurado. Completá la verificación DNS.");
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          action: "verify",
        }),
      });

      const data = await res.json();

      if (data.verified) {
        setVerified(true);
        setSuccess("Dominio verificado correctamente");
        setVerificationData(null);
      } else if (data.instructions) {
        setVerificationData(data);
        setError("Aún no se verificó el dominio. Asegurate de agregar el registro CNAME.");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDomain = async () => {
    if (!confirm("¿Estás seguro de remover el dominio personalizado?")) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          action: "remove_domain",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al remover dominio");
        return;
      }

      setCustomDomain("");
      setVerificationData(null);
      setVerified(false);
      setSuccess("Dominio removido");
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Dominio personalizado
          </CardTitle>
          <CardDescription>
            Usá tu propio dominio (ej: reservas.micomplejo.com) en lugar del subdominio de CanchaPro.
            Solo disponible en plan Pro y Premium.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tenant.plan === "start" && (
            <Alert>
              <AlertDescription>
                El dominio personalizado está disponible en planes Pro y Premium.{" "}
                <Link href="/admin/suscripcion" className="underline">
                  Actualizá tu plan
                </Link>
                .
              </AlertDescription>
            </Alert>
          )}

          {tenant.plan !== "start" && (
            <>
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="customDomain">Dominio personalizado</Label>
                  <Input
                    id="customDomain"
                    placeholder="reservas.tucomplejo.com"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button onClick={handleSetDomain} disabled={loading || !customDomain.trim()}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {verificationData && (
                <div className="space-y-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium">Pasos para verificar tu dominio:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Ingresá a tu proveedor DNS (GoDaddy, Namecheap, Cloudflare, etc.)</li>
                    <li>
                      Agregá un registro CNAME:
                      <ul className="ml-6 mt-1 space-y-1">
                        <li>
                          <strong>Host:</strong> <code className="bg-background px-1 rounded">{verificationData.instructions.host}</code>
                        </li>
                        <li>
                          <strong>Valor:</strong> <code className="bg-background px-1 rounded">{verificationData.instructions.value}</code>
                        </li>
                      </ul>
                    </li>
                    <li>Guardá el registro y esperá unos minutos (puede tardar hasta 24h)</li>
                    <li>Volvé aquí y hacé clic en "Verificar"</li>
                  </ol>

                  <div className="flex gap-2">
                    <Button onClick={handleVerify} disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verificar"}
                    </Button>
                  </div>
                </div>
              )}

              {verified && (
                <Alert className="border-green-500 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Tu dominio está verificado y activo.
                    {tenant.custom_domain && (
                      <span className="block mt-1">
                        Visitá <a href={`https://${tenant.custom_domain}`} className="underline" target="_blank" rel="noopener">{tenant.custom_domain}</a>
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {tenant.custom_domain && verified && (
                <div className="pt-4 border-t">
                  <Button variant="destructive" size="sm" onClick={handleRemoveDomain} disabled={loading}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover dominio
                  </Button>
                </div>
              )}
            </>
          )}

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Tu subdominio actual</h4>
            <p className="text-sm text-muted-foreground">
              {tenant.subdomain}.{process.env.NEXT_PUBLIC_APP_DOMAIN || "canchapro.app"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
