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

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0A1628]">
      <Navbar />
      <article className="max-w-3xl mx-auto px-6 py-16 pt-24 text-[#F0F4F8]">
        <h1 className="text-4xl font-bold mb-4 text-[#CAFF00] font-[family-name:var(--font-bebas-neue)]">
          Política de Privacidad
        </h1>
        <p className="text-[#6B7F94] mb-8">Última actualización: {new Date().toLocaleDateString("es-AR")}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-[#CAFF00]">1. Responsable del tratamiento</h2>
          <p className="text-[#F0F4F8] mb-4">
            CanchaPro (&quot;nosotros&quot;, &quot;nuestro&quot;) es un servicio de SaaS para gestión de reservas
            de complejos deportivos. Tratamos tus datos personales de acuerdo con la
            Ley de Protección de Datos Personales (Ley 25.326) de Argentina.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-[#CAFF00]">2. Datos que recolectamos</h2>
          <p className="text-[#F0F4F8] mb-4">Recolectamos los siguientes datos personales:</p>
          <ul className="list-disc list-inside text-[#F0F4F8] space-y-2">
            <li>Datos de cuenta: nombre, email, contraseña encriptada</li>
            <li>Datos del complejo: nombre, dirección, teléfono, información de branding</li>
            <li>Datos de reservas: nombre del jugador, email, historial de reservas</li>
            <li>Datos de pago: procesados por Mercado Pago, nosotros no almacenamos datos de tarjeta</li>
            <li>Datos de uso: timestamps de reservas, acciones dentro de la plataforma</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-[#CAFF00]">3. Finalidad del tratamiento</h2>
          <p className="text-[#F0F4F8] mb-4">Utilizamos tus datos para:</p>
          <ul className="list-disc list-inside text-[#F0F4F8] space-y-2">
            <li>Proveer el servicio de reservas online</li>
            <li>Enviar confirmaciones y recordatorios por email</li>
            <li>Procesar pagos a través de Mercado Pago</li>
            <li>Mejorar la experiencia del usuario</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-[#CAFF00]">4. Tus derechos</h2>
          <p className="text-[#F0F4F8] mb-4">Tenés derecho a:</p>
          <ul className="list-disc list-inside text-[#F0F4F8] space-y-2">
            <li>Acceder a tus datos personales</li>
            <li>Rectificar datos inexactos</li>
            <li>Solicitar la eliminación de tus datos</li>
            <li>Oponerte al tratamiento</li>
          </ul>
          <p className="text-[#F0F4F8] mt-4">
            Para ejercer tus derechos, escribinos a{' '}
            <a href="mailto:privacy@canchapro.app" className="text-[#CAFF00] hover:underline">
              privacy@canchapro.app
            </a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-[#CAFF00]">5. Contacto</h2>
          <p className="text-[#F0F4F8]">CanchaPro - privacy@canchapro.app</p>
        </section>
      </article>
    </div>
  );
}