"use client";

import { useState } from "react";
import type { Tenant } from "@/types/database";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface Props {
  tenant: Tenant;
}

const FALLBACK_PHOTOS = [
  "https://recreasport.com/wp-content/uploads/2017/04/SAM_0191-2.jpg",
  "https://www.competize.com/blog/wp-content/uploads/2020/10/cancha-futbol-sintetica-artifical-pasto-natural-750x500.jpg",
  "https://img.olympics.com/images/image/private/t_s_16_9_g_auto/t_s_w1460/f_auto/primary/g6homnktejpgiirh4iot",
  "https://img.freepik.com/foto-gratis/paddle-tennis-linea-blanca_23-2149459021.jpg?semt=ais_hybrid&w=740&q=80",
];

export function PhotoGallery({ tenant }: Props) {
  const photos = tenant.photos?.length ? tenant.photos : FALLBACK_PHOTOS;

  if (photos.length === 0) {
    return null;
  }

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-4 gap-2">
        {photos.slice(0, 4).map((photo, i) => (
          <button
            key={i}
            onClick={() => setSelectedIndex(i)}
            className={cn(
              "relative overflow-hidden rounded-lg",
              i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
            )}
          >
            <img
              src={photo}
              alt={`${tenant.name} - Foto ${i + 1}`}
              className="w-full h-full object-cover"
            />
            {i === 3 && photos.length > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-medium">+{photos.length - 4}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {selectedIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            onClick={() => setSelectedIndex((p) => (p! > 0 ? p! - 1 : photos.length - 1))}
            className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-full"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <img
            src={photos[selectedIndex]}
            alt={`${tenant.name} - Foto ${selectedIndex + 1}`}
            className="max-w-full max-h-[80vh] object-contain"
          />

          <button
            onClick={() => setSelectedIndex((p) => (p! < photos.length - 1 ? p! + 1 : 0))}
            className="absolute right-4 p-2 text-white hover:bg-white/10 rounded-full"
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  i === selectedIndex ? "bg-white" : "bg-white/30"
                )}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
