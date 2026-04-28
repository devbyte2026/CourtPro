"use client";

import type { Tenant } from "@/types/database";
import { MapPin, Phone, Clock } from "lucide-react";

interface Props {
  tenant: Tenant;
}

export function HeroSection({ tenant }: Props) {
  const branding = tenant.branding_config;
  const primaryColor = branding?.primary_color || "#078930";
  const coverUrl = tenant.cover_url || "https://recreasport.com/wp-content/uploads/2017/04/SAM_0191-2.jpg";

  return (
    <div className="relative h-64 md:h-80">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${coverUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      <div className="relative h-full flex flex-col justify-end p-6 text-white">
        {tenant.logo_url && (
          <img
            src={tenant.logo_url}
            alt={tenant.name}
            className="h-12 w-12 rounded-lg object-cover mb-3"
          />
        )}
        <h1 className="text-2xl md:text-3xl font-bold mb-1">{tenant.name}</h1>
        {tenant.description && (
          <p className="text-sm text-white/80 mb-2 line-clamp-2">{tenant.description}</p>
        )}
        <div className="flex flex-wrap gap-4 text-xs text-white/70">
          {tenant.address && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {tenant.address}
            </span>
          )}
          {tenant.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {tenant.phone}
            </span>
          )}
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ backgroundColor: primaryColor }}
      />
    </div>
  );
}