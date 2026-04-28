"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  CreditCard,
  BarChart3,
  Users,
  Smartphone,
  Check,
  Star,
  ArrowRight,
  ChevronRight,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollAnimation, useNavbarScroll } from "@/hooks/use-scroll-animation";

const COURT_LINES_SVG = `
<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="court-lines" x="0" y="0" width="120" height="80" patternUnits="userSpaceOnUse">
      <rect x="10" y="5" width="100" height="70" fill="none" stroke="#1E3A5F" stroke-width="0.5" opacity="0.4"/>
      <line x1="10" y1="40" x2="110" y2="40" stroke="#1E3A5F" stroke-width="0.5" opacity="0.4"/>
      <circle cx="60" cy="40" r="8" fill="none" stroke="#1E3A5F" stroke-width="0.5" opacity="0.4"/>
      <line x1="60" y1="5" x2="60" y2="32" stroke="#1E3A5F" stroke-width="0.5" opacity="0.4"/>
      <line x1="60" y1="48" x2="60" y2="75" stroke="#1E3A5F" stroke-width="0.5" opacity="0.4"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#court-lines)"/>
</svg>
`;

const navLinks = [
  { href: "#funciones", label: "Funciones" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#precios", label: "Planes" },
  { href: "#testimonios", label: "Testimonios" },
];

const features = [
  {
    icon: Calendar,
    title: "Reservas 24/7",
    description: "Tus clientes reservan desde el celular, a cualquier hora. Sin intermediarios.",
  },
  {
    icon: CreditCard,
    title: "Cobrá online",
    description: "Integración directa con Mercado Pago. El dinero va a tu cuenta.",
  },
  {
    icon: BarChart3,
    title: "Dashboard en tiempo real",
    description: "Sabé cuántos turnos tenés, cuánto facturaste y quién es tu mejor cliente.",
  },
  {
    icon: Users,
    title: "Lista de espera",
    description: "Cuando se libere un horario, avisamos automáticamente al primero en lista.",
  },
  {
    icon: Smartphone,
    title: "Tu app propia",
    description: "Página pública con tu marca, tu logo, tus colores. Instalable como app.",
  },
  {
    icon: Shield,
    title: "Sin contrato",
    description: "Cancela cuando quieras. Sin mínimos, sin cargos ocultos.",
  },
];

const steps = [
  {
    number: "01",
    title: "Registrate",
    description: "Creá tu cuenta en 2 minutos. Sin tarjeta de crédito.",
  },
  {
    number: "02",
    title: "Configurá",
    description: "Cargá tus canchas, horarios y precios. Conectá Mercado Pago.",
  },
  {
    number: "03",
    title: "Recibe reservas",
    description: "Compartí tu link y empezá a recibir reservas automáticamente.",
  },
];

const plans = [
  {
    name: "Start",
    monthlyPrice: 10000,
    annualPrice: 96000,
    description: "Ideal para comenzar",
    features: [
      "1 sede",
      "Hasta 3 canchas",
      "Reservas ilimitadas",
      "Email de confirmaciones",
    ],
  },
  {
    name: "Pro",
    monthlyPrice: 25000,
    annualPrice: 240000,
    description: "El más popular",
    features: [
      "1 sede",
      "Hasta 10 canchas",
      "Branding personalizado",
      "Email + WhatsApp",
      "Analíticas básicas",
    ],
    highlighted: true,
  },
  {
    name: "Premium",
    monthlyPrice: 50000,
    annualPrice: 480000,
    description: "Para complejos grandes",
    features: [
      "Multi-sede",
      "Canchas ilimitadas",
      "Dominio propio",
      "Email + WhatsApp",
      "Analíticas avanzadas",
      "Soporte prioritario",
    ],
  },
];

const testimonials = [
  {
    name: "Martín Rodriguez",
    role: "Dueño",
    complex: "Complejo Deportivo Norte",
    avatar: "MR",
    rating: 5,
    text: "Desde que usamos CanchaPro, nuestras reservas aumentaron un 40%. Los clientes adoran la facilidad de reservar desde el celular.",
  },
  {
    name: "Laura García",
    role: "Gerente",
    complex: "Club Atlético Sur",
    avatar: "LG",
    rating: 5,
    text: "La integración con Mercado Pago fue un cambio de juego. Ya no tenemos problemas con cobros ni con clientes que no aparecen.",
  },
  {
    name: "Carlos Mendoza",
    role: "Propietario",
    complex: "Sports Center Buenos Aires",
    avatar: "CM",
    rating: 5,
    text: "El dashboard me permite ver en tiempo real cómo está mi complejo. Es increíble tener todo controlado desde el celular.",
  },
];

const sports = ["FUT", "PAD", "VOL"];

function useCountUp(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasStarted = useRef(false);

  const animateCount = () => {
    const startTime = performance.now();

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  };

  useEffect(() => {
    if (!startOnView) {
      animateCount();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          animateCount();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [startOnView, animateCount]);

  return { count, ref };
}

function StatCard({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(value);

  return (
    <div className="text-center scroll-animate">
      <span ref={ref} className="text-5xl md:text-6xl lg:text-7xl font-black text-cancha-lima font-[family-name:var(--font-bebas-neue)]">
        {count.toLocaleString("es-AR")}
      </span>
      <span className="text-5xl md:text-6xl lg:text-7xl font-black text-cancha-lima font-[family-name:var(--font-bebas-neue)]">
        {suffix}
      </span>
      <p className="text-slate-300 mt-3 text-lg font-medium">{label}</p>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`p-6 rounded-lg bg-cancha-card border border-cancha-border transition-all duration-300 cursor-pointer hover:border-cancha-lima hover:glow-lima-hover scroll-animate ${
        isVisible ? "visible" : ""
      }`}
    >
      <div className="w-12 h-12 rounded-lg bg-cancha-hero flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-cancha-lima" />
      </div>
      <h3 className="font-bold text-lg text-white mb-2">{title}</h3>
      <p className="text-slate-300 font-medium text-base">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  isLast,
  delay,
}: {
  number: string;
  title: string;
  description: string;
  isLast: boolean;
  delay: number;
}) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center text-center relative scroll-animate ${isVisible ? "visible" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {!isLast && (
        <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-cancha-lima to-transparent" />
      )}
      <div className="w-16 h-16 rounded-lg bg-cancha-hero border-2 border-cancha-lima flex items-center justify-center mb-4">
        <span className="text-xl font-black text-cancha-lima font-[family-name:var(--font-bebas-neue)]">{number}</span>
      </div>
      <h3 className="font-bold text-xl text-cancha-texto mb-2">{title}</h3>
      <p className="text-slate-300 font-medium text-sm max-w-xs">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  monthlyPrice,
  annualPrice,
  description,
  features,
  highlighted,
  isAnnual,
  delay,
}: {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  highlighted?: boolean;
  isAnnual: boolean;
  delay: number;
}) {
  const price = isAnnual ? annualPrice / 12 : monthlyPrice;
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`p-6 rounded-lg relative transition-all duration-300 cursor-pointer scroll-animate ${
        isVisible ? "visible" : ""
      } ${
        highlighted
          ? "bg-cancha-card border-2 border-cancha-lima glow-lima"
          : "bg-cancha-card border border-cancha-border hover:border-cancha-lima"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-cancha-lima text-cancha-hero text-xs font-bold px-3 py-1 rounded-full uppercase">
            Más elegido
          </span>
        </div>
      )}
      <div className="mb-4">
        <h3 className="font-black text-lg text-cancha-texto font-[family-name:var(--font-bebas-neue)]">{name}</h3>
        <p className="text-sm text-slate-300">{description}</p>
      </div>
      <div className="mb-6">
        <span className="text-4xl font-black text-cancha-texto font-[family-name:var(--font-bebas-neue)]">
          ${price.toLocaleString("es-AR")}
        </span>
        <span className="text-sm text-slate-300">/mes</span>
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-cancha-lima shrink-0" />
            <span className="text-cancha-texto">{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        className={`w-full font-bold cursor-pointer transition-all duration-300 ${
          highlighted
            ? "bg-cancha-lima text-cancha-hero hover:bg-cancha-lima-hover glow-lima-cta"
            : "bg-transparent border border-cancha-lima text-cancha-lima hover:bg-cancha-lima hover:text-cancha-hero"
        }`}
        variant={highlighted ? "default" : "outline"}
      >
        Elegir {name}
      </Button>
    </div>
  );
}

function TestimonialCard({
  name,
  role,
  complex,
  avatar,
  rating,
  text,
  delay,
}: {
  name: string;
  role: string;
  complex: string;
  avatar: string;
  rating: number;
  text: string;
  delay: number;
}) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`p-6 rounded-lg bg-cancha-card border border-cancha-border transition-all duration-300 cursor-pointer hover:border-cancha-lima scroll-animate ${
        isVisible ? "visible" : ""
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-cancha-hero border border-cancha-border flex items-center justify-center font-bold text-cancha-lima">
          {avatar}
        </div>
        <div>
          <h4 className="font-bold text-white">{name}</h4>
          <p className="text-sm text-slate-300 font-medium">
            {role}, {complex}
          </p>
        </div>
      </div>
      <div className="flex gap-1 mb-3">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-cancha-lima text-cancha-lima" />
        ))}
      </div>
      <p className="text-slate-300 font-medium text-sm">{text}</p>
    </div>
  );
}

