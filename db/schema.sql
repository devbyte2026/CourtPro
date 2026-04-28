CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE tenant_plan AS ENUM ('start', 'pro', 'premium');
CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'pending');
CREATE TYPE user_role AS ENUM ('owner', 'staff', 'super_admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE payment_status AS ENUM ('pending', 'approved', 'rejected', 'refunded', 'cancelled');
CREATE TYPE sport_type AS ENUM ('futbol', 'padel', 'volleyball', 'tennis', 'basketball', 'other');
CREATE TYPE blocked_reason AS ENUM ('maintenance', 'tournament', 'private', 'other');

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    custom_domain VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    city VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    logo_url TEXT,
    cover_url TEXT,
    photos TEXT[] DEFAULT '{}',
    plan tenant_plan NOT NULL DEFAULT 'start',
    status tenant_status NOT NULL DEFAULT 'pending',
    mp_access_token TEXT,
    mp_refresh_token TEXT,
    mp_token_expires_at TIMESTAMPTZ,
    mp_user_id VARCHAR(100),
    branding_config JSONB DEFAULT '{"primary_color": "#078930", "secondary_color": "#00AEEF"}',
    cancellation_policy JSONB DEFAULT '{"free_cancellation_hours": 24, "refund_percentage": 100}',
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_plan ON tenants(plan);

CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    photos TEXT[] DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_venues_tenant_id ON venues(tenant_id);
CREATE INDEX idx_venues_is_active ON venues(is_active);

CREATE TABLE courts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    sport_type sport_type NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 10,
    default_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    photos TEXT[] DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courts_venue_id ON courts(venue_id);
CREATE INDEX idx_courts_tenant_id ON courts(tenant_id);
CREATE INDEX idx_courts_sport_type ON courts(sport_type);
CREATE INDEX idx_courts_is_active ON courts(is_active);

CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(court_id, day_of_week)
);

CREATE INDEX idx_schedules_court_id ON schedules(court_id);
CREATE INDEX idx_schedules_day_of_week ON schedules(day_of_week);

CREATE TABLE pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    court_id UUID REFERENCES courts(id) ON DELETE SET NULL,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    price_modifier DECIMAL(10,2) NOT NULL DEFAULT 0,
    label VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pricing_rules_tenant_id ON pricing_rules(tenant_id);
CREATE INDEX idx_pricing_rules_court_id ON pricing_rules(court_id);
CREATE INDEX idx_pricing_rules_is_active ON pricing_rules(is_active);

CREATE TABLE tenant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'staff',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX idx_tenant_users_user_id ON tenant_users(user_id);

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    notes TEXT,
    total_bookings INTEGER DEFAULT 0,
    no_shows INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    status booking_status NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(50),
    notes TEXT,
    expires_at TIMESTAMPTZ,
    mp_payment_id VARCHAR(100),
    mp_preference_id VARCHAR(100),
    mp_merchant_order_id VARCHAR(100),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_bookings_no_overlap ON bookings (court_id, date, start_time) WHERE status IN ('pending', 'confirmed');

CREATE INDEX idx_bookings_tenant_id ON bookings(tenant_id);
CREATE INDEX idx_bookings_court_id ON bookings(court_id);
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_expires_at ON bookings(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_bookings_mp_payment_id ON bookings(mp_payment_id) WHERE mp_payment_id IS NOT NULL;

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    mp_payment_id VARCHAR(100),
    status payment_status NOT NULL DEFAULT 'pending',
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'ARS',
    payment_method VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_mp_payment_id ON payments(mp_payment_id) WHERE mp_payment_id IS NOT NULL;

CREATE TABLE recurring_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE,
    occurrences INTEGER,
    instances_count INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recurring_tenant_id ON recurring_bookings(tenant_id);
CREATE INDEX idx_recurring_court_id ON recurring_bookings(court_id);
CREATE INDEX idx_recurring_customer_id ON recurring_bookings(customer_id);
CREATE INDEX idx_recurring_is_active ON recurring_bookings(is_active);

CREATE TABLE waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    notified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_waitlist_tenant_id ON waitlist(tenant_id);
CREATE INDEX idx_waitlist_court_id ON waitlist(court_id);
CREATE INDEX idx_waitlist_customer_id ON waitlist(customer_id);
CREATE INDEX idx_waitlist_date ON waitlist(date);
CREATE INDEX idx_waitlist_notified_at ON waitlist(notified_at) WHERE notified_at IS NULL;

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan tenant_plan NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    mp_subscription_id VARCHAR(100),
    current_period_start DATE NOT NULL,
    current_period_end DATE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_tenant_id ON subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_current_period_end ON subscriptions(current_period_end);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

CREATE TABLE blocked_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    court_id UUID REFERENCES courts(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason blocked_reason NOT NULL DEFAULT 'maintenance',
    title VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blocked_slots_tenant_id ON blocked_slots(tenant_id);
CREATE INDEX idx_blocked_slots_court_id ON blocked_slots(court_id);
CREATE INDEX idx_blocked_slots_date ON blocked_slots(date);
CREATE INDEX idx_blocked_slots_reason ON blocked_slots(reason);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants are viewable by their users"
    ON tenants FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM tenant_users WHERE tenant_id = tenants.id
        )
    );

