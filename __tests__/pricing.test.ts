import {
  calculateBookingPrice,
  isTimeSlotAvailable,
  generateTimeSlots,
} from "@/lib/pricing";
import type { PricingRule } from "@/types/database";

describe("Pricing Calculation", () => {
  describe("calculateBookingPrice", () => {
    it("returns base price when no rules apply", () => {
      const result = calculateBookingPrice({
        courtBasePrice: 5000,
        date: "2024-03-15",
        startTime: "10:00",
        endTime: "11:00",
        pricingRules: [],
      });

      expect(result.basePrice).toBe(5000);
      expect(result.finalPrice).toBe(5000);
      expect(result.modifiers).toHaveLength(0);
    });

    it("applies flat price modifier", () => {
      const rules: PricingRule[] = [
        {
          id: "rule-1",
          tenant_id: "tenant-1",
          court_id: null,
          day_of_week: null,
          start_time: "00:00",
          end_time: "23:59",
          price_modifier: 1000,
          label: "Peak hours",
          is_active: true,
          created_at: "",
        },
      ];

      const result = calculateBookingPrice({
        courtBasePrice: 5000,
        date: "2024-03-15",
        startTime: "10:00",
        endTime: "11:00",
        pricingRules: rules,
      });

      expect(result.finalPrice).toBe(6000);
      expect(result.modifiers).toHaveLength(1);
      expect(result.modifiers[0].amount).toBe(1000);
    });

    it("applies day-of-week specific rule", () => {
      const rules: PricingRule[] = [
        {
          id: "rule-weekend",
          tenant_id: "tenant-1",
          court_id: null,
          day_of_week: 6,
          start_time: "00:00",
          end_time: "23:59",
          price_modifier: 2000,
          label: "Saturday surcharge",
          is_active: true,
          created_at: "",
        },
      ];

      const saturdayResult = calculateBookingPrice({
        courtBasePrice: 5000,
        date: "2024-03-16T14:00:00-03:00",
        startTime: "10:00",
        endTime: "11:00",
        pricingRules: rules,
      });
      expect(saturdayResult.finalPrice).toBe(7000);

      const sundayResult = calculateBookingPrice({
        courtBasePrice: 5000,
        date: "2024-03-17T14:00:00-03:00",
        startTime: "10:00",
        endTime: "11:00",
        pricingRules: rules,
      });
      expect(sundayResult.finalPrice).toBe(5000);
    });

    it("applies time-specific rule", () => {
      const rules: PricingRule[] = [
        {
          id: "rule-night",
          tenant_id: "tenant-1",
          court_id: null,
          day_of_week: null,
          start_time: "22:00",
          end_time: "06:00",
          price_modifier: 1500,
          label: "Night surcharge",
          is_active: true,
          created_at: "",
        },
      ];

      const nightResult = calculateBookingPrice({
        courtBasePrice: 5000,
        date: "2024-03-15",
        startTime: "23:00",
        endTime: "00:00",
        pricingRules: rules,
      });
      expect(nightResult.finalPrice).toBe(6500);

      const dayResult = calculateBookingPrice({
        courtBasePrice: 5000,
        date: "2024-03-15",
        startTime: "14:00",
        endTime: "15:00",
        pricingRules: rules,
      });
      expect(dayResult.finalPrice).toBe(5000);
    });

    it("ensures price is never negative", () => {
      const rules: PricingRule[] = [
        {
          id: "rule-discount",
          tenant_id: "tenant-1",
          court_id: null,
          day_of_week: null,
          start_time: "00:00",
          end_time: "23:59",
          price_modifier: -10000,
          label: "Big discount",
          is_active: true,
          created_at: "",
        },
      ];

      const result = calculateBookingPrice({
        courtBasePrice: 5000,
        date: "2024-03-15",
        startTime: "10:00",
        endTime: "11:00",
        pricingRules: rules,
      });

      expect(result.finalPrice).toBe(0);
    });

    it("ignores inactive rules", () => {
      const rules: PricingRule[] = [
        {
          id: "rule-inactive",
          tenant_id: "tenant-1",
          court_id: null,
          day_of_week: null,
          start_time: "00:00",
          end_time: "23:59",
          price_modifier: 5000,
          label: "Inactive rule",
          is_active: false,
          created_at: "",
        },
      ];

      const result = calculateBookingPrice({
        courtBasePrice: 5000,
        date: "2024-03-15",
        startTime: "10:00",
        endTime: "11:00",
        pricingRules: rules,
      });

      expect(result.finalPrice).toBe(5000);
    });
  });

  describe("isTimeSlotAvailable", () => {
    const existingBookings = [
      {
        date: "2024-03-15",
        start_time: "14:00",
        end_time: "15:00",
        status: "confirmed" as const,
      },
      {
        date: "2024-03-15",
        start_time: "16:00",
        end_time: "17:00",
        status: "pending" as const,
      },
    ];

    const blockedSlots = [
      {
        date: "2024-03-15",
        start_time: "10:00",
        end_time: "11:00",
      },
    ];

    it("returns true for available slot", () => {
      const result = isTimeSlotAvailable({
        courtId: "court-1",
        date: "2024-03-15",
        startTime: "12:00",
        endTime: "13:00",
        existingBookings,
        blockedSlots,
      });

      expect(result).toBe(true);
    });

    it("returns false when overlapping with confirmed booking", () => {
      const result = isTimeSlotAvailable({
        courtId: "court-1",
        date: "2024-03-15",
        startTime: "14:30",
        endTime: "15:30",
        existingBookings,
        blockedSlots,
      });

      expect(result).toBe(false);
    });

    it("returns false when overlapping with pending booking", () => {
      const result = isTimeSlotAvailable({
        courtId: "court-1",
        date: "2024-03-15",
        startTime: "15:30",
        endTime: "16:30",
        existingBookings,
        blockedSlots,
      });

      expect(result).toBe(false);
    });

    it("returns false when overlapping with blocked slot", () => {
      const result = isTimeSlotAvailable({
        courtId: "court-1",
        date: "2024-03-15",
        startTime: "10:30",
        endTime: "11:30",
        existingBookings,
        blockedSlots,
      });

      expect(result).toBe(false);
    });

    it("returns true for same time as booking on different date", () => {
      const result = isTimeSlotAvailable({
        courtId: "court-1",
        date: "2024-03-16",
        startTime: "14:00",
        endTime: "15:00",
        existingBookings,
        blockedSlots,
      });

      expect(result).toBe(true);
    });

    it("returns true for adjacent slot before booking", () => {
      const result = isTimeSlotAvailable({
        courtId: "court-1",
        date: "2024-03-15",
        startTime: "13:00",
        endTime: "14:00",
        existingBookings,
        blockedSlots,
      });

      expect(result).toBe(true);
    });
  });

  describe("generateTimeSlots", () => {
    it("generates hourly slots", () => {
      const slots = generateTimeSlots("09:00", "17:00", 60);

      expect(slots).toHaveLength(8);
      expect(slots[0]).toEqual({ start: "09:00", end: "10:00" });
      expect(slots[7]).toEqual({ start: "16:00", end: "17:00" });
    });

    it("generates 30-minute slots", () => {
      const slots = generateTimeSlots("09:00", "11:00", 30);

      expect(slots).toHaveLength(4);
      expect(slots[0]).toEqual({ start: "09:00", end: "09:30" });
      expect(slots[3]).toEqual({ start: "10:30", end: "11:00" });
    });

    it("handles non-aligned end time", () => {
      const slots = generateTimeSlots("09:00", "10:30", 60);

      expect(slots).toHaveLength(1);
      expect(slots[0]).toEqual({ start: "09:00", end: "10:00" });
    });

    it("returns empty array when no slots fit", () => {
      const slots = generateTimeSlots("09:00", "09:30", 60);
      expect(slots).toHaveLength(0);
    });
  });
});
