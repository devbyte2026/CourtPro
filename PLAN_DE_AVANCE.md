# Plan de Desarrollo — SaaS Reservas Canchas

## Estados
- [ ] Pendiente
- [x] Completado
- [ ] En progreso

---

## Producto: CanchaPro

> SaaS de reservas para complejos deportivos en LATAM. Cada complejo obtiene su propio sistema (panel admin + página pública) tipo "Shopify para canchas".

**Stack**: Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui + Supabase + Mercado Pago + Gmail SMTP (nodemailer) + Upstash Redis + Vercel + PWA + PostHog

---

## Fase 0 — Preparación previa al código

- [x] Definir nombre del producto y comprar dominio principal *(CanchaPro - dominio pendiente)*
- [ ] Crear cuenta de Supabase (proyecto + DB password guardada)
- [ ] Crear cuenta de Vercel y conectar repo
- [ ] Crear cuenta de Resend y verificar dominio para emails
- [ ] Crear cuenta de Mercado Pago Developers y obtener credenciales sandbox
- [ ] Crear cuenta de Upstash (Redis) — plan free alcanza para arrancar
- [ ] Crear cuenta de PostHog o Plausible
- [x] Definir paleta de colores definitiva *(Ver design-tokens.ts - verde/celeste deportivo)*
- [ ] Conseguir referencias visuales: screenshots de Playtomic, MATCHi, Cal.com, Linear
- [ ] Crear repo en GitHub
- [x] Setup .env.example con todas las variables necesarias

---

## Fase 1 — Setup base del proyecto

- [x] npx create-next-app@latest con TypeScript, Tailwind, App Router, ESLint
- [x] Instalar y configurar shadcn/ui
- [x] Configurar Prettier + ESLint
- [x] Setup de t3-env para variables de entorno tipadas (zod)
- [x] Crear estructura de carpetas: app/, components/, lib/, db/, services/, types/, hooks/
- [x] Crear lib/design-tokens.ts con paleta, tipografía, spacing, radius, shadows
- [x] Configurar fuente (Geist) en el layout raíz
- [x] Setup de Supabase client (server y browser) - src/lib/db/
- [x] Setup de Upstash Redis client - src/lib/db/redis.ts
- [ ] Configurar commits convencionales (commitlint + husky opcional)
- [ ] Deploy inicial a Vercel para validar pipeline

---

## Fase 2 — Schema de base de datos

- [x] Diseñar schema completo en SQL - db/schema.sql
- [x] Crear tabla tenants (id, slug, subdomain, custom_domain, plan, status, mp_access_token, mp_user_id, branding_config, cancellation_policy)
- [x] Crear tabla tenant_users (tenant_id, user_id, role: owner/staff)
- [x] Crear tabla venues (sedes)
- [x] Crear tabla courts (canchas: sport_type, name, capacity, default_price)
- [x] Crear tabla schedules (horarios de operación por día de semana)
- [x] Crear tabla pricing_rules (precios por franja, día, fecha especial)
- [x] Crear tabla customers (jugadores finales scoped al tenant)
- [x] Crear tabla bookings (con constraint único (court_id, date, start_time) para status pending/confirmed)
- [x] Crear tabla payments
- [x] Crear tabla recurring_bookings
- [x] Crear tabla waitlist
- [x] Crear tabla subscriptions (de los tenants hacia nosotros)
- [x] Crear tabla audit_logs
- [x] Crear tabla blocked_slots (mantenimiento, torneos)
- [x] Activar RLS en todas las tablas multi-tenant
- [x] Escribir policies de RLS (SELECT, INSERT, UPDATE, DELETE) por rol
- [x] Crear índices en columnas frecuentes (tenant_id, date, court_id, status)
- [x] Crear funciones SQL auxiliares (expire_pending_bookings, check_court_availability, notify_waitlist)
- [x] Generar tipos TypeScript desde el schema - src/types/database.ts
- [ ] Probar RLS con queries desde diferentes usuarios *(requiere Supabase configurado)*

---

## Fase 3 — Auth y multi-tenancy

