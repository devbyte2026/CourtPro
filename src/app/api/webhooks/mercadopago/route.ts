import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";
import { sendBookingConfirmation } from "@/lib/email/sender";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-signature") || "";
    const webhookSecret = process.env.MP_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");
      if (signature !== expectedSignature) {
        return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
      }
    }

    const data = JSON.parse(body);
    const topic = data.topic || data.type;

    if (topic === "payment") {
      const paymentId = data.resource?.id || data.id;

      if (!paymentId) {
        return NextResponse.json({ error: "Payment ID requerido" }, { status: 400 });
      }

      const supabase = await createClient();

      const paymentData = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          },
        }
      ).then((res) => res.json());

      const externalReference = paymentData.external_reference;
      const status = paymentData.status;

      if (!externalReference) {
        return NextResponse.json({ error: "external_reference requerido" }, { status: 400 });
      }

      let bookingStatus: "confirmed" | "cancelled" = "cancelled";
      if (status === "approved") {
        bookingStatus = "confirmed";
      }

      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: bookingStatus,
          mp_payment_id: paymentId.toString(),
        })
        .eq("id", externalReference);

      if (updateError) {
        console.error("Booking update error:", updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      if (bookingStatus === "confirmed") {
        const b = await getBookingInfo(supabase, externalReference);
        if (b) {
          const customers = b.customers as any[];
          const courts = b.courts as any[];
          const tenants = b.tenants as any[];
          const customer = customers?.[0];
          await supabase.from("payments").insert({
            booking_id: externalReference,
            tenant_id: b.tenant_id,
            mp_payment_id: paymentId.toString(),
            status: "approved",
            amount: paymentData.transaction_amount || 0,
            currency: paymentData.currency_id || "ARS",
            payment_method: paymentData.payment_type_id || "mercadopago",
          });
          if (customer?.email) {
            await sendBookingConfirmation({
              to: customer.email,
              customerName: customer.name || "Cliente",
              courtName: courts?.[0]?.name || "Cancha",
              tenantName: tenants?.[0]?.name || "Complejo",
              date: b.date,
              startTime: b.start_time,
              endTime: b.end_time,
              totalAmount: b.total_amount,
              bookingId: externalReference,
            }).catch((e) => console.error("Email send error:", e));
          }
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

async function getBookingInfo(supabase: Awaited<ReturnType<typeof createClient>>, bookingId: string) {
  const { data } = await supabase
    .from("bookings")
    .select("tenant_id, date, start_time, end_time, total_amount, customers(email, name), courts(name), tenants(name)")
    .eq("id", bookingId)
    .single();
  return data;
}
