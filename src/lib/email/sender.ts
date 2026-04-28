import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const { to, subject, html } = params;

  return transporter.sendMail({
    from: process.env.GMAIL_FROM || process.env.GMAIL_USER,
    to,
    subject,
    html,
  });
}

export async function sendBookingConfirmation(params: {
  to: string;
  customerName: string;
  courtName: string;
  tenantName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  bookingId: string;
}) {
  const { to, customerName, courtName, tenantName, date, startTime, endTime, totalAmount, bookingId } = params;

  const dateFormatted = new Date(date + "T00:00:00").toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return sendEmail({
    to,
    subject: `Reserva confirmada - ${courtName} en ${tenantName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #078930;">¡Reserva confirmada!</h2>
        <p>Hola ${customerName},</p>
        <p>Tu turno quedó confirmado:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>${courtName}</strong></p>
          <p>📅 ${dateFormatted}</p>
          <p>⏰ ${startTime} - ${endTime}</p>
          <p>💰 $${totalAmount.toLocaleString("es-AR")}</p>
          <p>📍 ${tenantName}</p>
        </div>
        <p style="color: #666; font-size: 14px;">
          Referencia: ${bookingId.slice(0, 8)}
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">
          CanchaPro - Tu sistema de reservas online
        </p>
      </div>
    `,
  });
}

