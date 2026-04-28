"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Mail, Lock } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
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
    <div className="min-h-screen flex items-center justify-center bg-[#0A1628] p-4">
      <Card className="w-full max-w-md bg-[#1A2D47] border-[#1E3A5F]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center font-[family-name:var(--font-bebas-neue)] text-[#F0F4F8]">
            Crear cuenta
          </CardTitle>
          <CardDescription className="text-center text-[#6B7F94]">
            Registrate para administrar tu complejo deportivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#F0F4F8]">Nombre completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6B7F94]" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 bg-[#111F35] border-[#1E3A5F] text-[#F0F4F8] placeholder:text-[#6B7F94] focus:border-[#CAFF00] focus:ring-[#CAFF00]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#F0F4F8]">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6B7F94]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 bg-[#111F35] border-[#1E3A5F] text-[#F0F4F8] placeholder:text-[#6B7F94] focus:border-[#CAFF00] focus:ring-[#CAFF00]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#F0F4F8]">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6B7F94]" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isLoading}
                  className="pl-10 bg-[#111F35] border-[#1E3A5F] text-[#F0F4F8] placeholder:text-[#6B7F94] focus:border-[#CAFF00] focus:ring-[#CAFF00]"
                />
              </div>
            </div>

            {message && (
              <div
                className={`p-3 rounded-md text-sm ${
                  message.type === "success"
                    ? "bg-[#CAFF00]/10 border border-[#CAFF00]/30 text-[#CAFF00]"
                    : "bg-red-500/10 border border-red-500/30 text-red-400"
                }`}
              >
                {message.text}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#CAFF00] text-[#0A1628] hover:bg-[#B8FF00] font-bold transition-all duration-300 shadow-[0_0_20px_rgba(202,255,0,0.4)]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-[#6B7F94]">
              ¿Ya tenés cuenta?{" "}
            </span>
            <Link href="/login" className="text-[#CAFF00] hover:text-[#B8FF00] font-bold transition-colors">
              Ingresar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}