"use client";

import { useState } from "react";
import type { Tenant } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle } from "lucide-react";

interface Props {
  tenant: Tenant;
}

export function MercadoPagoConfig({ tenant }: Props) {
  const [loading, setLoading] = useState(false);
  const isConnected = !!(tenant.mp_access_token && tenant.mp_user_id);

  const handleConnect = () => {
    const callbackUrl = `${window.location.origin}/api/mercadopago/oauth/callback`;
    window.location.href = `https://auth.mercadopago.com.ar/authorization?client_id=${process.env.NEXT_PUBLIC_MP_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(callbackUrl)}`;
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tenant`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          mp_access_token: null,
          mp_refresh_token: null,
          mp_user_id: null,
          mp_token_expires_at: null,
        }),
      });
      if (!res.ok) throw new Error("Error al desconectar");
      window.location.reload();
    } catch {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mercado Pago</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <>
            <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg">
              <CheckCircle className="h-8 w-8 text-success" />
              <div>
                <p className="font-medium">Cuenta conectada</p>
                <p className="text-sm text-muted-foreground">Vas a recibir pagos en tu cuenta de Mercado Pago</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Tu cuenta de Mercado Pago está vinculada correctamente. Los pagos se acreditan automáticamente en tu cuenta.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleDisconnect}
                disabled={loading}
              >
                {loading ? "Desconectando..." : "Desconectar cuenta"}
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open("https://www.mercadopago.com.ar/my-account", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver cuenta MP
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="p-6 border-2 border-dashed rounded-lg text-center space-y-4">
              <div className="w-16 h-16 bg-[#00B1EA] rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm0-8H9V7h6v2z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Mercado Pago</h3>
                <p className="text-sm text-muted-foreground">Conectá tu cuenta para recibir pagos</p>
              </div>
              <Button onClick={handleConnect} className="bg-[#00B1EA] hover:bg-[#0099CC]">
                <ExternalLink className="h-4 w-4 mr-2" />
                Conectar cuenta
              </Button>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-medium">¿Qué permite esta conexión?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Checkout Pro para pagos online</li>
                <li>• Confirmación automática de reservas</li>
                <li>• Reembolso automático en cancelaciones</li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
