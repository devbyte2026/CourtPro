"use client";

import { useState, useEffect } from "react";
import type { Court } from "@/types/database";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface TimeSlot {
  time: string;
  available: boolean;
  court_id: string;
}

interface Props {
  tenantId: string;
  courts: Court[];
  date: string;
  onSlotSelect: (date: string, time: string) => void;
  onLoginRequired: () => void;
}

export function BookingGrid({ tenantId, courts, date, onSlotSelect, onLoginRequired }: Props) {
  const [slots, setSlots] = useState<Record<string, TimeSlot[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);

  useEffect(() => {
    if (courts.length === 0) return;
    setSelectedCourtId(courts[0].id);
  }, [courts]);

  useEffect(() => {
    if (!selectedCourtId || !date) return;

    const fetchSlots = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/public/slots?tenantId=${tenantId}&courtId=${selectedCourtId}&date=${date}`
        );
        if (res.ok) {
          const data = await res.json();
          setSlots((prev) => ({ ...prev, [selectedCourtId!]: data.slots || [] }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [tenantId, selectedCourtId, date]);

  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];

  const now = new Date();
  const isToday = date === now.toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {courts.map((court) => (
          <button
            key={court.id}
            onClick={() => setSelectedCourtId(court.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
              selectedCourtId === court.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {court.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {timeSlots.map((time) => {
            const courtSlots = slots[selectedCourtId || ""] || [];
            const slot = courtSlots.find((s) => s.time === time);
            const available = slot?.available ?? false;

            let disabled = false;
            let status: "available" | "occupied" | "past" | "selected" = "available";

            if (isToday) {
              const [h, m] = time.split(":").map(Number);
              const slotDate = new Date();
              slotDate.setHours(h, m, 0, 0);
              if (slotDate <= now) {
                disabled = true;
                status = "past";
              }
            }

            if (!disabled && slot?.available === false) {
              status = "occupied";
            }

            return (
              <button
                key={time}
                disabled={disabled || status === "occupied"}
                onClick={() => {
                  if (status === "available") {
                    onSlotSelect(date, time);
                  } else if (status === "occupied") {
                    onLoginRequired();
                  }
                }}
                className={cn(
                  "h-12 rounded-lg text-sm font-medium transition-all touch-manipulation",
                  status === "available" &&
                    "bg-success/10 text-success hover:bg-success/20 border-2 border-success/30",
                  status === "occupied" &&
                    "bg-muted text-muted-foreground cursor-not-allowed",
                  status === "past" && "bg-muted/50 text-muted-foreground/50 cursor-not-allowed"
                )}
              >
                {time}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-success/10 border border-success/30" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted" />
          <span>Ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted/50" />
          <span>Pasado</span>
        </div>
      </div>
    </div>
  );
}