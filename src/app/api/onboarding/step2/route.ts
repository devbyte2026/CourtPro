import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { tenantId, courts } = body;

    if (!tenantId || !courts) {
      return NextResponse.json({ error: "Datos requeridos" }, { status: 400 });
    }

    const { data: venue, error: venueError } = await supabase
      .from("venues")
      .insert({ tenant_id: tenantId, name: "Sede principal" })
      .select()
      .single();

    if (venueError) {
      return NextResponse.json({ error: venueError.message }, { status: 500 });
    }

    const courtsToInsert = courts.map((court: { name: string; sport_type: string; capacity: number; default_price: number }) => ({
      tenant_id: tenantId,
      venue_id: venue.id,
      name: court.name,
      sport_type: court.sport_type,
      capacity: court.capacity,
      default_price: court.default_price,
      is_active: true,
    }));

    const { error } = await supabase.from("courts").insert(courtsToInsert);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, venueId: venue.id });
  } catch (error) {
    console.error("Onboarding step2 error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
