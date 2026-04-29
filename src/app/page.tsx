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
  ChevronDown,
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
    monthlyPrice: 30000,
    annualPrice: 288000,
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
    monthlyPrice: 50000,
    annualPrice: 480000,
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
    monthlyPrice: 90000,
    annualPrice: 864000,
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
      className={`p-6 rounded-2xl bg-cancha-card border border-cancha-border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:border-[#CAFF00] hover:shadow-[0_0_25px_rgba(202,255,0,0.15)] scroll-animate ${
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
      className={`p-6 rounded-2xl relative transition-all duration-300 cursor-pointer scroll-animate ${
        isVisible ? "visible" : ""
      } ${
        highlighted
          ? "bg-cancha-card border-2 border-cancha-lima glow-lima"
          : "bg-cancha-card border border-cancha-border hover:-translate-y-1 hover:border-[#CAFF00] hover:shadow-[0_0_25px_rgba(202,255,0,0.15)]"
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
      className={`p-6 rounded-2xl bg-cancha-card border border-cancha-border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:border-[#CAFF00] hover:shadow-[0_0_25px_rgba(202,255,0,0.15)] scroll-animate ${
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

function AnimatedSection({ children, className = "", id, style }: { children: React.ReactNode; className?: string; id?: string; style?: React.CSSProperties }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id={id} ref={ref as React.RefObject<HTMLElement>} className={`scroll-animate ${isVisible ? "visible" : ""} ${className}`} style={style}>
      {children}
    </section>
  );
}

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, inView };
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A1628]/95 backdrop-blur-md border-b border-[#1E3A5F]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
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

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[#CAFF00] font-semibold cursor-pointer">
              Login
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link href="/signup" className="hidden md:block bg-[#CAFF00] text-[#0A1628] font-black px-5 py-2 rounded-lg">
              Crear cuenta
            </Link>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-16 z-40 bg-[#0A1628]/98 backdrop-blur-md border-t border-[#1E3A5F] px-4 py-4 overflow-hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-slate-300 hover:text-[#CAFF00] cursor-pointer font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-3 border-[#1E3A5F]" />
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block py-3 text-[#CAFF00] font-semibold">
              Login
            </Link>
            <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="block py-3 text-white font-semibold">
              Crear cuenta
            </Link>
          </div>
        )}
      </nav>

      <main>
        <section className="relative min-h-[100svh] md:min-h-screen flex flex-col items-center justify-center overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 0 }}
          >
            <source src="/videos/hero-futbol.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-[#0A1628]/60" style={{ zIndex: 1 }} />

          <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" style={{ zIndex: 2 }} viewBox="0 0 1440 900" fill="none" stroke="#CAFF00" strokeWidth="0.8" preserveAspectRatio="xMidYMid slice">
            <rect x="200" y="100" width="1040" height="700" />
            <line x1="720" y1="100" x2="720" y2="800" />
            <circle cx="720" cy="450" r="120" />
            <rect x="400" y="100" width="640" height="180" />
            <rect x="400" y="620" width="640" height="180" />
            <line x1="200" y1="450" x2="1240" y2="450" />
          </svg>

          <div className="relative text-center px-6 max-w-5xl mx-auto" style={{ zIndex: 3 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#CAFF00]/10 border border-[#CAFF00]/30 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#CAFF00] animate-pulse" />
              <span className="text-xs font-bold text-[#CAFF00] uppercase tracking-wider">RESERVAS ONLINE · AR</span>
            </span>
            <h1 className="text-[clamp(3rem,10vw,8rem)] font-black text-white leading-none tracking-tight font-[family-name:var(--font-bebas-neue)]">
              TU CANCHA,
            </h1>
            <h1 className="text-[clamp(3rem,10vw,8rem)] font-black text-[#CAFF00] leading-none tracking-tight mb-6 font-[family-name:var(--font-bebas-neue)]">
              CUANDO QUIERAS
            </h1>
            <p className="text-lg md:text-xl text-slate-300 font-medium max-w-xl mx-auto mb-8">
              Software de reservas online para complejos deportivos.
            </p>
            <div className="flex gap-4 flex-wrap justify-center mb-8">
              <Link href="/signup">
                <button className="bg-[#CAFF00] text-[#0A1628] font-black px-8 py-4 rounded-xl text-lg hover:bg-[#B8FF00] transition-all shadow-[0_0_20px_rgba(202,255,0,0.4)] cursor-pointer">
                  Reservar ahora →
                </button>
              </Link>
              <Link href="#funciones">
                <button className="border-2 border-[#CAFF00] text-[#CAFF00] bg-transparent font-bold px-8 py-4 rounded-xl text-lg hover:bg-[#CAFF00]/10 transition-all cursor-pointer">
                  Ver funciones
                </button>
              </Link>
            </div>
            <div className="flex gap-3 justify-center">
              {['FUT', 'PAD', 'VÓL'].map((s) => (
                <span key={s} className="text-xs font-bold text-[#CAFF00] border border-[#CAFF00]/30 bg-[#CAFF00]/10 px-4 py-2 rounded-full tracking-widest">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" style={{ zIndex: 3 }}>
            <ChevronDown className="h-7 w-7 text-[#CAFF00]" />
          </div>
        </section>

        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 0 }}
          >
            <source src="/videos/hero-pade.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#0A1628]/55" style={{ zIndex: 1 }} />

          <div className="relative grid grid-cols-3 gap-4 md:gap-16 text-center max-w-4xl mx-auto px-6 py-20" style={{ zIndex: 2 }}>
            <div>
              <div className="text-3xl md:text-6xl font-black text-[#CAFF00] leading-none">500+</div>
              <div className="text-white font-semibold mt-2 text-xs md:text-lg">Complejos activos</div>
            </div>
            <div>
              <div className="text-3xl md:text-6xl font-black text-[#CAFF00] leading-none">50k+</div>
              <div className="text-white font-semibold mt-2 text-xs md:text-lg">Reservas mensuales</div>
            </div>
            <div>
              <div className="text-3xl md:text-6xl font-black text-[#CAFF00] leading-none">98%</div>
              <div className="text-white font-semibold mt-2 text-xs md:text-lg">Satisfacción</div>
            </div>
          </div>
        </section>

        <div className="h-16 bg-gradient-to-b from-transparent to-[#0A1628]" />

        <section id="como-funciona" className="relative py-24 overflow-hidden">
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" style={{ zIndex: 0 }}>
            <source src="/videos/como-funciona.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#0A1628]/82" style={{ zIndex: 1 }} />
          <div className="relative max-w-6xl mx-auto px-6" style={{ zIndex: 2 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-black mb-4 text-[#CAFF00] font-[family-name:var(--font-bebas-neue)]">
                  COMENZA EN 3 PASOS
                </h2>
                <p className="text-slate-300 text-lg mb-10 font-medium">
                  Configurá tu complejo en minutos, sin conocimientos técnicos
                </p>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#CAFF00] text-[#0A1628] flex items-center justify-center font-black text-lg">1</div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Registrá tu complejo</h3>
                      <p className="text-slate-400 font-medium mt-1">Cargá datos básicos y horarios de atención</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#CAFF00] text-[#0A1628] flex items-center justify-center font-black text-lg">2</div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Configurá canchas y precios</h3>
                      <p className="text-slate-400 font-medium mt-1">Definí canchas, deportes, tarifas y reglas de reserva</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#CAFF00] text-[#0A1628] flex items-center justify-center font-black text-lg">3</div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Compartí y empezá a reservar</h3>
                      <p className="text-slate-400 font-medium mt-1">Recibí reservas online y gestioná todo desde tu panel</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="h-16 bg-gradient-to-b from-transparent to-[#0A1628]" />

        <div id="funciones" className="relative overflow-hidden">
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src="/videos/features-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#0A1628]/85" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4 text-cancha-texto font-[family-name:var(--font-bebas-neue)]">
                TODO LO QUE NECESITAS
              </h2>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto font-medium">
                Herramientas diseñadas para simplificar la gestión de tu complejo deportivo
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, i) => (
                <FeatureCard key={i} {...feature} />
              ))}
            </div>
          </div>
        </div>

        <div className="h-16 bg-gradient-to-b from-transparent to-[#0A1628]" />

        <AnimatedSection id="precios" className="py-20 px-4 relative parallax-bg"
          style={{
            backgroundImage: `
              linear-gradient(rgba(10,22,40,0.88), rgba(10,22,40,0.90)),
              url('/images/complejo.jpg')
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        >
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

        <div className="h-16 bg-gradient-to-b from-transparent to-[#0A1628]" />

<div id="testimonios" className="relative overflow-hidden">
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src="/videos/testimonios-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#0A1628]/80" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
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
        </div>

        <div className="h-16 bg-gradient-to-b from-transparent to-[#0A1628]" />

        <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover object-bottom" style={{ zIndex: 0 }}>
            <source src="/videos/cta-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#0A1628]/78" style={{ zIndex: 1 }} />
          <div className="relative text-center max-w-4xl mx-auto px-6 w-full" style={{ zIndex: 2 }}>
            <h2 className="text-5xl md:text-7xl font-black mb-6 text-[#CAFF00] font-[family-name:var(--font-bebas-neue)] leading-tight">
              EMPEZA A GESTIONAR TU COMPLEJO HOY
            </h2>
            <p className="text-slate-200 text-lg mb-10 max-w-2xl mx-auto font-medium">
              Registrate gratis y comenzá a recibir reservas en menos de 5 minutos. Sin tarjeta de crédito.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <button className="bg-[#CAFF00] text-[#0A1628] hover:bg-[#d4ff1a] font-black cursor-pointer rounded-xl px-10 py-6 text-xl transition-all duration-300 w-full sm:w-auto">
                  Crear mi cuenta gratis
                </button>
              </Link>
              <Link href="/login">
                <button className="border-2 border-[#CAFF00] text-[#CAFF00] bg-transparent hover:bg-[#CAFF00] hover:text-[#0A1628] font-black cursor-pointer rounded-xl px-10 py-6 text-xl transition-all duration-300 w-full sm:w-auto">
                  Ya tengo cuenta
                </button>
              </Link>
            </div>
          </div>
        </section>
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