CREATE POLICY "Tenants are updatable by owners and super_admin"
    ON tenants FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id FROM tenant_users
            WHERE tenant_id = tenants.id AND role IN ('owner', 'super_admin')
        )
    );

CREATE POLICY "Tenant users viewable by members"
    ON tenant_users FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM tenant_users tu WHERE tu.tenant_id = tenant_users.tenant_id
        )
    );

CREATE POLICY "Tenant users insertable by owners"
    ON tenant_users FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM tenant_users
            WHERE tenant_id = tenant_users.tenant_id AND role = 'owner'
        )
    );

CREATE POLICY "Tenant users deletable by owners"
    ON tenant_users FOR DELETE
    USING (
        auth.uid() IN (
            SELECT user_id FROM tenant_users
            WHERE tenant_id = tenant_users.tenant_id AND role = 'owner'
        )
    );

CREATE POLICY "Venues viewable by tenant members"
    ON venues FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM tenant_users WHERE tenant_id = venues.tenant_id
        )
    );

CREATE POLICY "Venues manageable by tenant owners and staff"
    ON venues FOR ALL
    USING (
        auth.uid() IN (
            SELECT user_id FROM tenant_users
            WHERE tenant_id = venues.tenant_id AND role IN ('owner', 'staff')
        )
    );

CREATE POLICY "Courts viewable by tenant members"
    ON courts FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM tenant_users WHERE tenant_id = courts.tenant_id
        )
    );

CREATE POLICY "Courts manageable by tenant owners and staff"
    ON courts FOR ALL
    USING (
        auth.uid() IN (
            SELECT user_id FROM tenant_users
            WHERE tenant_id = courts.tenant_id AND role IN ('owner', 'staff')
        )
    );

CREATE POLICY "Schedules viewable by tenant members"
    ON schedules FOR SELECT
    USING (
        auth.uid() IN (
            SELECT tu.user_id FROM tenant_users tu
            JOIN courts c ON c.id = schedules.court_id
            WHERE tu.tenant_id = c.tenant_id
        )
    );

CREATE POLICY "Schedules manageable by tenant owners and staff"
    ON schedules FOR ALL
    USING (
        auth.uid() IN (
            SELECT tu.user_id FROM tenant_users tu
            JOIN courts c ON c.id = schedules.court_id
            WHERE tu.tenant_id = c.tenant_id AND tu.role IN ('owner', 'staff')
        )
    );

CREATE POLICY "Pricing rules viewable by tenant members"
    ON pricing_rules FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM tenant_users WHERE tenant_id = pricing_rules.tenant_id
        )
    );

CREATE POLICY "Pricing rules manageable by tenant owners and staff"
    ON pricing_rules FOR ALL
    USING (
        auth.uid() IN (
            SELECT user_id FROM tenant_users
            WHERE tenant_id = pricing_rules.tenant_id AND role IN ('owner', 'staff')
        )
    );

CREATE POLICY "Customers viewable by tenant members"
    ON customers FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM tenant_users WHERE tenant_id = customers.tenant_id
        )
    );

CREATE POLICY "Customers manageable by tenant owners and staff"
    ON customers FOR ALL
    USING (
        auth.uid() IN (
            SELECT user_id FROM tenant_users
            WHERE tenant_id = customers.tenant_id AND role IN ('owner', 'staff')
        )
    );

CREATE POLICY "Bookings viewable by tenant members"
    ON bookings FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM tenant_users WHERE tenant_id = bookings.tenant_id
        )
        OR auth.uid() = bookings.created_by
    );

CREATE POLICY "Bookings insertable by tenant members"
    ON bookings FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM tenant_users WHERE tenant_id = bookings.tenant_id
        )
    );

CREATE POLICY "Bookings updatable by tenant owners and staff"
    ON bookings FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id FROM tenant_users
            WHERE tenant_id = bookings.tenant_id AND role IN ('owner', 'staff')
        )
    );

CREATE POLICY "Bookings deletable by tenant owners and staff"
    ON bookings FOR DELETE
    USING (
        auth.uid() IN (
            SELECT user_id FROM tenant_users
            WHERE tenant_id = bookings.tenant_id AND role IN ('owner', 'staff')
        )
    );

CREATE POLICY "Payments viewable by tenant members"
    ON payments FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM tenant_users WHERE tenant_id = payments.tenant_id
        )
    );

CREATE POLICY "Payments insertable by system"
    ON payments FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Payments updatable by tenant owners and staff"
    ON payments FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id FROM tenant_users
            WHERE tenant_id = payments.tenant_id AND role IN ('owner', 'staff')
        )
    );

