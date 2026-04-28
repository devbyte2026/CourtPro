"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ExternalLink } from "lucide-react";

interface Props {
  onComplete: (data: Record<string, unknown>) => void;
  onBack: () => void;
}

export function Step4MercadoPago({ onComplete, onBack }: Props) {
  const handleConnect = async () => {
    const callbackUrl = `${window.location.origin}/api/mercadopago/oauth/callback`;
    window.location.href = `https://auth.mercadopago.com.ar/authorization?client_id=${process.env.NEXT_PUBLIC_MP_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(callbackUrl)}`;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Conectá Mercado Pago</h2>
        <p className="text-muted-foreground">Vinculá tu cuenta de Mercado Pago para recibir pagos en tu complejo.</p>
      </div>

      <Card className="p-6 border-2 border-dashed">
        <CardContent className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-[#00B1EA] rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm0-8H9V7h6v2z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-medium">Mercado Pago</h3>
            <p className="text-sm text-muted-foreground">Recibí pagos con tarjeta, Pix o efectivo</p>
          </div>
          <Button onClick={handleConnect} className="bg-[#00B1EA] hover:bg-[#0099CC]">
            <ExternalLink className="h-4 w-4 mr-2" /> Conectar cuenta
          </Button>
          <p className="text-xs text-muted-foreground">Vas a ser redirigido a Mercado Pago para autorizar la conexión.</p>
        </CardContent>
      </Card>

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-medium mb-2">¿Qué permite esta conexión?</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" /> Procesar pagos con Checkout Pro</li>
          <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" /> Confirmación automática de reservas</li>
          <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" /> Reembolso automático si cancelás</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">Volver</Button>
        <Button variant="secondary" onClick={() => onComplete({})} className="flex-1">
          Omitir por ahora
        </Button>
      </div>
    </div>
  );
}