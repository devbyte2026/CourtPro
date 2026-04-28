"use client";

import { useState } from "react";
import type { Tenant, Court } from "@/types/database";
import { HeroSection } from "./hero-section";
import { CourtSelector } from "./court-selector";
import { BookingGrid } from "./booking-grid";
import { BookingSheet } from "./booking-sheet";
import { MagicLinkDialog } from "./magic-link-dialog";
import { PhotoGallery } from "./photo-gallery";
import { ComplexInfo } from "./complex-info";
import { cn } from "@/lib/utils";

interface Props {
  tenant: Tenant & { venues?: { id: string; name: string }[]; courts?: Court[] };
}

export function PublicComplexPage({ tenant }: Props) {
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);
  const [showBookingSheet, setShowBookingSheet] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [showInfo, setShowInfo] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  const courts = tenant.courts || [];
  const selectedSport = selectedCourt ? courts.filter((c) => c.sport_type === selectedCourt.sport_type) : courts;

  const handleSlotSelect = (date: string, time: string) => {
    setSelectedSlot({ date, time });
    setShowBookingSheet(true);
  };

  const handleJoinWaitlist = async (courtId: string, date: string, time: string) => {
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          courtId,
          customerId: null,
          date,
          startTime: time,
          endTime: addHours(time, 1),
        }),
      });
      if (res.ok) {
        setWaitlistSuccess(true);
        setTimeout(() => setWaitlistSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection tenant={tenant} />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <PhotoGallery tenant={tenant} />

        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setShowInfo(false)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              !showInfo ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
            )}
          >
            Reservar turno
          </button>
          <button
            onClick={() => setShowInfo(true)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              showInfo ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
            )}
          >
            Info del complejo
          </button>
        </div>

        {showInfo ? (
          <ComplexInfo tenant={tenant} />
        ) : (
          <>
            <CourtSelector
              courts={courts}
              selectedCourt={selectedCourt}
              onSelectCourt={setSelectedCourt}
            />

            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Turnos disponibles</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedCourt ? selectedCourt.name : "Todas las canchas"}
                </p>
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map((day, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  const dateStr = date.toISOString().split("T")[0];
                  const dayNum = date.getDay();
                  const isWeekend = dayNum === 0 || dayNum === 6;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(dateStr)}
                      className={cn(
                        "flex flex-col items-center min-w-[56px] px-3 py-2 rounded-lg text-xs transition-colors",
                        selectedDate === dateStr
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80",
                        isWeekend && selectedDate !== dateStr ? "bg-primary/10" : ""
                      )}
                    >
                      <span className="font-medium">{day.slice(0, 3)}</span>
                      <span>{date.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <BookingGrid
              tenantId={tenant.id}
              courts={selectedSport}
              date={selectedDate}
              onSlotSelect={handleSlotSelect}
              onLoginRequired={() => setShowLoginDialog(true)}
            />
          </>
        )}
      </main>

      <BookingSheet
        open={showBookingSheet}
        onClose={() => setShowBookingSheet(false)}
        tenant={tenant}
        court={selectedCourt}
        slot={selectedSlot}
        onLoginRequired={() => {
          setShowBookingSheet(false);
          setShowLoginDialog(true);
        }}
        onJoinWaitlist={handleJoinWaitlist}
      />

      {waitlistSuccess && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-success text-success-foreground px-6 py-3 rounded-lg shadow-lg">
          Te sumaste a la lista de espera. Te avisamos cuando se libere un turno.
        </div>
      )}

      <MagicLinkDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onSuccess={() => {
          setShowLoginDialog(false);
          if (selectedSlot) setShowBookingSheet(true);
        }}
      />
    </div>
  );
}

function addHours(time: string, hours: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + hours * 60;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}