# Teyvay — Mauritania Marketplace (MVP)

A mobile marketplace connecting **Sailors (sellers)**, **Clients (buyers)**, and an **Admin (intermediary)**.
The app manages listings only; communication and transactions happen externally via **WhatsApp**.

- **Mobile:** React Native (Expo) + TypeScript + React Navigation
- **Backend:** Supabase (PostgreSQL, Auth, Row Level Security)
- **DB lifecycle:** Supabase CLI migrations only (versioned in Git)
- **i18n:** Arabic (primary, RTL), French, English via i18next

---

## 1. Analysis of the spec & decisions

The original spec ([prompt.md](prompt.md)) is solid but leaves gaps that must be resolved before building. Below are the decisions baked into this plan. They are also mirrored back into [prompt.md](prompt.md) so the spec and the build stay in sync.

| # | Gap in spec | Decision |
|---|-------------|----------|
| 1 | Spec defines a custom `users` table, but Supabase already owns `auth.users`. | Use a **`profiles`** table with `id` = FK to `auth.users(id)`. Never duplicate the auth table. Phone lives in `auth.users`; `profiles` holds `role` + display data. |
| 2 | How does a user get a role? Not specified. | On first login a profile row is auto-created (trigger) with default role **`client`**. A user self-selects `sailor` or `client` at onboarding; **`admin` is assigned manually** (seed/SQL only — never self-assignable). |
| 3 | RLS needs to read a user's role; naive policies recurse on `profiles`. | Use a `SECURITY DEFINER` helper `public.current_user_role()` (and `is_admin()`) that reads `profiles` without triggering RLS recursion. |
| 4 | Status values inconsistent: spec says `active/sold` but sailor can "mark inactive". | Status enum = **`active` \| `sold` \| `inactive`**. Clients see only `active`. |
| 5 | Admin WhatsApp number — where stored? | Stored in an **`app_settings`** table (key/value), readable by all authenticated users. Lets admin change it without an app release. Fallback to an Expo env var. |
| 6 | Phone OTP for Mauritania needs an SMS provider. | Supabase Auth phone OTP requires Twilio/MessageBird. Default country code **+222**. Documented in setup; dev can use Supabase test OTP. |
| 7 | Currency unspecified. | **MRU** (Mauritanian Ouguiya). `price` stored as `numeric(12,2)`. |
| 8 | Images not mentioned. | Out of scope for MVP (listings are text + price). Noted as a future enhancement (Supabase Storage). |
| 9 | Seeding an admin via pure SQL is awkward (auth.users is managed). | `seed.sql` seeds `app_settings` + sample announcements; admin promotion is a documented one-liner UPDATE after the admin signs in once. |

---

## 2. Target architecture

