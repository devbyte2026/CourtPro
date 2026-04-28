"use client";

import { useState } from "react";
import type { Tenant, Court } from "@/types/database";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComplexBasicInfo } from "@/components/admin/config/complex-basic-info";
import { CourtsConfig } from "@/components/admin/config/courts-config";
import { SchedulesConfig } from "@/components/admin/config/schedules-config";
import { BrandingConfig } from "@/components/admin/config/branding-config";
import { MercadoPagoConfig } from "@/components/admin/config/mercadopago-config";
import { CancellationConfig } from "@/components/admin/config/cancellation-config";
import { DomainConfig } from "@/components/admin/config/domain-config";

interface Props {
  tenant: Tenant & { courts?: Court[] };
}

export function ConfigPage({ tenant }: Props) {
  const [activeTab, setActiveTab] = useState("complejo");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="complejo">Mi complejo</TabsTrigger>
          <TabsTrigger value="canchas">Canchas</TabsTrigger>
          <TabsTrigger value="horarios">Horarios</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="dominio">Dominio</TabsTrigger>
          <TabsTrigger value="pago">Mercado Pago</TabsTrigger>
          <TabsTrigger value="cancelacion">Cancelación</TabsTrigger>
        </TabsList>

        <TabsContent value="complejo">
          <ComplexBasicInfo tenant={tenant} />
        </TabsContent>

        <TabsContent value="canchas">
          <CourtsConfig tenant={tenant} />
        </TabsContent>

        <TabsContent value="horarios">
          <SchedulesConfig tenant={tenant} />
        </TabsContent>

        <TabsContent value="branding">
          <BrandingConfig tenant={tenant} />
        </TabsContent>

        <TabsContent value="dominio">
          <DomainConfig tenant={tenant} />
        </TabsContent>

        <TabsContent value="pago">
          <MercadoPagoConfig tenant={tenant} />
        </TabsContent>

        <TabsContent value="cancelacion">
          <CancellationConfig tenant={tenant} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
