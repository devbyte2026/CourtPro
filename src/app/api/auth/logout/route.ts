import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    return NextResponse.json({
      message: "Sesión cerrada exitosamente",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Error al cerrar sesión" },
      { status: 500 }
    );
  }
}