The app is built as **self-contained feature modules**. A thin `core/` layer holds shared infrastructure; every feature lives in its own `modules/<name>/` folder that owns its screens, hooks, services, types, and translations, and exposes a small public API through `index.ts`. You can add modules **one at a time** — each is independently buildable and only depends on `core/` (never on a sibling module's internals).

### Folder structure
```
teyvay/
├─ app/                          # Expo app source
│  ├─ src/
│  │  ├─ core/                   # shared infra — used by ALL modules
│  │  │  ├─ supabase/            # client init + typed DB helpers
│  │  │  ├─ i18n/                # i18next config, RTL toggle, locale loader
│  │  │  ├─ navigation/          # root navigator; composes module routes
│  │  │  ├─ components/          # shared UI primitives (Button, Field, Screen)
│  │  │  ├─ theme/               # colors, spacing, RTL-aware styles
│  │  │  ├─ hooks/               # cross-cutting hooks (useSession)
│  │  │  └─ types/               # shared DB row types
│  │  └─ modules/                # one folder per feature module
│  │     ├─ auth/                # phone OTP login, session, onboarding role pick
│  │     │  ├─ screens/
│  │     │  ├─ hooks/            # useAuth
│  │     │  ├─ services/         # auth.service.ts
│  │     │  ├─ locales/{ar,fr,en}.json
│  │     │  └─ index.ts          # public API: routes, exported hooks
│  │     ├─ announcements/       # list, detail, create (sailor)
│  │     ├─ admin/               # admin dashboard + moderation
│  │     └─ settings/            # language select, app_settings (whatsapp no.)
│  ├─ App.tsx
│  ├─ app.json / app.config.ts
│  └─ .env.example
├─ supabase/
│  ├─ migrations/                # one (or more) migration PER module, ordered
│  │  ├─ 0001_core_init.sql      # enums, profiles, role helpers, trigger  (core)
│  │  ├─ 0002_settings.sql       # app_settings table                      (settings)
│  │  ├─ 0003_announcements.sql  # announcements table + indexes           (announcements)
│  │  └─ 0004_rls_policies.sql   # RLS policies for all of the above
│  ├─ seed.sql
│  └─ config.toml
└─ README.md
```

### Module contract
Each module is a vertical slice and must:
1. Expose its screens/routes and any shared hooks **only** through `index.ts`.
2. Ship its own translation files (merged into i18next under a namespace).
3. Reach the DB only through its own `services/` (which use `core/supabase`).
4. Depend on `core/` and other modules' **public API** — never their internal files.

Within a module the flow is: `screens` → `hooks` (state logic) → `services` (Supabase calls) → Supabase. UI never calls Supabase directly.

---

## 3. Database & migration plan

All schema changes go through `supabase/migrations/*.sql`. The DB must rebuild from scratch with `supabase db reset`. No dashboard edits.

Migrations mirror the modules — each module contributes its own migration so the schema grows incrementally alongside the app code:

- **0001_core_init.sql** *(core)* — `role` enum (`admin`,`sailor`,`client`), `announcement_status` enum (`active`,`sold`,`inactive`); `profiles(id uuid PK→auth.users, phone, role, display_name, created_at)`; `handle_new_user()` trigger (default role `client`); `current_user_role()` / `is_admin()` `SECURITY DEFINER` helpers.
- **0002_settings.sql** *(settings module)* — `app_settings(key text PK, value text)` for the admin WhatsApp number.
- **0003_announcements.sql** *(announcements module)* — `announcements(id uuid PK, title, description, price numeric(12,2), status, created_by→profiles, created_at, updated_at)`; indexes on `status` and `created_by`.
- **0004_rls_policies.sql** — enable RLS on all tables + policies (below). Kept as one file so the full security surface is reviewable in one place.
- **seed.sql** — sample announcements + `app_settings` row for the WhatsApp number.

> Adding a new module later = add `app/src/modules/<name>/` + a new `00NN_<name>.sql` migration (+ its RLS). Nothing existing changes.

### RLS policy matrix
| Table | Sailor | Client | Admin |
|-------|--------|--------|-------|
| `announcements` SELECT | own (any status) + active | active only | all |
| `announcements` INSERT | own (`created_by = auth.uid()`) | ✗ | ✓ |
| `announcements` UPDATE | own only | ✗ | all |
| `announcements` DELETE | own only | ✗ | all |
| `profiles` SELECT | self | self | all |
| `profiles` UPDATE | self (role change blocked) | self (role change blocked) | all |
| `app_settings` SELECT | ✓ (authenticated) | ✓ | ✓ |
| `app_settings` UPDATE | ✗ | ✗ | ✓ |

All access requires an authenticated user (`auth.uid() is not null`).

---

## 4. WhatsApp deep link

`utils/whatsapp.ts` builds: `https://wa.me/<adminPhone>?text=<encoded>` where the message includes the **announcement title**, **announcement ID**, and **interest text** (translated via i18n). Admin phone comes from `app_settings`.

---

## 5. i18n & RTL

- i18next + `react-i18next`; language persisted (AsyncStorage); detected on first launch via the Language Selection screen.
- All strings in `locales/{ar,fr,en}/translation.json` — **zero hardcoded UI text**.
- RTL: when language is `ar`, call `I18nManager.forceRTL(true)` and reload; layouts use logical props / RTL-aware theme.

---

## 6. Incremental module roadmap

Build one module at a time. After each step the app **compiles and runs** — you can stop, review, and commit before starting the next. Each module ships its app slice **and** its migration together.

| Step | Module | Migration | App slice | Done when… |
|------|--------|-----------|-----------|------------|
| **0** | *Scaffold* | — | `supabase init`; Expo TS app + `core/` skeleton; deps installed | `npx expo start` boots a blank screen |
| **1** | **core** | `0001_core_init` | `core/supabase`, `core/i18n` (+ RTL), `core/theme`, `core/navigation` shell | `supabase db reset` succeeds; app renders themed shell in 3 languages |
| **2** | **settings** | `0002_settings` | Language Selection screen, `settings.service` (read/write whatsapp no.) | First-launch language pick persists; RTL flips for Arabic |
| **3** | **auth** | *(uses 0001)* | Phone+OTP login, `useAuth`, onboarding role pick (sailor/client) | Sign in via OTP → session persists → role stored on profile |
| **4** | **announcements** | `0003_announcements` | List, Detail, Create (sailor), `announcements.service`, WhatsApp deep-link on Detail | Sailor creates a listing; client browses active ones; Contact opens WhatsApp |
| **5** | **admin** | *(uses 0003)* | Admin dashboard: view all, activate/deactivate/mark sold, moderate | Admin manages any listing |
| **6** | *RLS hardening* | `0004_rls_policies` | — (enable + verify policies for every table) | Each role is confirmed limited to its matrix rows; `db reset` clean |
| **7** | *Polish* | — | loading/error/empty states, finalize setup guide + `.env.example` | MVP demo-ready end-to-end |

> RLS policies (step 6) are written incrementally as each table lands, but consolidated/verified in `0004` so the whole security surface is auditable at once. For real deployments, enable RLS per-table in the same migration that creates the table.

---

## 7. Setup guide (dev → prod)

### Prerequisites
Node 18+, Supabase CLI, Expo CLI / Expo Go, Docker (for local Supabase).

### Local
```bash
# Database
supabase init
supabase start           # local stack (Docker)
supabase db reset        # apply all migrations + seed

# App
cd app
cp .env.example .env      # set EXPO_PUBLIC_SUPABASE_URL / ANON_KEY
npm install
npx expo start
```

### Make a user admin (after they sign in once)
```sql
update public.profiles set role = 'admin' where phone = '+222XXXXXXXX';
```

### Production
1. Create a Supabase project; link: `supabase link --project-ref <ref>`.
2. Configure an SMS provider (Twilio) in Auth → Phone for OTP delivery.
3. Push schema: `supabase db push`.
4. Set `app_settings` admin WhatsApp number.
5. Build with EAS (`eas build`) for stores.

### Migration commands (reference)
```bash
supabase migration new <name>   # create a new versioned migration
supabase db reset               # rebuild DB from migrations + seed
supabase db push                # apply migrations to linked remote
```

---

## 8. Out of scope (future)
Listing images (Supabase Storage), in-app chat, push notifications, payments, categories/search filters, ratings.
