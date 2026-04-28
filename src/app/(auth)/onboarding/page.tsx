"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stepper } from "@/components/onboarding/stepper";
import { Step1ComplexData } from "@/components/onboarding/step1-complex-data";
import { Step2Courts } from "@/components/onboarding/step2-courts";
import { Step3Schedules } from "@/components/onboarding/step3-schedules";
import { Step4MercadoPago } from "@/components/onboarding/step4-mercado-pago";
import { Step5Complete } from "@/components/onboarding/step5-complete";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const STEPS = [
  { id: 1, label: "Complejo" },
  { id: 2, label: "Canchas" },
  { id: 3, label: "Horarios" },
  { id: 4, label: "Pago" },
  { id: 5, label: "Listo" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    step1: {} as Record<string, unknown>,
    step2: {} as Record<string, unknown>,
    step3: {} as Record<string, unknown>,
  });
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [subdomain, setSubdomain] = useState<string | null>(null);

  const handleStep1Complete = async (data: Record<string, unknown>) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/onboarding/step1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al guardar");
      const result = await res.json();
      setTenantId(result.tenantId);
      setSubdomain(result.subdomain);
      setFormData((prev) => ({ ...prev, step1: data }));
      setCurrentStep(2);
    } catch {
      toast.error("No se pudo guardar. Intentá de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Complete = async (data: Record<string, unknown>) => {
    if (!tenantId) return;
    setIsLoading(true);
    try {
      await fetch("/api/onboarding/step2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, ...data }),
      });
      setFormData((prev) => ({ ...prev, step2: data }));
      setCurrentStep(3);
    } catch {
      toast.error("No se pudo guardar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3Complete = async (data: Record<string, unknown>) => {
    if (!tenantId) return;
    setIsLoading(true);
    try {
      await fetch("/api/onboarding/step3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, ...data }),
      });
      setFormData((prev) => ({ ...prev, step3: data }));
      setCurrentStep(4);
    } catch {
      toast.error("No se pudo guardar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep4Complete = (data: Record<string, unknown>) => {
    setFormData((prev) => ({ ...prev, step4: data }));
    setCurrentStep(5);
  };

  return (
    <div className="min-h-screen bg-[#0A1628]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A1628]/90 backdrop-blur-md border-b border-[#1E3A5F]">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <Image src="/logo.svg" alt="CanchaPro" width={140} height={36} priority />
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button className="bg-transparent border border-[#1E3A5F] text-[#F0F4F8] hover:bg-[#1A2D47] font-bold cursor-pointer text-sm">
                  Salir
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <div className="max-w-2xl mx-auto pt-24 pb-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-[#CAFF00] font-[family-name:var(--font-bebas-neue)]">
            Configuración de tu complejo
          </h1>
          <p className="text-[#6B7F94] text-center">Completá los datos para empezar a recibir reservas</p>
        </div>

        <Stepper steps={STEPS} currentStep={currentStep} className="mb-8" />

        <div className="bg-[#1A2D47] border border-[#1E3A5F] rounded-xl p-6">
          {currentStep === 1 && (
            <Step1ComplexData onComplete={handleStep1Complete} isLoading={isLoading} />
          )}
          {currentStep === 2 && (
            <Step2Courts onComplete={handleStep2Complete} onBack={() => setCurrentStep(1)} isLoading={isLoading} />
          )}
          {currentStep === 3 && (
            <Step3Schedules onComplete={handleStep3Complete} onBack={() => setCurrentStep(2)} isLoading={isLoading} />
          )}
          {currentStep === 4 && (
            <Step4MercadoPago onComplete={handleStep4Complete} onBack={() => setCurrentStep(3)} />
          )}
          {currentStep === 5 && <Step5Complete tenantId={tenantId!} subdomain={subdomain!} />}
        </div>
      </div>
    </div>
  );
}