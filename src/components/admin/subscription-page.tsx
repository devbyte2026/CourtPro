"use client";

import { useState, useEffect } from "react";
import type { Tenant, Subscription } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Calendar, AlertCircle, CreditCard, Download, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "start",
    name: "Start",
    price: 10000,
    annualPrice: 96000,
    features: [
      "1 sede",
      "Hasta 3 canchas",
      "Reservas ilimitadas",
      "Página pública básica",
      "Email de confirmaciones",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 25000,
    annualPrice: 240000,
    features: [
      "1 sede",
      "Hasta 10 canchas",
      "Reservas ilimitadas",
      "Branding personalizado",
      "Email + WhatsApp",
      "Analíticas básicas",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 50000,
    annualPrice: 480000,
    features: [
      "Multi-sede",
      "Canchas ilimitadas",
      "Reservas ilimitadas",
      "Dominio propio",
      "Email + WhatsApp",
      "Analíticas avanzadas",
      "Soporte prioritario",
    ],
  },
];

interface Props {
  tenant: Tenant;
}

interface SubscriptionWithInvoice extends Subscription {
  invoices?: { id: string; amount: number; status: string; created_at: string }[];
}

export function SubscriptionPage({ tenant }: Props) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>(tenant.plan);
  const [isAnnual, setIsAnnual] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionWithInvoice | null>(null);
  const [loadingSub, setLoadingSub] = useState(true);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const res = await fetch(`/api/admin/subscription?tenantId=${tenant.id}`);
        if (res.ok) {
          const data = await res.json();
          setSubscription(data.subscription);
          if (data.subscription?.current_period_end) {
            const endDate = new Date(data.subscription.current_period_end);
            const now = new Date();
            const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            setIsAnnual(daysUntilEnd > 60);
          }
        }
      } catch {
        // ignore
      } finally {
        setLoadingSub(false);
      }
    }
    fetchSubscription();
  }, [tenant.id]);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: tenant.id, plan: selectedPlan, annual: isAnnual }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch {
      setLoading(false);
    }
  };

  const getDaysUntilExpiration = () => {
    if (!subscription?.current_period_end) return null;
    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    const days = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysUntilExpiration = getDaysUntilExpiration();
  const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 7 && daysUntilExpiration > 0;
  const isExpired = daysUntilExpiration !== null && daysUntilExpiration <= 0;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mi suscripción</h1>
          <p className="text-muted-foreground">
            Plan actual: <span className="font-medium capitalize">{tenant.plan}</span>
          </p>
        </div>
        {subscription && (
          <Badge variant={subscription.status === "active" ? "default" : "destructive"} className="capitalize">
            {subscription.status === "active" ? "Activo" : "Inactivo"}
          </Badge>
        )}
      </div>

      {subscription && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Período de facturación</p>
                  <p className="font-medium">
                    {subscription.current_period_start ? formatDate(subscription.current_period_start) : "—"} - {subscription.current_period_end ? formatDate(subscription.current_period_end) : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(isExpiringSoon && "border-yellow-500", isExpired && "border-red-500")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isExpired ? "bg-red-500/10" : isExpiringSoon ? "bg-yellow-500/10" : "bg-green-500/10"}`}>
                  {isExpired ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : isExpiringSoon ? (
                    <Clock className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <CreditCard className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Próximo vencimiento</p>
                  <p className="font-medium">
                    {daysUntilExpiration !== null && daysUntilExpiration > 0
                      ? `En ${daysUntilExpiration} día${daysUntilExpiration === 1 ? "" : "s"}`
                      : isExpired
                      ? "Vencido"
                      : "—"}
                  </p>
                </div>
              </div>
              {isExpiringSoon && !isExpired && (
                <p className="text-xs text-yellow-600 mt-2">Renová pronto para evitar interrupciones</p>
              )}
              {isExpired && (
                <p className="text-xs text-red-600 mt-2">Tu suscripción está vencida. Actualizá para continuar.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CreditCard className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado del pago</p>
                  <p className="font-medium capitalize">
                    {subscription.status === "active" ? "Pagado" : subscription.status}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center gap-3 p-1 bg-muted rounded-lg max-w-md">
        <button
          onClick={() => setIsAnnual(false)}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer flex-1",
            !isAnnual ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
          )}
        >
          Mensual
        </button>
        <button
          onClick={() => setIsAnnual(true)}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer flex-1",
            isAnnual ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
          )}
        >
          Anual
          <span className="ml-1 text-xs text-primary">-20%</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = tenant.plan === plan.id;
          const price = isAnnual ? plan.annualPrice / 12 : plan.price;
          return (
            <Card key={plan.id} className={cn(isCurrent && "border-primary")}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{plan.name}</span>
                  {isCurrent && <Badge variant="default">Actual</Badge>}
                </CardTitle>
                <CardDescription>{plan.features.length} funcionalidades</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-3xl font-bold">${Math.round(price).toLocaleString("es-AR")}</span>
                  <span className="text-muted-foreground">/mes</span>
                  {isAnnual && (
                    <p className="text-xs text-green-600 mt-1">
                      ${plan.annualPrice.toLocaleString("es-AR")}/año facturado anualmente
                    </p>
                  )}
                </div>

                <ul className="space-y-2">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {!isCurrent && (
                  <Button
                    variant={selectedPlan === plan.id ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setSelectedPlan(plan.id)}
                    disabled={loading}
                  >
                    {selectedPlan === plan.id ? "Seleccionado" : "Elegir plan"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedPlan !== tenant.plan && (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="font-medium">Confirmá el cambio de plan</p>
            <p className="text-sm text-muted-foreground">
              Vas a pasar al plan {PLANS.find((p) => p.id === selectedPlan)?.name}
              {isAnnual ? " (facturación anual)" : " (facturación mensual)"}
            </p>
          </div>
          <Button onClick={handleSubscribe} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar"}
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Facturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscription?.invoices && subscription.invoices.length > 0 ? (
            <div className="space-y-3">
              {subscription.invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">${invoice.amount.toLocaleString("es-AR")}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.created_at).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge variant={invoice.status === "paid" ? "default" : "secondary"} className="capitalize">
                    {invoice.status === "paid" ? "Pagada" : invoice.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay facturas disponibles todavía</p>
              <p className="text-sm">Las facturas se generarán cuando se procese tu primer pago</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h3 className="font-medium">Información de facturación</h3>
        <p className="text-sm text-muted-foreground">
          El cobro se realiza mensualmente o anualmente a través de Mercado Pago. Podés cancelar cuando quieras.
        </p>
        <p className="text-sm text-muted-foreground">
          Los precios están expresados en ARS (pesos argentinos) e incluyen IVA.
        </p>
        <p className="text-sm text-muted-foreground">
          Para cambiar tu método de pago o cancelar, contactanos a soporte@canchapro.app
        </p>
      </div>
    </div>
  );
}
