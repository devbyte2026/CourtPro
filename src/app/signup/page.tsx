"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [complexName, setComplexName] = useState("");
  const [slug, setSlug] = useState("");
  const [phone, setPhone] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const generatedSlug = complexName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    setSlug(generatedSlug);
  }, [complexName]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (password.length < 6) {
      setMessage({
        type: "error",
        text: "La contraseña debe tener al menos 6 caracteres",
      });
      setIsLoading(false);
      return;
    }

    if (!slug) {
      setMessage({
        type: "error",
        text: "El nombre del complejo es requerido",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, complexName, slug, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la cuenta");
      }

      setMessage({
        type: "success",
        text: "Cuenta creada. Revisá tu email para confirmar tu cuenta.",
      });

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error al crear la cuenta",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" style={{ zIndex: 0 }}>
          <source src="/videos/hero-pade.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#0A1628]/70" style={{ zIndex: 1 }} />
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-16 text-center">
          <img src="/logo.svg" alt="CanchaPro" className="h-14 mx-auto mb-10" />
          <h2 className="text-5xl font-black text-white leading-tight mb-4">
            EMPEZÁ A<br />
            <span className="text-[#CAFF00]">COBRAR ONLINE</span>
          </h2>
          <p className="text-slate-300 font-medium text-lg">Configurá tu complejo en menos de 10 minutos</p>
          <div className="flex gap-10 mt-12 justify-center">
            <div>
              <div className="text-4xl font-black text-[#CAFF00]">500+</div>
              <div className="text-slate-400 text-sm mt-1">Complejos</div>
            </div>
            <div>
              <div className="text-4xl font-black text-[#CAFF00]">50k+</div>
              <div className="text-slate-400 text-sm mt-1">Reservas</div>
            </div>
            <div>
              <div className="text-4xl font-black text-[#CAFF00]">98%</div>
              <div className="text-slate-400 text-sm mt-1">Satisfacción</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 h-screen flex flex-col justify-center items-center bg-[#0A1628] py-8 px-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#CAFF00]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-md overflow-y-auto" style={{ animation: 'slideUp 0.5s ease forwards' }}>
          <img src="/logo.svg" alt="CanchaPro" className="h-10 mx-auto mb-4 lg:hidden" />

          <h1 className="text-xl font-black text-white text-center mb-1">CREAR CUENTA</h1>
          <p className="text-slate-400 text-center mb-4 text-sm font-medium">Registrate para administrar tu complejo deportivo</p>

          <form onSubmit={handleSignup} className="space-y-3">
            <div>
              <label className="text-slate-300 text-xs font-semibold mb-1 block">Nombre completo</label>
              <input
                type="text"
                placeholder="Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                className="w-full bg-[#111F35] border border-[#1E3A5F] rounded-xl px-4 py-3 text-white text-sm font-medium placeholder:text-slate-600 focus:border-[#CAFF00] focus:outline-none focus:ring-2 focus:ring-[#CAFF00]/20 transition-all duration-300"
              />
            </div>

            <div>
              <label className="text-slate-300 text-xs font-semibold mb-1 block">Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full bg-[#111F35] border border-[#1E3A5F] rounded-xl px-4 py-3 text-white text-sm font-medium placeholder:text-slate-600 focus:border-[#CAFF00] focus:outline-none focus:ring-2 focus:ring-[#CAFF00]/20 transition-all duration-300"
              />
            </div>

            <div>
              <label className="text-slate-300 text-xs font-semibold mb-1 block">Contraseña</label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
                className="w-full bg-[#111F35] border border-[#1E3A5F] rounded-xl px-4 py-3 text-white text-sm font-medium placeholder:text-slate-600 focus:border-[#CAFF00] focus:outline-none focus:ring-2 focus:ring-[#CAFF00]/20 transition-all duration-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 text-xs font-semibold mb-1 block">Nombre del complejo</label>
                <input
                  type="text"
                  placeholder="Ej: Complejo Norte"
                  value={complexName}
                  onChange={(e) => setComplexName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full bg-[#111F35] border border-[#1E3A5F] rounded-xl px-4 py-3 text-white text-sm font-medium placeholder:text-slate-600 focus:border-[#CAFF00] focus:outline-none focus:ring-2 focus:ring-[#CAFF00]/20 transition-all duration-300"
                />
              </div>
              <div>
                <label className="text-slate-300 text-xs font-semibold mb-1 block">Teléfono</label>
                <input
                  type="tel"
                  placeholder="+54 11 1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-[#111F35] border border-[#1E3A5F] rounded-xl px-4 py-3 text-white text-sm font-medium placeholder:text-slate-600 focus:border-[#CAFF00] focus:outline-none focus:ring-2 focus:ring-[#CAFF00]/20 transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-xs font-semibold mb-1 block">Slug / URL</label>
              <input
                type="text"
                placeholder="ej: complejo-norte"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                disabled={isLoading}
                className="w-full bg-[#111F35] border border-[#1E3A5F] rounded-xl px-4 py-3 text-white text-sm font-medium placeholder:text-slate-600 focus:border-[#CAFF00] focus:outline-none focus:ring-2 focus:ring-[#CAFF00]/20 transition-all duration-300"
              />
              <p className="text-xs text-gray-400 mt-1">
                Tu link será: <span className="text-[#CAFF00]">canchapro.com/{slug || 'tu-complejo'}</span>
              </p>
            </div>

            <div>
              <label className="text-slate-300 text-xs font-semibold mb-1 block">Logo (opcional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                disabled={isLoading}
                className="w-full bg-[#111F35] border border-[#1E3A5F] rounded-xl px-3 py-2.5 text-white text-xs file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-[#CAFF00] file:text-[#0A1628] file:font-semibold file:cursor-pointer hover:file:bg-[#B8FF00] transition-all duration-300"
              />
              {logoPreview && (
                <div className="mt-1.5 flex items-center gap-2">
                  <img src={logoPreview} alt="Logo preview" className="h-8 w-8 object-contain rounded bg-white/10 p-0.5" />
                  <span className="text-xs text-slate-400">Logo seleccionado</span>
                </div>
              )}
            </div>

            {message && (
              <div
                className={`p-2.5 rounded-xl text-xs ${
                  message.type === "success"
                    ? "bg-[#CAFF00]/10 border border-[#CAFF00]/30 text-[#CAFF00]"
                    : "bg-red-500/10 border border-red-500/30 text-red-400"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#CAFF00] text-[#0A1628] font-black py-3 rounded-xl text-sm hover:bg-[#B8FF00] hover:shadow-[0_0_25px_rgba(202,255,0,0.4)] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creando cuenta...
                </span>
              ) : (
                "Crear cuenta"
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 mt-6 font-medium">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-[#CAFF00] font-bold hover:underline">
              Ingresar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
