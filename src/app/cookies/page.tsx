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

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-[#0A1628]">
      <Navbar />
      <article className="max-w-3xl mx-auto px-6 py-16 pt-24 text-[#F0F4F8]">
        <h1 className="text-4xl font-bold mb-4 text-[#CAFF00] font-[family-name:var(--font-bebas-neue)]">
          Política de Cookies
        </h1>
        <p className="text-[#6B7F94] mb-8">Última actualización: {new Date().toLocaleDateString("es-AR")}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-[#CAFF00]">1. ¿Qué son las cookies?</h2>
          <p className="text-[#F0F4F8] mb-4">
            Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo
            cuando visitás un sitio web. Se utilizan ampliamente para hacer que los sitios
            web funcionen de manera más eficiente, proporcionar una mejor experiencia de usuario
            y dar información a los propietarios del sitio.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-[#CAFF00]">2. Cómo usamos las cookies</h2>
          <p className="text-[#F0F4F8] mb-4">Usamos cookies para:</p>
          <ul className="list-disc list-inside text-[#F0F4F8] space-y-2">
            <li>Mantener tu sesión iniciada</li>
            <li>Recordar tus preferencias (idioma, configuración)</li>
            <li>Entender cómo usás nuestro sitio</li>
            <li>Mejorar nuestros servicios</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-[#CAFF00]">3. Tipos de cookies que usamos</h2>

          <h3 className="text-xl font-bold mb-2 text-[#F0F4F8]">Cookies esenciales</h3>
          <p className="text-[#F0F4F8] mb-4">
            Estas cookies son necesarias para que el sitio web funcione correctamente.
            Incluyen cookies para autenticación, seguridad y preferencias del usuario.
          </p>

          <h3 className="text-xl font-bold mb-2 text-[#F0F4F8]">Cookies de análisis</h3>
          <p className="text-[#F0F4F8] mb-4">
            Usamos PostHog para analizar cómo los usuarios interactúan con nuestro sitio.
            Esto nos ayuda a mejorar la experiencia del usuario. Estas cookies recopilan
            información anonimizada sobre el uso del sitio.
          </p>

          <h3 className="text-xl font-bold mb-2 text-[#F0F4F8]">Cookies de marketing</h3>
          <p className="text-[#F0F4F8]">
            No usamos cookies de marketing ni rastreo de terceros para publicidad.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-[#CAFF00]">4. Cookies de terceros</h2>
          <p className="text-[#F0F4F8] mb-4">Usamos los siguientes servicios de terceros que pueden设置 cookies:</p>
          <ul className="list-disc list-inside text-[#F0F4F8] space-y-2">
            <li><strong>Supabase:</strong> Para autenticación y base de datos</li>
            <li><strong>PostHog:</strong> Para análisis de uso (opcional, solo si aceptás cookies)</li>
            <li><strong>Mercado Pago:</strong> Para procesamiento de pagos (sus propias cookies aplican)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-[#CAFF00]">5. Cómo controlar las cookies</h2>
          <p className="text-[#F0F4F8] mb-4">
            Podés aceptar o rechazar cookies no esenciales cuando visitás nuestro sitio
            por primera vez. Además, podés configurar tu navegador para rechazar cookies
            o eliminar cookies existentes.
          </p>
          <p className="text-[#F0F4F8]">
            Tené en cuenta que bloquear cookies puede afectar la funcionalidad del sitio.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-[#CAFF00]">6. Cambios a esta política</h2>
          <p className="text-[#F0F4F8]">
            Podemos actualizar esta política de cookies ocasionalmente. Cualquier cambio
            será publicado en esta página.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-[#CAFF00]">7. Contacto</h2>
          <p className="text-[#F0F4F8]">
            Para preguntas sobre nuestra política de cookies, contactanos a:{' '}
            <a href="mailto:privacy@canchapro.app" className="text-[#CAFF00] hover:underline">
              privacy@canchapro.app
            </a>
          </p>
        </section>
      </article>
    </div>
  );
}