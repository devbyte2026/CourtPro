"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, QrCode, ExternalLink } from "lucide-react";
import { useState } from "react";

interface Props {
  tenantId: string;
  subdomain: string;
}

export function Step5Complete({ tenantId, subdomain }: Props) {
  const [copied, setCopied] = useState(false);
  const subdomainUrl = `https://${subdomain}.canchapro.app`;

  const copyLink = () => {
    navigator.clipboard.writeText(subdomainUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">¡Tu complejo está listo!</h2>
        <p className="text-muted-foreground">Ya podés empezar a recibir reservas. Compartí el enlace con tus clientes.</p>
      </div>

      <Card className="p-6">
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-2 p-4 bg-muted rounded-lg">
            <span className="font-mono text-lg">{subdomainUrl}</span>
            <button onClick={copyLink} className="p-2 hover:bg-background rounded transition-colors">
              {copied ? <Check className="h-5 w-5 text-success" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>

          <Button variant="outline" className="w-full">
            <QrCode className="h-4 w-4 mr-2" /> Descargar QR
          </Button>

          <Button onClick={() => window.open(subdomainUrl, "_blank")} className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" /> Ver página pública
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Próximos pasos:</p>
        <ul className="text-sm text-left space-y-1 max-w-sm mx-auto">
          <li>• Configurar horarios desde el panel admin</li>
          <li>• Ajustar precios y reglas de cancelación</li>
          <li>• Personalizar el diseño de tu página pública</li>
        </ul>
      </div>

      <Button onClick={() => window.location.href = "/admin"} className="w-full">
        Ir al panel de administración
      </Button>
    </div>
  );
}