export async function sendReminder(params: {
  to: string;
  customerName: string;
  courtName: string;
  tenantName: string;
  date: string;
  startTime: string;
  hoursUntil: number;
}) {
  const { to, customerName, courtName, tenantName, date, startTime, hoursUntil } = params;

  const dateFormatted = new Date(date + "T00:00:00").toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return sendEmail({
    to,
    subject: `Recordatorio - Tenés turno en ${hoursUntil} horas`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #078930;">¡Te recordamos tu turno!</h2>
        <p>Hola ${customerName},</p>
        <p>No te olvidés:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>${courtName}</strong></p>
          <p>📅 ${dateFormatted}</p>
          <p>⏰ ${startTime}</p>
          <p>📍 ${tenantName}</p>
        </div>
        <p style="color: #666; font-size: 14px;">
          Nos vemos pronto. Si no vas a poder asistir, recordá que podés cancelar hasta 24hs antes.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">
          CanchaPro - Tu sistema de reservas online
        </p>
      </div>
    `,
  });
}

export async function sendCancellation(params: {
  to: string;
  customerName: string;
  courtName: string;
  tenantName: string;
  date: string;
  startTime: string;
  refundAmount: number;
  wasFree: boolean;
}) {
  const { to, customerName, courtName, tenantName, date, startTime, refundAmount, wasFree } = params;

  return sendEmail({
    to,
    subject: `Reserva cancelada - ${courtName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #666;">Reserva cancelada</h2>
        <p>Hola ${customerName},</p>
        <p>Tu reserva fue cancelada:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>${courtName}</strong></p>
          <p>📅 ${date}</p>
          <p>⏰ ${startTime}</p>
          <p>📍 ${tenantName}</p>
        </div>
        ${wasFree ? `<p style="color: #078930;">No se cobró ningún monto por la cancelación.</p>` : `<p style="color: #078930;">Te reembolsamos $${refundAmount.toLocaleString("es-AR")} en tu cuenta de Mercado Pago.</p>`}
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">
          CanchaPro - Tu sistema de reservas online
        </p>
      </div>
    `,
  });
}

export async function sendWaitlistNotification(params: {
  to: string;
  customerName: string;
  courtName: string;
  tenantName: string;
  date: string;
  startTime: string;
}) {
  const { to, customerName, courtName, tenantName, date, startTime } = params;

  return sendEmail({
    to,
    subject: `¡Se liberó un turno! - ${courtName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #078930;">¡Se liberó un turno!</h2>
        <p>Hola ${customerName},</p>
        <p>Se acaba de liberar el horario que estabas esperando:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>${courtName}</strong></p>
          <p>📅 ${date}</p>
          <p>⏰ ${startTime}</p>
          <p>📍 ${tenantName}</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="display: inline-block; background: #078930; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Reservar ahora</a>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          Este link expira en 30 minutos. Reservá lo antes posible.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">
          CanchaPro - Tu sistema de reservas online
        </p>
      </div>
    `,
  });
}

export async function sendMagicLink(params: {
  to: string;
  magicLink: string;
}) {
  const { to, magicLink } = params;

  return sendEmail({
    to,
    subject: "Tu enlace para entrar a CanchaPro",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #078930;">Entrá a CanchaPro</h2>
        <p>Hacé click en el botón para iniciar sesión:</p>
        <a href="${magicLink}" style="display: inline-block; background: #078930; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0;">Entrar</a>
        <p style="color: #999; font-size: 12px;">
          Este enlace expira en 60 minutos.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">
          CanchaPro - Tu sistema de reservas online
        </p>
      </div>
    `,
  });
}

export async function sendSubscriptionExpiringReminder(params: {
  to: string;
  tenantName: string;
  daysUntilExpiration: number;
  renewalDate: string;
  planName: string;
  amount: number;
}) {
  const { to, tenantName, daysUntilExpiration, renewalDate, planName, amount } = params;

  return sendEmail({
    to,
    subject: `Tu suscripción de CanchaPro vence en ${daysUntilExpiration} día${daysUntilExpiration === 1 ? "" : "s"}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563EB;">Recordatorio de renovación</h2>
        <p>Hola ${tenantName},</p>
        <p>Te recordamos que tu suscripción a CanchaPro está por vencer:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Plan:</strong> ${planName}</p>
          <p><strong>Monto:</strong> $${amount.toLocaleString("es-AR")}</p>
          <p><strong>Próxima fecha de cobro:</strong> ${renewalDate}</p>
          <p><strong>Días restantes:</strong> ${daysUntilExpiration}</p>
        </div>
        <p style="color: #666; font-size: 14px;">
          Tu método de pago será cargado automáticamente en la fecha indicada.
          Si querés cambiar tu plan o método de pago, podés hacerlo desde tu panel de administración.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">
          CanchaPro - Tu sistema de reservas online
        </p>
      </div>
    `,
  });
}

export async function sendSubscriptionExpired(params: {
  to: string;
  tenantName: string;
  expiredDate: string;
  planName: string;
}) {
  const { to, tenantName, expiredDate, planName } = params;

  return sendEmail({
    to,
    subject: `Tu suscripción de CanchaPro ha vencido`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #DC2626;">Suscripción vencida</h2>
        <p>Hola ${tenantName},</p>
        <p>Tu suscripción a CanchaPro ha vencido:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Plan:</strong> ${planName}</p>
          <p><strong>Fecha de vencimiento:</strong> ${expiredDate}</p>
        </div>
        <p style="color: #666; font-size: 14px;">
          Para continuar usando CanchaPro sin interrupciones, renová tu suscripción lo antes posible.
          Tu página pública y sistema de reservas seguirán activos por 7 días más.
        </p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/suscripcion" style="display: inline-block; background: #2563EB; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0;">Renovar ahora</a>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">
          CanchaPro - Tu sistema de reservas online
        </p>
      </div>
    `,
  });
}

export async function sendSubscriptionConfirmed(params: {
  to: string;
  tenantName: string;
  planName: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
}) {
  const { to, tenantName, planName, amount, periodStart, periodEnd } = params;

  return sendEmail({
    to,
    subject: `Confirmación de suscripción a CanchaPro - Plan ${planName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #078930;">¡Suscripción confirmada!</h2>
        <p>Hola ${tenantName},</p>
        <p>Tu suscripción a CanchaPro está confirmada:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Plan:</strong> ${planName}</p>
          <p><strong>Monto:</strong> $${amount.toLocaleString("es-AR")}</p>
          <p><strong>Período:</strong> ${periodStart} - ${periodEnd}</p>
        </div>
        <p style="color: #666; font-size: 14px;">
          Gracias por confiar en CanchaPro. Si tenés alguna pregunta, no dudes en contactarnos.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">
          CanchaPro - Tu sistema de reservas online
        </p>
      </div>
    `,
  });
}

export async function sendInvoice(params: {
  to: string;
  tenantName: string;
  invoiceNumber: string;
  amount: number;
  date: string;
  planName: string;
  periodStart: string;
  periodEnd: string;
}) {
  const { to, tenantName, invoiceNumber, amount, date, planName, periodStart, periodEnd } = params;

  return sendEmail({
    to,
    subject: `Factura CanchaPro #${invoiceNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div>
            <h2 style="color: #2563EB; margin: 0;">CanchaPro</h2>
            <p style="color: #666; font-size: 14px; margin: 0;">Tu sistema de reservas online</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0;"><strong>FACTURA</strong></p>
            <p style="color: #666; font-size: 14px; margin: 0;">N° ${invoiceNumber}</p>
            <p style="color: #666; font-size: 14px; margin: 0;">Fecha: ${date}</p>
          </div>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <div style="margin-bottom: 20px;">
          <p><strong>Cliente:</strong> ${tenantName}</p>
          <p><strong>Dirección:</strong> Argentina</p>
          <p><strong>Condición IVA:</strong> Responsable Inscripto</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="border-bottom: 1px solid #eee;">
              <th style="text-align: left; padding: 10px 0;">Descripción</th>
              <th style="text-align: right; padding: 10px 0;">Importe</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0;">
                Suscripción CanchaPro - Plan ${planName}<br>
                <span style="color: #666; font-size: 12px;">Período: ${periodStart} - ${periodEnd}</span>
              </td>
              <td style="text-align: right; padding: 10px 0;">$${amount.toLocaleString("es-AR")}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td style="text-align: right; padding: 10px 0;"><strong>TOTAL:</strong></td>
              <td style="text-align: right; padding: 10px 0;"><strong>$${amount.toLocaleString("es-AR")}</strong></td>
            </tr>
            <tr>
              <td style="text-align: right; padding: 5px 0; color: #666;">IVA (21%):</td>
              <td style="text-align: right; padding: 5px 0; color: #666;">$${Math.round(amount * 0.21).toLocaleString("es-AR")}</td>
            </tr>
            <tr>
              <td style="text-align: right; padding: 5px 0;"><strong>TOTAL GRAVADO:</strong></td>
              <td style="text-align: right; padding: 5px 0;"><strong>$${Math.round(amount * 1.21).toLocaleString("es-AR")}</strong></td>
            </tr>
          </tfoot>
        </table>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">
          CanchaPro - Tu sistema de reservas online<br>
          Este comprobante es válido a efectos fiscales
        </p>
      </div>
    `,
  });
}
