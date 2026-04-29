"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { X } from "lucide-react";

export function CookieBanner() {
  const [accepted, setAccepted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAccepted(localStorage.getItem("cookies_accepted") === "true");
  }, []);

  if (!mounted || accepted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0A1628] border-t border-[#1E3A5F] p-4 z-50 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm text-slate-300 flex-1">
          Usamos cookies para mejorar tu experiencia. Al continuar navegando,
          aceptás nuestra{" "}
          <Link href="/legal/privacidad" className="underline hover:text-[#CAFF00]">
            política de privacidad
          </Link>{" "}
          y{" "}
          <Link href="/legal/terminos" className="underline hover:text-[#CAFF00]">
            términos
          </Link>.
        </p>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              localStorage.setItem("cookies_accepted", "false");
              setAccepted(true);
            }}
            className="border border-[#1E3A5F] text-slate-300 hover:text-white"
          >
            Rechazar
          </Button>
          <Button
            size="sm"
            onClick={() => {
              localStorage.setItem("cookies_accepted", "true");
              setAccepted(true);
            }}
            className="bg-[#CAFF00] text-[#0A1628] hover:bg-[#B8FF00]"
          >
            Aceptar
          </Button>
        </div>
      </div>
    </div>
  );
}
