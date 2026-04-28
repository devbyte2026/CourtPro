"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { X } from "lucide-react";

export function CookieBanner() {
  const [accepted, setAccepted] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cookies_accepted") === "true";
    }
    return false;
  });

  if (accepted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 z-50 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground flex-1">
          Usamos cookies para mejorar tu experiencia. Al continuar navegando,
          aceptás nuestra{" "}
          <Link href="/legal/privacidad" className="underline">
            política de privacidad
          </Link>{" "}
          y{" "}
          <Link href="/legal/terminos" className="underline">
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
          >
            Rechazar
          </Button>
          <Button
            size="sm"
            onClick={() => {
              localStorage.setItem("cookies_accepted", "true");
              setAccepted(true);
            }}
          >
            Aceptar
          </Button>
        </div>
      </div>
    </div>
  );
}