- [x] Configurar Supabase Auth (email magic link + Google OAuth) - Magic link listo
- [x] Páginas de login y signup - src/app/login, src/app/signup
- [x] Middleware de Next.js que detecta subdominio y resuelve tenant_id - src/middleware.ts
- [x] Helper getCurrentTenant() server-side - src/lib/auth-helpers.ts
- [x] Helper requireAuth() y requireTenantOwner() para proteger rutas
- [x] Manejo de sesión y refresh
- [ ] Rutas protegidas para panel admin *(Fase 7)*
- [x] Rutas públicas para la página del complejo *(Fase 5)*
- [x] Logout funcional - /api/auth/logout

---

## Fase 4 — Onboarding del dueño (wizard)

- [x] Página /signup para nuevo dueño
- [x] Wizard paso 1: datos del complejo (nombre, slug, descripción, dirección, logo, foto portada)
- [x] Wizard paso 2: cargar canchas con templates (fútbol 5, pádel, vóley)
- [x] Wizard paso 3: horarios de operación + precios por franja
- [x] Wizard paso 4: conexión OAuth con Mercado Pago
- [x] Wizard paso 5: pantalla final con link y QR para compartir
- [x] Persistencia parcial del progreso (puede salir y volver)
- [x] Validación con Zod en cada paso
- [x] Estados loading y error bien diseñados

---

## Fase 5 — Página pública del complejo

- [x] Layout público con resolución de tenant por subdominio
- [x] Hero con foto, nombre, descripción, ubicación
- [x] Galería de fotos
- [x] Sección "reglas e info"
- [x] Grilla visual de reservas (mobile-first, scroll horizontal)
- [x] Selector de cancha y duración
- [x] Indicadores visuales: disponible / ocupado / seleccionado / pasado
- [x] Modal/sheet de confirmación de reserva con resumen y precio
- [x] Login/signup del jugador con magic link (lazy: solo al reservar)
- [x] Perfil del jugador con historial de reservas
- [x] Botón "repetir reserva"
- [x] Customización visual aplicada (color, logo, foto portada del tenant)

---

## Fase 6 — Flujo de reserva y pago

- [x] Server action createBookingHold con lock optimista vía constraint único
- [x] Persistencia del hold en DB con expires_at
- [x] Lock distribuido en Redis para evitar race conditions extremas
- [x] Integración con MP Checkout Pro (init point)
- [x] Página de redirect / loading durante el pago
- [x] Endpoint /api/webhooks/mercadopago con verificación de firma
- [x] Lógica de confirmación de booking desde el webhook
- [x] Páginas success / failure / pending después del pago
- [x] Cron job en Vercel cada minuto que libera holds vencidos
- [ ] Cron job que envía recordatorios 2hs antes del turno
- [ ] Manejo de pagos rechazados, pendientes, fallidos
- [x] Logs detallados de cada webhook recibido
- [ ] Tests unitarios del flujo de reserva

---

## Fase 7 — Panel admin del dueño

- [x] Layout del panel con sidebar y navegación
- [x] Dashboard con métricas:
  - [x] Ingresos del día / semana / mes
  - [x] Cantidad de reservas
  - [x] Tasa de ocupación
  - [ ] Heatmap semanal de ocupación por hora
  - [x] Top clientes (por frecuencia)
  - [ ] No-shows y cancelaciones
  - [ ] Comparativa vs período anterior
- [ ] Calendario admin (vista día / semana / mes)
- [ ] Drag & drop para mover reservas
- [ ] Reserva manual (crear booking sin pago online)
- [ ] Bloqueo de horarios (mantenimiento, torneos, uso propio)
- [ ] Caja del día con desglose por método de pago
- [x] Lista de reservas con filtros (fecha, estado, cancha, cliente)
- [ ] Detalle de reserva con acciones: cancelar, marcar no-show, marcar pagada, reembolsar
- [ ] Lista de clientes (CRM básico) con historial

---

## Fase 8 — Configuración del complejo

