"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/db/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = await createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        setError("Email o contraseña incorrectos");
        setIsLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const response = await fetch("/api/auth/me");
        const { role, slug } = await response.json();

        console.log("role:", role, "slug:", slug);

        if (role === "owner" && slug) {
          window.location.href = `/${slug}/admin`;
        } else {
          window.location.href = "/admin";
        }
      } else {
        router.push("/admin");
      }
      router.refresh();
    } catch {
      setError("Email o contraseña incorrectos");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" style={{ zIndex: 0 }}>
          <source src="/videos/como-funciona.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#0A1628]/70" style={{ zIndex: 1 }} />
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-16 text-center h-full">
          <img src="/logo.svg" alt="CanchaPro" className="h-14 mx-auto mb-10" />
          <h2 className="text-5xl font-black text-white leading-tight mb-4">
            TU CANCHA,<br />
            <span className="text-[#CAFF00]">CUANDO QUIERAS</span>
          </h2>
          <p className="text-slate-300 font-medium text-lg">La plataforma de reservas más moderna de Argentina</p>
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

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#0A1628] p-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#CAFF00]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-sm" style={{ animation: 'slideUp 0.5s ease forwards' }}>
          <img src="/logo.svg" alt="CanchaPro" className="h-10 mx-auto mb-8 lg:hidden" />

          <h1 className="text-2xl font-black text-white text-center mb-2">INGRESAR</h1>
          <p className="text-slate-400 text-center mb-8 font-medium">Ingresá tus datos para acceder a tu cuenta</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-slate-300 text-sm font-semibold mb-2 block">Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full bg-[#111F35] border border-[#1E3A5F] rounded-xl px-4 py-3.5 text-white font-medium placeholder:text-slate-600 focus:border-[#CAFF00] focus:outline-none focus:ring-2 focus:ring-[#CAFF00]/20 transition-all duration-300"
              />
            </div>

            <div>
              <label className="text-slate-300 text-sm font-semibold mb-2 block">Contraseña</label>
              <input
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full bg-[#111F35] border border-[#1E3A5F] rounded-xl px-4 py-3.5 text-white font-medium placeholder:text-slate-600 focus:border-[#CAFF00] focus:outline-none focus:ring-2 focus:ring-[#CAFF00]/20 transition-all duration-300"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl text-sm bg-red-500/10 border border-red-500/30 text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#CAFF00] text-[#0A1628] font-black py-3.5 rounded-xl text-base hover:bg-[#B8FF00] hover:shadow-[0_0_25px_rgba(202,255,0,0.4)] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Ingresando...
                </span>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <Link href="/forgot-password" className="text-sm text-[#CAFF00] hover:underline font-medium">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <p className="text-center text-slate-400 mt-6 font-medium">
            ¿No tenés cuenta?{" "}
            <Link href="/signup" className="text-[#CAFF00] font-bold hover:underline">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
