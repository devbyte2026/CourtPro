import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

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

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0A1628]">
      <Navbar />
      <article className="max-w-3xl mx-auto px-6 py-16 pt-24 text-[#F0F4F8]">
        <h1 className="text-4xl font-bold mb-4 text-[#CAFF00] font-[family-name:var(--font-bebas-neue)]">
          Términos y Condiciones
        </h1>
        <p className="text-[#6B7F94] mb-8">Última actualización: {new Date().toLocaleDateString("es-AR")}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-[#CAFF00]">1. Aceptación</h2>
          <p className="text-[#F0F4F8] mb-4">
            Al registrarte y usar CanchaPro, aceptás estos términos y condiciones.
            Si no estás de acuerdo, no uses el servicio.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-[#CAFF00]">2. Descripción del servicio</h2>
          <p className="text-[#F0F4F8] mb-4">
            CanchaPro es una plataforma SaaS que permite a complejos deportivos
            gestionar reservas online. No somos parte de la transacción entre el
            complejo y el jugador.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-[#CAFF00]">3. Obligaciones del dueño del complejo</h2>
          <ul className="list-disc list-inside text-[#F0F4F8] space-y-2">
            <li>Mantener información veraz y actualizada</li>
            <li>Respetar las políticas de cancelación publicadas</li>
            <li>No utilizar la plataforma para fines ilegales</li>
            <li>Gestionar los horarios según lo publicado</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-[#CAFF00]">4. Obligaciones del jugador</h2>
          <ul className="list-disc list-inside text-[#F0F4F8] space-y-2">
            <li>Respetar los horarios reservados</li>
            <li>Cancelar con la anticipación requerida por el complejo</li>
            <li>No realizar actividades ilegales en las instalaciones</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-[#CAFF00]">5. Política de cancelación</h2>
          <p className="text-[#F0F4F8] mb-4">
            Cada complejo define su propia política de cancelación, que será
            mostrada antes de confirmar la reserva. CanchaPro no es responsable
            de disputes entre el complejo y el jugador.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-[#CAFF00]">6. Limitación de responsabilidad</h2>
          <p className="text-[#F0F4F8] mb-4">
            CanchaPro no es responsable por daños directos o indirectos derivados
            del uso de la plataforma. Nuestra responsabilidad está limitada al
            monto pagado por el usuario en el último mes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-[#CAFF00]">7. Modificaciones</h2>
          <p className="text-[#F0F4F8] mb-4">
            Podemos modificar estos términos en cualquier momento. Los cambios
            serán publicados en esta página. El uso continuado del servicio
            constituye aceptación de los nuevos términos.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-[#CAFF00]">8. Contacto</h2>
          <p className="text-[#F0F4F8]">CanchaPro - legal@canchapro.app</p>
        </section>
      </article>
    </div>
  );
}