"use client";

import type { Court, SportType } from "@/types/database";
import { cn } from "@/lib/utils";

const SPORT_LABELS: Record<SportType, string> = {
  futbol: "Fútbol 5",
  padel: "Pádel",
  volleyball: "Vóley",
  tennis: "Tenis",
  basketball: "Básquet",
  other: "Otro",
};

const SPORT_ICONS: Record<SportType, string> = {
  futbol: "⚽",
  padel: "🎾",
  volleyball: "🏐",
  tennis: "🎾",
  basketball: "🏀",
  other: "🏟",
};

interface Props {
  courts: Court[];
  selectedCourt: Court | null;
  onSelectCourt: (court: Court | null) => void;
}

export function CourtSelector({ courts, selectedCourt, onSelectCourt }: Props) {
  const sportGroups = courts.reduce(
    (acc, court) => {
      if (!acc[court.sport_type]) acc[court.sport_type] = [];
      acc[court.sport_type].push(court);
      return acc;
    },
    {} as Record<SportType, Court[]>
  );

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Filtrar por deporte</h3>
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => onSelectCourt(null)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
            selectedCourt === null
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          )}
        >
          Todas
        </button>
        {Object.entries(sportGroups).map(([sport, courtsOfSport]) => (
          <button
            key={sport}
            onClick={() => onSelectCourt(courtsOfSport[0])}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              selectedCourt?.sport_type === sport
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            <span>{SPORT_ICONS[sport as SportType]}</span>
            <span>{SPORT_LABELS[sport as SportType]}</span>
            <span className="text-xs opacity-70">({courtsOfSport.length})</span>
          </button>
        ))}
      </div>
    </div>
  );
}