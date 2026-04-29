import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, complexName, slug, phone } = await request.json();

    if (!name || !email || !password || !complexName || !slug) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if slug already exists
    const { data: existingTenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existingTenant) {
      return NextResponse.json(
        { error: "Ese nombre ya está en uso, elegí otro" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (data.user) {
      const { data: tenantData, error: tenantError } = await supabaseAdmin
        .from("tenants")
        .insert({
          name: complexName,
          slug,
          phone: phone || null,
          status: "active",
          plan: "start",
        })
        .select("id")
        .single();

      if (tenantError) {
        console.error("Tenant creation error:", tenantError);
        return NextResponse.json(
          { error: "Cuenta creada pero no se pudo guardar el complejo" },
          { status: 500 }
        );
      }

      if (tenantData) {
        await supabaseAdmin.from("tenant_users").insert({
          tenant_id: tenantData.id,
          user_id: data.user.id,
          role: "owner",
        });
      }
    }

    return NextResponse.json({
      message: "Cuenta creada exitosamente",
      user: data.user,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
