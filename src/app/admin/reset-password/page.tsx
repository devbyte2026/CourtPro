"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/db/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Auth event:", event);
          console.log("Session:", session?.user?.email);
          if (event === "PASSWORD_RECOVERY") {
            setSessionReady(true);
          }
        }
      );

      const { data: { session } } = await supabase.auth.getSession();
      console.log("Session actual:", session?.user?.email);
      if (session) {
        setSessionReady(true);
      }

      return () => subscription.unsubscribe();
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      setError("Mínimo 6 caracteres");
      return;
    }
    setLoading(true);
    setError("");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError("Sesión expirada. Solicitá un nuevo link de recuperación.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(`Error: ${error.message}`);
      setLoading(false);
    } else {
      setSuccess(true);
      await supabase.auth.signOut();
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A1628] px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="relative z-10">
          <img src="/logo.svg" alt="CanchaPro" className="h-12 mx-auto mb-8" />

          <h1 className="text-2xl font-black text-white text-center mb-2">
            {success ? "¡Listo!" : "Nueva contraseña"}
          </h1>
          <p className="text-slate-400 text-center mb-6 text-sm font-medium">
            {success
              ? "Tu contraseña fue actualizada"
              : "Ingresá tu nueva contraseña"}
          </p>

          {!sessionReady && !success && (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="h-8 w-8 animate-spin text-[#CAFF00]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <p className="text-slate-400 text-sm mt-4">Verificando enlace...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm text-center mb-4">
              {error}
            </div>
          )}

          {success ? (
            <div className="bg-[#CAFF00]/10 border border-[#CAFF00]/30 text-[#CAFF00] p-4 rounded-xl text-sm text-center">
              Redirigiendo a login...
            </div>
          ) : sessionReady ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-slate-300 text-xs font-semibold mb-1 block">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                  className="w-full bg-[#111F35] border border-[#1E3A5F] rounded-xl px-4 py-3 text-white text-sm font-medium placeholder:text-slate-600 focus:border-[#CAFF00] focus:outline-none focus:ring-2 focus:ring-[#CAFF00]/20 transition-all duration-300"
                />
              </div>

              <div>
                <label className="text-slate-300 text-xs font-semibold mb-1 block">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  placeholder="Repetí tu contraseña"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                  className="w-full bg-[#111F35] border border-[#1E3A5F] rounded-xl px-4 py-3 text-white text-sm font-medium placeholder:text-slate-600 focus:border-[#CAFF00] focus:outline-none focus:ring-2 focus:ring-[#CAFF00]/20 transition-all duration-300"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#CAFF00] text-[#0A1628] font-black py-3 rounded-xl text-sm hover:bg-[#B8FF00] hover:shadow-[0_0_25px_rgba(202,255,0,0.4)] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Cambiando contraseña...
                  </span>
                ) : (
                  "Cambiar contraseña"
                )}
              </button>
            </form>
          ) : null}

          <p className="text-center text-slate-400 mt-6 text-sm font-medium">
            <Link href="/login" className="text-[#CAFF00] font-bold hover:underline">
              Volver al login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
