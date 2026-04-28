import type { PricingRule, Booking } from "@/types/database";

export interface PriceCalculationInput {
  courtBasePrice: number;
  date: string;
  startTime: string;
  endTime: string;
  pricingRules?: PricingRule[];
}

export interface PriceBreakdown {
  basePrice: number;
  modifiers: { label: string; amount: number }[];
  finalPrice: number;
}

export function calculateBookingPrice(input: PriceCalculationInput): PriceBreakdown {
  const { courtBasePrice, date, startTime, endTime, pricingRules = [] } = input;

  const dayOfWeek = new Date(date).getDay();
  const startHour = parseInt(startTime.split(":")[0], 10);

  let finalPrice = courtBasePrice;
  const modifiers: { label: string; amount: number }[] = [];

  const applicableRules = pricingRules.filter((rule) => {
    if (!rule.is_active) return false;

    const dayMatch = rule.day_of_week === null || rule.day_of_week === dayOfWeek;

    if (!dayMatch) return false;

    const ruleStartHour = parseInt(rule.start_time.split(":")[0], 10);
    const ruleEndHour = parseInt(rule.end_time.split(":")[0], 10);

    if (ruleStartHour <= ruleEndHour) {
      return startHour >= ruleStartHour && startHour < ruleEndHour;
    } else {
      return startHour >= ruleStartHour || startHour < ruleEndHour;
    }
  });

  for (const rule of applicableRules) {
    const amount = typeof rule.price_modifier === "string"
      ? parseFloat(rule.price_modifier)
      : rule.price_modifier;

    if (amount !== 0) {
      finalPrice += amount;
      modifiers.push({
        label: rule.label || `Modificador ${rule.id.slice(0, 8)}`,
        amount,
      });
    }
  }

  return {
    basePrice: courtBasePrice,
    modifiers,
    finalPrice: Math.max(0, finalPrice),
  };
}

export function isTimeSlotAvailable(params: {
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  existingBookings: Pick<Booking, "date" | "start_time" | "end_time" | "status">[];
  blockedSlots: { date: string; start_time: string; end_time: string }[];
}): boolean {
  const { courtId, date, startTime, endTime, existingBookings, blockedSlots } = params;

  const requestedStart = timeToMinutes(startTime);
  const requestedEnd = timeToMinutes(endTime);

  for (const booking of existingBookings) {
    if (
      booking.date === date &&
      (booking.status === "pending" || booking.status === "confirmed")
    ) {
      const bookingStart = timeToMinutes(booking.start_time);
      const bookingEnd = timeToMinutes(booking.end_time);

      if (requestedStart < bookingEnd && requestedEnd > bookingStart) {
        return false;
      }
    }
  }

  for (const slot of blockedSlots) {
    if (slot.date === date) {
      const slotStart = timeToMinutes(slot.start_time);
      const slotEnd = timeToMinutes(slot.end_time);

      if (requestedStart < slotEnd && requestedEnd > slotStart) {
        return false;
      }
    }
  }

  return true;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number
): { start: string; end: string }[] {
  const slots: { start: string; end: string }[] = [];
  let current = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  while (current + durationMinutes <= end) {
    slots.push({
      start: minutesToTime(current),
      end: minutesToTime(current + durationMinutes),
    });
    current += durationMinutes;
  }

  return slots;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}
