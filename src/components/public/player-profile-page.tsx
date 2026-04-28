"use client";

import type { Tenant } from "@/types/database";
import { PlayerProfile } from "./player-profile";

interface Props {
  user: { id: string; email?: string };
  tenant: Tenant;
}

export function PlayerProfilePage({ user, tenant }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary/10 to-transparent py-8 px-4">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold mb-1">Mi Perfil</h1>
          <p className="text-sm text-muted-foreground">{tenant.name}</p>
        </div>
      </div>

      <main className="max-w-xl mx-auto px-4 py-6">
        <PlayerProfile user={user} tenantId={tenant.id} />
      </main>
    </div>
  );
}