function AnimatedSection({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id={id} ref={ref as React.RefObject<HTMLElement>} className={`scroll-animate ${isVisible ? "visible" : ""} ${className}`}>
      {children}
    </section>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const scrolled = useNavbarScroll();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      document.documentElement.classList.add("reduce-motion");
    }
  }, []);

  return (
    <div className="min-h-screen bg-cancha-hero text-cancha-texto">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-cancha-hero/80 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4">
          <nav className="border border-cancha-border rounded-lg px-6 py-4 flex items-center justify-between transition-all duration-300 bg-cancha-hero/90 backdrop-blur-md">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <Image src="/logo.svg" alt="CanchaPro" width={140} height={36} priority />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-slate-300 font-semibold tracking-wide hover:text-[#CAFF00] transition-colors duration-150 cursor-pointer"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm text-cancha-lima hover:text-cancha-lima-hover cursor-pointer transition-colors font-bold"
              >
                Login
              </Link>
              <Link href="/signup">
                <Button className="bg-cancha-lima text-cancha-hero hover:bg-cancha-lima-hover font-bold cursor-pointer hidden sm:flex transition-all duration-300 glow-lima-cta">
                  Crear cuenta
                </Button>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 cursor-pointer text-cancha-texto"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </nav>

          {mobileMenuOpen && (
            <div className="md:hidden mt-2 bg-cancha-hero/90 backdrop-blur-md border border-cancha-border rounded-lg p-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-sm text-slate-300 hover:text-cancha-texto cursor-pointer transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-3 border-cancha-border" />
              <Link
                href="/login"
                className="block py-3 text-sm text-cancha-lima cursor-pointer font-bold"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </header>

      <main>
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
          <div
            className="absolute inset-0 opacity-[0.06]"
            dangerouslySetInnerHTML={{ __html: COURT_LINES_SVG }}
          />

          <div className="absolute inset-0 bg-gradient-to-b from-cancha-hero via-transparent to-cancha-hero" />

          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 animate-gradient"
              style={{
                background: "radial-gradient(ellipse at 50% 50%, rgba(202, 255, 0, 0.15) 0%, rgba(10, 22, 40, 0) 50%)",
              }}
            />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cancha-lima/10 border border-cancha-lima/30 mb-8 scroll-animate visible">
              <span className="w-2 h-2 rounded-full bg-cancha-lima animate-pulse" />
              <span className="text-xs font-bold text-cancha-lima uppercase tracking-wider">
                Reservas Online · AR
              </span>
            </div>

            <h1 className="text-[clamp(4rem,10vw,9rem)] font-black mb-6 leading-none tracking-[-0.02em] font-[family-name:var(--font-bebas-neue)] scroll-animate visible">
              <span className="text-cancha-texto">TU CANCHA,</span>
              <br />
              <span className="text-cancha-lima">CUANDO QUIERAS</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8 font-medium scroll-animate visible">
              Software de reservas online para complejos deportivos. Tus clientes reservan,
              vos cobrás, nosotros automatizamos todo.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-cancha-lima text-cancha-hero hover:bg-cancha-lima-hover font-bold cursor-pointer rounded-lg px-8 py-6 text-lg transition-all duration-300 glow-lima-cta scroll-animate visible"
                >
                  Reservar ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#funciones">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-cancha-lima text-cancha-lima hover:bg-cancha-lima hover:text-cancha-hero font-bold cursor-pointer rounded-lg px-8 py-6 text-lg bg-transparent transition-all duration-300 scroll-animate visible"
                >
                  Ver funciones
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-4 scroll-animate visible">
              {sports.map((sport) => (
                <span
                  key={sport}
                  className="px-4 py-2 rounded-full bg-cancha-card border border-cancha-border text-cancha-lima text-xs font-bold uppercase tracking-widest"
                >
                  {sport}
                </span>
              ))}
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronRight className="h-6 w-6 text-slate-300 rotate-90" />
          </div>
        </section>

        <AnimatedSection className="py-20 px-4 bg-cancha-section">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <StatCard value={2500} suffix="+" label="Complejos activos" />
              <StatCard value={150000} suffix="+" label="Reservas mensuales" />
              <StatCard value={98} suffix="%" label="Satisfacción de usuarios" />
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection id="como-funciona" className="py-20 px-4 bg-cancha-hero">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4 text-cancha-texto font-[family-name:var(--font-bebas-neue)]">
                COMENZA EN 3 PASOS
              </h2>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto font-medium">
                Configurá tu complejo en minutos, sin conocimientos técnicos
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <StepCard key={i} {...step} isLast={i === steps.length - 1} delay={i * 100} />
              ))}
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection id="funciones" className="py-20 px-4 bg-cancha-section">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4 text-cancha-texto font-[family-name:var(--font-bebas-neue)]">
                TODO LO QUE NECESITAS
              </h2>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto font-medium">
                Herramientas diseñadas para simplificar la gestión de tu complejo deportivo
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <FeatureCard key={i} {...feature} />
              ))}
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection id="precios" className="py-20 px-4 bg-cancha-hero">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black mb-4 text-cancha-texto font-[family-name:var(--font-bebas-neue)]">
                PLANES SIMPLES
              </h2>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8 font-medium">
                Elegí el plan que mejor se adapte a tu complejo
              </p>
              <div className="inline-flex items-center gap-3 p-1 bg-cancha-card rounded-lg">
                <button
                  onClick={() => setIsAnnual(false)}
                  className={`px-5 py-2 rounded-md text-sm font-bold transition-colors cursor-pointer ${
                    !isAnnual
                      ? "bg-cancha-lima text-cancha-hero"
                      : "text-slate-300 hover:text-cancha-texto"
                  }`}
                >
                  Mensual
                </button>
                <button
                  onClick={() => setIsAnnual(true)}
                  className={`px-5 py-2 rounded-md text-sm font-bold transition-colors cursor-pointer ${
                    isAnnual
                      ? "bg-cancha-lima text-cancha-hero"
                      : "text-slate-300 hover:text-cancha-texto"
                  }`}
                >
                  Anual
                  <span className="ml-2 text-xs text-cancha-lima">-20%</span>
                </button>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto relative">
              {plans.map((plan, i) => (
                <PricingCard key={i} {...plan} isAnnual={isAnnual} delay={i * 100} />
              ))}
            </div>
            <p className="text-center text-sm text-slate-300 mt-8 font-medium">
              Todos los precios en ARS. Facturación mensual o anual.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection id="testimonios" className="py-20 px-4 bg-cancha-section">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4 text-cancha-texto font-[family-name:var(--font-bebas-neue)]">
                LO QUE DICEN NUESTROS CLIENTES
              </h2>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto font-medium">
                Miles de complejos ya confían en CanchaPro
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, i) => (
                <TestimonialCard key={i} {...testimonial} delay={i * 100} />
              ))}
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="py-20 px-4 bg-cancha-hero">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-cancha-texto font-[family-name:var(--font-bebas-neue)]">
              EMPEZA A GESTIONAR TU COMPLEJO HOY
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto font-medium">
              Registrate gratis y comenzá a recibir reservas en menos de 5 minutos.
              Sin tarjeta de crédito.
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-cancha-lima text-cancha-hero hover:bg-cancha-lima-hover font-bold cursor-pointer rounded-lg px-12 py-6 text-xl transition-all duration-300 glow-lima-cta"
              >
                Crear mi cuenta gratis
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </AnimatedSection>
      </main>

      <footer className="border-t border-cancha-border py-12 px-4 bg-cancha-hero">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Image src="/logo.svg" alt="CanchaPro" width={120} height={30} />
              <p className="text-sm text-slate-300 mt-2 font-medium">
                Software de reservas online para complejos deportivos.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-cancha-texto mb-4">Producto</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <Link href="#funciones" className="hover:text-cancha-texto cursor-pointer transition-colors font-medium">
                    Funciones
                  </Link>
                </li>
                <li>
                  <Link href="#precios" className="hover:text-cancha-texto cursor-pointer transition-colors font-medium">
                    Precios
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-cancha-texto mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <Link href="#" className="hover:text-cancha-texto cursor-pointer transition-colors font-medium">
                    Sobre nosotros
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-cancha-texto cursor-pointer transition-colors font-medium">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-cancha-texto mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <Link href="/legal/privacidad" className="hover:text-cancha-texto cursor-pointer transition-colors font-medium">
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/legal/terminos" className="hover:text-cancha-texto cursor-pointer transition-colors font-medium">
                    Términos
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-cancha-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-300 font-medium">CanchaPro 2025. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}