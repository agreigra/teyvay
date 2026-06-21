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

### Folder structure
```
teyvay/
├─ app/                          # Expo app source
│  ├─ src/
│  │  ├─ components/             # Reusable presentational UI
│  │  ├─ screens/                # One folder per screen
│  │  │  ├─ LanguageSelect/
│  │  │  ├─ Login/               # Phone + OTP
│  │  │  ├─ Home/                # Role-based dispatch
│  │  │  ├─ AnnouncementList/
│  │  │  ├─ AnnouncementDetail/
│  │  │  ├─ CreateAnnouncement/  # Sailor
│  │  │  └─ AdminDashboard/
│  │  ├─ navigation/             # Stacks + role-based routing
│  │  ├─ services/               # Supabase API calls (data layer)
│  │  │  ├─ supabase.ts          # Client init
│  │  │  ├─ auth.service.ts
│  │  │  ├─ announcements.service.ts
│  │  │  └─ settings.service.ts
│  │  ├─ hooks/                  # useAuth, useAnnouncements, useRole...
│  │  ├─ i18n/                   # i18next config + RTL handling
│  │  ├─ locales/{ar,fr,en}/     # translation.json per language
│  │  ├─ types/                  # Shared TS types (DB row types)
│  │  ├─ theme/                  # Colors, spacing, RTL-aware styles
│  │  └─ utils/                  # whatsapp.ts deep-link builder, etc.
│  ├─ App.tsx
│  ├─ app.json / app.config.ts
│  └─ .env.example
├─ supabase/
│  ├─ migrations/
│  │  ├─ 0001_init_schema.sql    # profiles, announcements, enums
│  │  ├─ 0002_roles.sql          # role helpers + profile auto-create trigger
│  │  ├─ 0003_app_settings.sql   # admin whatsapp number table
│  │  └─ 0004_rls_policies.sql   # all RLS policies
│  ├─ seed.sql
│  └─ config.toml
└─ README.md
```

### Layering (separation of concerns)
`screens` → `hooks` (state logic) → `services` (Supabase calls) → Supabase.
UI never calls Supabase directly; all DB access flows through `services`.

---

## 3. Database & migration plan

All schema changes go through `supabase/migrations/*.sql`. The DB must rebuild from scratch with `supabase db reset`. No dashboard edits.

- **0001_init_schema.sql** — `role` enum (`admin`,`sailor`,`client`), `announcement_status` enum (`active`,`sold`,`inactive`); `profiles(id uuid PK→auth.users, phone, role, display_name, created_at)`; `announcements(id uuid PK, title, description, price numeric(12,2), status, created_by→profiles, created_at, updated_at)`; indexes on `status` and `created_by`.
- **0002_roles.sql** — `handle_new_user()` trigger on `auth.users` insert → creates a `profiles` row (default `client`); `current_user_role()` and `is_admin()` `SECURITY DEFINER` helpers.
- **0003_app_settings.sql** — `app_settings(key text PK, value text)` for the admin WhatsApp number.
- **0004_rls_policies.sql** — enable RLS on all tables + policies (below).
- **seed.sql** — sample announcements + `app_settings` row for the WhatsApp number.

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

## 6. Execution phases

> Build order. Each phase ends in a commit. DB-first per the spec.

- **Phase 0 — Scaffold:** `supabase init`; create Expo TS app under `app/`; install deps (supabase-js, react-navigation, i18next, async-storage); commit.
- **Phase 1 — Database:** write migrations 0001–0004 + seed; `supabase db reset` to verify reproducibility; commit.
- **Phase 2 — Supabase client + auth:** `supabase.ts`, `auth.service.ts`, `useAuth`; phone → OTP → session flow.
- **Phase 3 — i18n + RTL:** i18next config, three locale files, Language Selection screen, RTL toggle.
- **Phase 4 — Navigation:** auth gate + role-based home dispatch (sailor / client / admin stacks).
- **Phase 5 — Core screens:** List, Detail, Create (sailor), Admin Dashboard; wired through hooks/services.
- **Phase 6 — WhatsApp:** deep-link util + Contact button on Detail.
- **Phase 7 — Polish & docs:** loading/error/empty states, finalize setup guide, env example.

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
