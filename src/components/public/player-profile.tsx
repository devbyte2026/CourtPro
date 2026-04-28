"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Loader2, Settings, Calendar, LogOut } from "lucide-react";
import { createClient } from "@/lib/db/supabase-browser";
import { PlayerBookings } from "./player-bookings";

interface Props {
  user: { id: string; email?: string };
  tenantId: string;
}

export function PlayerProfile({ user, tenantId }: Props) {
  const [loading, setLoading] = useState(false);
  const [showBookings, setShowBookings] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  const handleRepeatBooking = (courtId: string, date: string, time: string) => {
    router.push(`/?court=${courtId}&date=${date}&time=${time}`);
  };

  const initials = user.email
    ? user.email.slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium">{user.email}</p>
            <p className="text-sm text-muted-foreground">Jugador</p>
          </div>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          variant={showBookings ? "default" : "outline"}
          className="flex-1"
          onClick={() => setShowBookings(true)}
        >
          <Calendar className="h-4 w-4 mr-2" /> Mis reservas
        </Button>
        <Button
          variant={!showBookings ? "default" : "outline"}
          className="flex-1"
          onClick={() => setShowBookings(false)}
        >
          <Settings className="h-4 w-4 mr-2" /> Configuración
        </Button>
      </div>

      {showBookings ? (
        <PlayerBookings userId={user.id} tenantId={tenantId} onRepeatBooking={handleRepeatBooking} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Notificaciones</span>
              <Button variant="outline" size="sm">Activadas</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm">Recordatorios</span>
              <Button variant="outline" size="sm">2 horas antes</Button>
            </div>
            <Separator />
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              onClick={handleLogout}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
              Cerrar sesión
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