- [x] Sección "Mi complejo": editar nombre, descripción, fotos, ubicación
- [x] Sección "Canchas": CRUD completo con tipo, capacidad, precio default
- [x] Sección "Horarios": editar horarios de operación por día
- [ ] Sección "Precios": reglas de pricing por franja, día, fecha especial
- [x] Sección "Política de cancelación": configurable (horas antes, % de reembolso)
- [x] Sección "Branding": color principal, logo, foto portada, descripción pública
- [x] Sección "Mercado Pago": estado de la conexión, reconectar
- [ ] Sección "Equipo": invitar staff con rol limitado
- [ ] Generar PDF imprimible con QR del link de reservas

---

## Fase 9 — Features avanzadas del MVP

- [x] Reservas recurrentes: crear grupo fijo (ej: martes 21hs por 12 semanas)
- [x] Vista admin para gestionar reservas recurrentes
- [x] Lista de espera: el jugador se anota cuando un horario está lleno
- [x] Notificación automática al primero en lista cuando se libera un horario
- [ ] Multi-sede (plan Premium): un dueño con varios complejos
- [x] Reglas de cancelación aplicadas automáticamente al cancelar
- [x] Reembolso automático parcial vía MP cuando aplique

---

## Fase 10 — Comunicación con el cliente final

- [x] Setup de Gmail SMTP (nodemailer) + App Password
- [x] Templates de email (React Email):
  - [x] Confirmación de reserva
  - [x] Recordatorio 2hs antes
  - [x] Cancelación
  - [x] Reembolso procesado
  - [x] Magic link de login
  - [x] Lista de espera: turno disponible
- [x] Cola de envío con reintentos en caso de fallo
- [ ] Interface lista para integrar WhatsApp después (Twilio o Wapi.cloud)
- [ ] Variable feature flag para activar WhatsApp por tenant

---

## Fase 11 — Panel super admin (nosotros)

- [x] Auth separada o role-check estricto para super admin
- [x] Lista de todos los tenants con estado, plan, MRR
- [x] Detalle de tenant con métricas y acciones
- [x] Métricas globales del SaaS:
  - [x] MRR / ARR
  - [x] Tenants activos / churn / nuevos
  - [x] Reservas totales y GMV procesado por la plataforma
  - [x] Top tenants por uso
- [ ] Gestión manual de planes y suscripciones
- [ ] Logs de errores y webhooks fallidos con reintento manual
- [ ] Impersonate tenant (para debug y soporte)
- [ ] Auditoría de acciones críticas

---

## Fase 12 — Billing del SaaS (cobrarles a los tenants)

- [x] Decidir: cobro manual al inicio o automatizado con Stripe / MP suscripciones
- [x] Dashboard interno con estado de pago y vencimientos (subscription-page.tsx)
- [ ] Si automatizado: integrar suscripciones de MP o Stripe (proces manual por ahora)
- [x] Página de "Mi suscripción" para el tenant
- [ ] Cambio de plan (upgrade / downgrade) con prorateo (sin MP, cambio inmediato)
- [ ] Suspensión automática del tenant si no paga (con período de gracia) - cron marca como expired pero no suspende acceso
- [x] Email de aviso de vencimiento próximo y vencido (sendSubscriptionExpiringReminder, sendSubscriptionExpired)
- [x] Facturación / recibos descargables (sendInvoice template)

---

## Fase 13 — PWA

- [x] Crear manifest.json con icons en todos los tamaños (192, 512, maskable)
- [x] Generar icons desde el logo (usar herramienta tipo PWA Asset Generator)
- [x] Configurar next-pwa o service worker custom
- [x] Estrategia de caché: network-first para datos, cache-first para assets
- [x] Botón "Instalar app" condicional al evento beforeinstallprompt
- [x] Push notifications (Web Push API + VAPID keys)
- [ ] Permitir al jugador opt-in a recordatorios push
- [x] Modo offline básico con mensaje claro y datos cacheados
- [ ] Splash screen y theme color

---

## Fase 14 — Subdominios y dominios custom

- [x] Validar resolución de subdominio en middleware
- [x] Para Premium: UI para agregar dominio custom (`/api/admin/domain`, `domain-config.tsx`)
- [ ] Configurar wildcard DNS *.tuapp.com apuntando a Vercel
- [ ] Configurar Vercel para aceptar wildcard subdomains
- [ ] Integrar Vercel Domains API para agregar dominios programáticamente
- [ ] Validar verificación de DNS (TXT record) y emisión de SSL automática

