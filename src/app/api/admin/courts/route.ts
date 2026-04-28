import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, courts } = body;

    if (!tenantId || !courts) {
      return NextResponse.json({ error: "Datos requeridos" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: existingCourts } = await supabase
      .from("courts")
      .select("id")
      .eq("tenant_id", tenantId);

    const existingIds = (existingCourts || []).map((c: { id: string }) => c.id);
    const newIds = courts.filter((c: { id?: string }) => c.id).map((c: { id: string }) => c.id);
    const toDelete = existingIds.filter((id: string) => !newIds.includes(id));

    if (toDelete.length > 0) {
      await supabase.from("courts").delete().in("id", toDelete);
    }

    for (const court of courts) {
      if (court.id) {
        await supabase
          .from("courts")
          .update({
            name: court.name,
            sport_type: court.sport_type,
            capacity: court.capacity,
            default_price: court.default_price,
            is_active: court.is_active,
          })
          .eq("id", court.id);
      } else {
        await supabase.from("courts").insert({
          tenant_id: tenantId,
          venue_id: null,
          name: court.name,
          sport_type: court.sport_type,
          capacity: court.capacity,
          default_price: court.default_price,
          is_active: court.is_active,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Courts update error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
