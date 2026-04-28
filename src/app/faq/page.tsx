import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "¿Cómo funciona CanchaPro?",
    answer: "CanchaPro es una plataforma SaaS que te permite gestionar las reservas de tu complejo deportivo online. Tus clientes pueden ver disponibilidad, reservar y pagar directamente desde tu página personalizada, sin intermediarios.",
  },
  {
    question: "¿Necesito conocimientos técnicos?",
    answer: "No. CanchaPro está diseñado para que cualquier persona pueda usarlo sin conocimientos técnicos. La configuración inicial toma menos de 10 minutos.",
  },
  {
    question: "¿Cómo recibo los pagos?",
    answer: "Integramos con Mercado Pago, el procesador de pagos más popular de Argentina. Los pagos van directamente a tu cuenta de Mercado Pago, sin intermediarios ni retención de fondos.",
  },
  {
    question: "¿Puedo usar mi propio dominio?",
    answer: "Sí, en los planes Pro y Premium puedes conectar tu propio dominio (ej: reservas.micomplejo.com). El plan Start usa el subdominio tucomplejo.canchapro.app.",
  },
  {
    question: "¿Qué pasa si un cliente no se presenta?",
    answer: "Podés marcar reservas como 'no show' desde el panel de administración. Según tu política de cancelación configurada, podés aplicar penalizaciones.",
  },
  {
    question: "¿Cómo funciona la lista de espera?",
    answer: "Cuando un horario está completo, los clientes pueden agregarse a la lista de espera. Cuando se cancela una reserva, el primero en la lista recibe una notificación automática.",
  },
  {
    question: "¿Puedo bloquear horarios?",
    answer: "Sí, podés bloquear horarios por mantenimiento, torneos o cualquier otro motivo. Los horarios bloqueados no aparecerán como disponibles.",
  },
  {
    question: "¿Hay límite de reservas?",
    answer: "No hay límite en la cantidad de reservas. Podés recibir reservas 24/7 sin costo adicional.",
  },
  {
    question: "¿Cómo funciona el plan gratuito?",
    answer: "El plan Start es gratuito y te permite tener 1 sede, hasta 3 canchas y reservas ilimitadas. Solo pagás la comisión de Mercado Pago (no la nuestra).",
  },
  {
    question: "¿Puedo cancelar mi suscripción?",
    answer: "Sí, podés cancelar cuando quieras desde el panel de administración. No hay compromisos ni Penalizaciones.",
  },
  {
    question: "¿Mis datos están seguros?",
    answer: "Sí. Usamos encriptación de grado militar, cumplimiento con GDPR y LGPD, y nunca compartimos tus datos con terceros.",
  },
  {
    question: "¿Ofrecen soporte?",
    answer: "El plan Pro incluye soporte por email. El plan Premium incluye soporte prioritario y acceso a nuestra comunidad de usuarios.",
  },
];

function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A1628]/90 backdrop-blur-md border-b border-[#1E3A5F]">
      <div className="max-w-6xl mx-auto px-4">
        <nav className="py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <Image src="/logo.svg" alt="CanchaPro" width={140} height={36} priority />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button className="bg-[#CAFF00] text-[#0A1628] hover:bg-[#B8FF00] font-bold cursor-pointer transition-all duration-300 shadow-[0_0_20px_rgba(202,255,0,0.4)]">
                Ingresar
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#0A1628]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-16 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-[#CAFF00] font-[family-name:var(--font-bebas-neue)]">
            Preguntas Frecuentes
          </h1>
          <p className="text-[#6B7F94]">
            Todo lo que necesitás saber sobre CanchaPro
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="bg-[#1A2D47] border-[#1E3A5F]">
              <CardContent className="p-6">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none font-medium text-[#F0F4F8]">
                    <span>{faq.question}</span>
                    <ChevronDown className="h-5 w-5 text-[#CAFF00] transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-4 text-[#6B7F94]">{faq.answer}</p>
                </details>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center p-8 bg-[#1A2D47] border border-[#1E3A5F] rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-[#F0F4F8]">¿No encontraste lo que buscabas?</h2>
          <p className="text-[#6B7F94] mb-4">
            Escribinos y te ayudamos a resolver cualquier duda.
          </p>
          <Link
            href="mailto:soporte@canchapro.app"
            className="text-[#CAFF00] underline hover:text-[#B8FF00] transition-colors"
          >
            soporte@canchapro.app
          </Link>
        </div>
      </div>
    </div>
  );
}