CREATE POLICY "Recurring bookings viewable by tenant members"
    ON recurring_bookings FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM tenant_users WHERE tenant_id = recurring_bookings.tenant_id
        )
    );

CREATE POLICY "Recurring bookings manageable by tenant owners and staff"
    ON recurring_bookings FOR ALL
    USING (
        auth.uid() IN (
            SELECT user_id FROM tenant_users
            WHERE tenant_id = recurring_bookings.tenant_id AND role IN ('owner', 'staff')
        )
    );

CREATE POLICY "Waitlist viewable by tenant members"
    ON waitlist FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM tenant_users WHERE tenant_id = waitlist.tenant_id
        )
    );

CREATE POLICY "Waitlist manageable by tenant owners and staff"
    ON waitlist FOR ALL
    USING (
        auth.uid() IN (
            SELECT user_id FROM tenant_users
            WHERE tenant_id = waitlist.tenant_id AND role IN ('owner', 'staff')
        )
    );

CREATE POLICY "Subscriptions viewable by tenant members"
    ON subscriptions FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM tenant_users WHERE tenant_id = subscriptions.tenant_id
        )
    );

CREATE POLICY "Audit logs viewable by tenant owners"
    ON audit_logs FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM tenant_users
            WHERE tenant_id = audit_logs.tenant_id AND role = 'owner'
        )
        OR auth.uid() IN (
            SELECT user_id FROM tenant_users WHERE role = 'super_admin'
        )
    );

CREATE POLICY "Blocked slots viewable by tenant members"
    ON blocked_slots FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM tenant_users WHERE tenant_id = blocked_slots.tenant_id
        )
    );

CREATE POLICY "Blocked slots manageable by tenant owners and staff"
    ON blocked_slots FOR ALL
    USING (
        auth.uid() IN (
            SELECT user_id FROM tenant_users
            WHERE tenant_id = blocked_slots.tenant_id AND role IN ('owner', 'staff')
        )
    );

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_court_availability(
    p_court_id UUID,
    p_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM bookings
    WHERE court_id = p_court_id
      AND date = p_date
      AND status IN ('pending', 'confirmed')
      AND start_time < p_end_time
      AND end_time > p_start_time
      AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id);

    RETURN v_count = 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_blocked_slot(
    p_court_id UUID,
    p_date DATE,
    p_start_time TIME,
    p_end_time TIME
)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM blocked_slots
    WHERE court_id = p_court_id
      AND date = p_date
      AND start_time < p_end_time
      AND end_time > p_start_time;

    RETURN v_count = 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION expire_pending_bookings()
RETURNS INTEGER AS $$
DECLARE
    v_expired INTEGER;
BEGIN
    UPDATE bookings
    SET status = 'cancelled', updated_at = NOW()
    WHERE status = 'pending'
      AND expires_at < NOW()
    RETURNING COUNT(*) INTO v_expired;

    RETURN v_expired;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION notify_waitlist(
    p_court_id UUID,
    p_date DATE,
    p_start_time TIME,
    p_end_time TIME
)
RETURNS UUID AS $$
DECLARE
    v_entry waitlist%ROWTYPE;
BEGIN
    SELECT * INTO v_entry
    FROM waitlist
    WHERE court_id = p_court_id
      AND date = p_date
      AND start_time = p_start_time
      AND notified_at IS NULL
    ORDER BY created_at ASC
    LIMIT 1;

    IF FOUND THEN
        UPDATE waitlist SET notified_at = NOW() WHERE id = v_entry.id;
        RETURN v_entry.customer_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_venues_updated_at
    BEFORE UPDATE ON venues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_courts_updated_at
    BEFORE UPDATE ON courts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_recurring_bookings_updated_at
    BEFORE UPDATE ON recurring_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE tenants IS 'Complejos deportivos registrados en la plataforma';
COMMENT ON TABLE tenant_users IS 'Relación entre usuarios de Auth y los complejos que administran';
COMMENT ON TABLE venues IS 'Sedes de un complejo (pueden ser múltiples direcciones)';
COMMENT ON TABLE courts IS 'Canchas individuales de una sede';
COMMENT ON TABLE schedules IS 'Horarios de operación por día de semana para cada cancha';
COMMENT ON TABLE pricing_rules IS 'Modificadores de precio por franja horaria, día, o fecha especial';
COMMENT ON TABLE customers IS 'Jugadores finales que reservan canchas';
COMMENT ON TABLE bookings IS 'Reservas individuales con estados y pagos';
COMMENT ON TABLE payments IS 'Pagos procesados por Mercado Pago';
COMMENT ON TABLE recurring_bookings IS 'Grupos fijos de reservas recurrentes';
COMMENT ON TABLE waitlist IS 'Lista de espera para horarios llenos';
COMMENT ON TABLE subscriptions IS 'Suscripciones de los tenants al SaaS';
COMMENT ON TABLE audit_logs IS 'Logs de auditoría para compliance';
COMMENT ON TABLE blocked_slots IS 'Horarios bloqueados por mantenimiento, torneos, etc';