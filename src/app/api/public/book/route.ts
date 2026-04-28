import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";
import { acquireLock, releaseLock, getBookingLockKey } from "@/lib/booking-lock";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { tenant_id, court_id, date, start_time } = await request.json();

    if (!tenant_id || !court_id || !date || !start_time) {
      return NextResponse.json({ error: "Datos requeridos" }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ auth_required: true }, { status: 401 });
    }

    const lockKey = getBookingLockKey(court_id, date, start_time);
    const lockAcquired = await acquireLock(lockKey, 10);

    if (!lockAcquired) {
      return NextResponse.json({ error: "Horario actualmente reservado. Intentá en segundos." }, { status: 409 });
    }

    try {
      const { data: existing } = await supabase
        .from("bookings")
        .select("id")
        .eq("court_id", court_id)
        .eq("date", date)
        .eq("start_time", start_time)
        .in("status", ["pending", "confirmed"])
        .single();

      if (existing) {
        return NextResponse.json({ error: "Este horario ya está reservado" }, { status: 409 });
      }

      const { data: court } = await supabase
        .from("courts")
        .select("id, default_price, name")
        .eq("id", court_id)
        .single();

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      let customerId: string | null = null;
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("user_id", user.id)
        .eq("tenant_id", tenant_id)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer } = await supabase
          .from("customers")
          .insert({
            tenant_id,
            user_id: user.id,
            name: user.email?.split("@")[0] || "Cliente",
            email: user.email,
          })
          .select("id")
          .single();
        customerId = newCustomer?.id || null;
      }

      if (!customerId) {
        return NextResponse.json({ error: "Error al crear cliente" }, { status: 500 });
      }

      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          tenant_id,
          court_id,
          customer_id: customerId,
          date,
          start_time,
          end_time: addHours(start_time, 1),
          status: "pending",
          total_amount: court?.default_price || 5000,
          expires_at: expiresAt,
          payment_method: "mercadopago",
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      let initPoint: string | null = null;

      const { data: tenant } = await supabase
        .from("tenants")
        .select("mp_access_token, mp_user_id, name")
        .eq("id", tenant_id)
        .single();

      if (tenant?.mp_access_token && tenant?.mp_user_id) {
        try {
          const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${tenant.mp_access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              items: [
                {
                  title: `Reserva ${court?.name || "cancha"} - ${date}`,
                  unit_price: court?.default_price || 5000,
                  quantity: 1,
                  currency_id: "ARS",
                },
              ],
              payer: { email: user.email },
              external_reference: booking.id,
              notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
            }),
          });

          if (mpRes.ok) {
            const mpData = await mpRes.json();
            initPoint = mpData.init_point;
          }
        } catch (e) {
          console.error("MP error:", e);
        }
      }

      return NextResponse.json({
        booking_id: booking.id,
        init_point: initPoint,
        expires_at: expiresAt,
      });
    } finally {
      await releaseLock(lockKey);
    }
  } catch (error) {
    console.error("Book error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

function addHours(time: string, hours: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + hours * 60;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
