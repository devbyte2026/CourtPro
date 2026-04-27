export type TenantPlan = "start" | "pro" | "premium";
export type TenantStatus = "active" | "suspended" | "pending";
export type UserRole = "owner" | "staff" | "super_admin";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
export type PaymentStatus = "pending" | "approved" | "rejected" | "refunded" | "cancelled";
export type SportType = "futbol" | "padel" | "volleyball" | "tennis" | "basketball" | "other";

export interface Tenant {
  id: string;
  slug: string;
  subdomain: string | null;
  custom_domain: string | null;
  name: string;
  description: string | null;
  address: string | null;
  logo_url: string | null;
  cover_url: string | null;
  plan: TenantPlan;
  status: TenantStatus;
  mp_access_token: string | null;
  mp_user_id: string | null;
  branding_config: BrandingConfig | null;
  cancellation_policy: CancellationPolicy | null;
  created_at: string;
  updated_at: string;
}

export interface BrandingConfig {
  primary_color: string;
  secondary_color: string;
  logo_url: string | null;
  cover_url: string | null;
}

export interface CancellationPolicy {
  free_cancellation_hours: number;
  refund_percentage: number;
}

export interface TenantUser {
  id: string;
  tenant_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface Venue {
  id: string;
  tenant_id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  photos: string[];
  created_at: string;
  updated_at: string;
}

export interface Court {
  id: string;
  venue_id: string;
  tenant_id: string;
  name: string;
  sport_type: SportType;
  capacity: number;
  default_price: number;
  photos: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  court_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface PricingRule {
  id: string;
  tenant_id: string;
  court_id: string | null;
  day_of_week: number | null;
  start_time: string;
  end_time: string;
  price_modifier: number;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  tenant_id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  tenant_id: string;
  court_id: string;
  customer_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  total_amount: number;
  payment_method: "mercadopago" | "cash" | "transfer";
  notes: string | null;
  expires_at: string | null;
  mp_payment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  tenant_id: string;
  mp_payment_id: string | null;
  status: PaymentStatus;
  amount: number;
  method: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecurringBooking {
  id: string;
  tenant_id: string;
  court_id: string;
  customer_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  price: number;
  start_date: string;
  end_date: string | null;
  occurrences: number;
  is_active: boolean;
  created_at: string;
}

export interface Waitlist {
  id: string;
  tenant_id: string;
  court_id: string;
  customer_id: string;
  date: string;
  start_time: string;
  end_time: string;
  notified_at: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  tenant_id: string;
  plan: TenantPlan;
  status: "active" | "cancelled" | "pending" | "expired";
  mp_subscription_id: string | null;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  tenant_id: string | null;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface BlockedSlot {
  id: string;
  tenant_id: string;
  court_id: string | null;
  date: string;
  start_time: string;
  end_time: string;
  reason: "maintenance" | "tournament" | "private" | "other";
  created_at: string;
}