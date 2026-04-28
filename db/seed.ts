import { createClient } from "@/lib/db/supabase-server";

const DEMO_TENANT = {
  slug: "demo",
  subdomain: "demo",
  custom_domain: null,
  name: "Complejo Deportivo Demo",
  description: "Complejo de ejemplo para probar CanchaPro",
  address: "Av. Libertador 5000, Buenos Aires",
  city: "Buenos Aires",
  phone: "+54 11 5555-5555",
  email: "demo@canchapro.app",
  plan: "pro" as const,
  status: "active" as const,
  photos: [
    "https://recreasport.com/wp-content/uploads/2017/04/SAM_0191-2.jpg",
    "https://www.competize.com/blog/wp-content/uploads/2020/10/cancha-futbol-sintetica-artifical-pasto-natural-750x500.jpg",
    "https://img.olympics.com/images/image/private/t_s_16_9_g_auto/t_s_w1460/f_auto/primary/g6homnktejpgiirh4iot",
    "https://img.freepik.com/foto-gratis/paddle-tennis-linea-blanca_23-2149459021.jpg?semt=ais_hybrid&w=740&q=80",
  ] as string[],
  branding_config: {
    primary_color: "#CAFF00",
    secondary_color: "#0A1628",
    logo_url: null,
    cover_url: "https://recreasport.com/wp-content/uploads/2017/04/SAM_0191-2.jpg",
  },
  cancellation_policy: {
    free_cancellation_hours: 24,
    refund_percentage: 100,
  },
};

const DEMO_VENUE = {
  name: "Sede Principal",
  address: "Av. Libertador 5000",
  city: "Buenos Aires",
  phone: "+54 11 5555-5555",
  email: "demo@canchapro.app",
  photos: [
    "https://recreasport.com/wp-content/uploads/2017/04/SAM_0191-2.jpg",
    "https://www.competize.com/blog/wp-content/uploads/2020/10/cancha-futbol-sintetica-artifical-pasto-natural-750x500.jpg",
    "https://img.olympics.com/images/image/private/t_s_16_9_g_auto/t_s_w1460/f_auto/primary/g6homnktejpgiirh4iot",
    "https://img.freepik.com/foto-gratis/paddle-tennis-linea-blanca_23-2149459021.jpg?semt=ais_hybrid&w=740&q=80",
  ] as string[],
};

const DEMO_COURTS = [
  { name: "Cancha 1 - Fútbol 5", sport_type: "futbol" as const, capacity: 10, default_price: 5000, duration_minutes: 60, photos: ["https://www.competize.com/blog/wp-content/uploads/2020/10/cancha-futbol-sintetica-artifical-pasto-natural-750x500.jpg"] },
  { name: "Cancha 2 - Fútbol 5", sport_type: "futbol" as const, capacity: 10, default_price: 5000, duration_minutes: 60, photos: ["https://www.competize.com/blog/wp-content/uploads/2020/10/cancha-futbol-sintetica-artifical-pasto-natural-750x500.jpg"] },
  { name: "Cancha 3 - Pádel", sport_type: "padel" as const, capacity: 4, default_price: 3500, duration_minutes: 60, photos: ["https://img.freepik.com/foto-gratis/paddle-tennis-linea-blanca_23-2149459021.jpg?semt=ais_hybrid&w=740&q=80"] },
  { name: "Cancha 4 - Pádel", sport_type: "padel" as const, capacity: 4, default_price: 3500, duration_minutes: 60, photos: ["https://img.freepik.com/foto-gratis/paddle-tennis-linea-blanca_23-2149459021.jpg?semt=ais_hybrid&w=740&q=80"] },
  { name: "Cancha 5 - Voley", sport_type: "volleyball" as const, capacity: 12, default_price: 4000, duration_minutes: 60, photos: ["https://img.olympics.com/images/image/private/t_s_16_9_g_auto/t_s_w1460/f_auto/primary/g6homnktejpgiirh4iot"] },
];

const SCHEDULE_TIMES = [
  { start: "08:00", end: "09:00" },
  { start: "09:00", end: "10:00" },
  { start: "10:00", end: "11:00" },
  { start: "11:00", end: "12:00" },
  { start: "12:00", end: "13:00" },
  { start: "13:00", end: "14:00" },
  { start: "14:00", end: "15:00" },
  { start: "15:00", end: "16:00" },
  { start: "16:00", end: "17:00" },
  { start: "17:00", end: "18:00" },
  { start: "18:00", end: "19:00" },
  { start: "19:00", end: "20:00" },
  { start: "20:00", end: "21:00" },
  { start: "21:00", end: "22:00" },
  { start: "22:00", end: "23:00" },
  { start: "23:00", end: "00:00" },
];

async function seed() {
  console.log("🌱 Starting seed...");

  const supabase = await createClient();

  // Check if demo tenant already exists
  const { data: existingTenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("subdomain", "demo")
    .single();

  if (existingTenant) {
    console.log("⚠️  Demo tenant already exists. Deleting...");
    await supabase.from("tenants").delete().eq("id", existingTenant.id);
  }

  // Create tenant
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert(DEMO_TENANT)
    .select()
    .single();

  if (tenantError || !tenant) {
    console.error("❌ Error creating tenant:", tenantError);
    return;
  }

  console.log("✅ Created tenant:", tenant.name);

  // Create venue
  const { data: venue, error: venueError } = await supabase
    .from("venues")
    .insert({ ...DEMO_VENUE, tenant_id: tenant.id })
    .select()
    .single();

  if (venueError || !venue) {
    console.error("❌ Error creating venue:", venueError);
    return;
  }

  console.log("✅ Created venue:", venue.name);

  // Create courts
  for (const court of DEMO_COURTS) {
    const { data: createdCourt, error: courtError } = await supabase
      .from("courts")
      .insert({
        ...court,
        venue_id: venue.id,
        tenant_id: tenant.id,
      })
      .select()
      .single();

    if (courtError || !createdCourt) {
      console.error("❌ Error creating court:", courtError);
      continue;
    }

    console.log("✅ Created court:", createdCourt.name);

    // Create schedules for this court (Mon-Sun, 8am-midnight)
    const schedules = [];
    for (let day = 0; day <= 6; day++) {
      for (const time of SCHEDULE_TIMES) {
        schedules.push({
          court_id: createdCourt.id,
          day_of_week: day,
          start_time: time.start,
          end_time: time.end,
          is_active: true,
        });
      }
    }

    const { error: scheduleError } = await supabase
      .from("schedules")
      .insert(schedules);

    if (scheduleError) {
      console.error("❌ Error creating schedules for", createdCourt.name, scheduleError);
    } else {
      console.log("   ✅ Created", schedules.length, "schedule slots");
    }
  }

  console.log("\n🎉 Seed completed successfully!");
  console.log("📍 Access your demo at: http://localhost:3000?tenant=demo");
}

seed().catch(console.error);