---

## Fase 15 — Analytics y monitoreo

- [x] Integrar PostHog (`AnalyticsProvider`, `useAnalytics`, `useBookingAnalytics`, `useTenantAnalytics`)
- [x] Eventos clave: signup, onboarding completado, primera reserva, primer pago, churn
- [ ] Dashboard interno con embudo de activación de tenants
- [ ] Sentry para error tracking
- [ ] Logs estructurados (Axiom, Logflare o similar)
- [x] Healthchecks de cron jobs y webhooks (`/api/health`)

---

## Fase 16 — Testing

- [x] Tests unitarios de la lógica de pricing (con franjas, descuentos, etc.) - 16 tests passing
- [x] Tests unitarios del cálculo de disponibilidad
- [ ] Tests unitarios de la expiración de holds
- [ ] Tests de integración del webhook de MP
- [ ] Tests E2E del flujo completo de reserva (Playwright config ready)
- [ ] Tests E2E del onboarding del dueño
- [ ] Tests de carga básico para detectar cuellos de botella en grilla de reservas

---

## Fase 17 — Pre-lanzamiento

- [ ] Revisión completa de RLS y policies (test con varios tenants)
- [ ] Auditoría de seguridad básica (headers, CORS, rate limiting)
- [ ] Privacy policy y términos y condiciones
- [ ] Banner de cookies si aplica
- [x] Página de landing comercial del SaaS (separada de la app)
  - Paleta Lima Eléctrico: #0A1628 (navy), #111F35, #1A2D47, #CAFF00 (lima), #F0F4F8, #6B7F94
  - Navbar flotante con logo "CANCHAPRO" bold, links muted, Login en lima
  - Hero con badge "RESERVAS ONLINE · AR", headline "TU CANCHA, CUANDO QUIERAS", sport chips FUT/PAD/VOL
  - Court lines decorativas SVG en background (opacity 0.04)
  - Stats con números grandes en #CAFF00 y count-up animado
  - Cómo funciona: 3 pasos numerados 01/02/03 con línea conectora
  - Features: 6 cards con iconos Lucide en lima, hover borde lima
  - Precios: 3 cards, Pro con borde lima y badge "Más elegido", toggle mensual/anual
  - Testimonials: 3 cards navy con estrellas en lima
  - CTA final con botón lima glow
  - Footer navy, "CanchaPro © 2025"
  - Animaciones: parallax hero, fade-in-up, glow lima, pulse-glow en CTA
- [ ] Documentación interna del producto
- [ ] FAQ para los dueños
- [ ] Onboarding video / loom de 3 minutos
- [ ] Checklist de QA en mobile real (iOS y Android)
- [ ] Backup automático de DB configurado en Supabase
- [ ] Plan de soporte: email, WhatsApp, horario

---

## Fase 18 — Lanzamiento beta

- [ ] Conseguir 3-5 complejos beta (gratis o con descuento fuerte)
- [ ] Onboarding asistido 1 a 1
- [ ] Recolectar feedback semanal
- [ ] Iterar sobre fricciones detectadas
- [ ] Validar que el flujo de reserva funcione bajo uso real
- [ ] Validar tiempos de respuesta del webhook de MP
- [ ] Ajustar precios de los planes según feedback
- [ ] Casos de éxito y testimonials para la landing

---

## Backlog (NO MVP)

- [ ] Verificación automática de comprobantes de transferencia (OCR + IA + match con MP API)
- [ ] Split de pago entre jugadores
- [ ] App nativa con Capacitor o React Native
- [ ] Sistema de torneos
- [ ] Reviews y ratings post-partido
- [ ] Coach booking
- [ ] Tienda de productos del complejo
- [ ] Programa de fidelización / puntos
- [ ] Marketplace de canchas (búsqueda global por ciudad/deporte)
- [ ] API pública para integradores
- [ ] White-label completo (Premium+)