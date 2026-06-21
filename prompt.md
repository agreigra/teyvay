You are a senior full-stack engineer. Build a production-ready MVP mobile marketplace application.

1. Product overview

A marketplace application for Mauritania connecting:

Sailors (sellers)
Clients (buyers)
Admin (intermediary)

The application manages listings. Communication and transactions happen externally via WhatsApp.

2. User roles
   Sailor
   Phone number OTP authentication
   Create announcements (title, description, price)
   View own announcements
   Mark announcements as sold/inactive
   Client
   Phone number OTP authentication
   Browse active announcements
   View announcement details
   Contact Admin via WhatsApp deep link
   Admin
   View all announcements
   Manage (activate/deactivate/mark as sold)
   Moderate listings
3. Authentication
   Supabase phone number OTP authentication
   Role-based access control (admin / sailor / client)
4. WhatsApp integration
   Use WhatsApp deep links (wa.me)
   Pre-filled message includes:
   announcement title
   announcement ID
   user interest text
5. Tech stack
   Mobile app
   React Native (Expo)
   TypeScript
   React Navigation
   Backend
   Supabase
   PostgreSQL
   Authentication
   Row Level Security (RLS)
   Database managed via Supabase CLI migrations (mandatory)
6. Database migration system (IMPORTANT)

The entire database must be managed using Supabase CLI migrations only.

Requirements:
No manual schema changes in dashboard
All schema changes must be done via SQL migration files
All migrations must be versioned and stored in Git
Workflow:
Initialize Supabase project with CLI
Use migration files for every schema change
Example structure:
supabase/
migrations/
0001_init_schema.sql
0002_add_roles.sql
0003_announcements.sql
0004_rls_policies.sql
seed.sql
config.toml
Migration rules:
Each schema change must create a new migration file
Migrations must be ordered and reversible when possible
Database must be reproducible from scratch using migrations only
Include seed data for testing (admin user, sample announcements)
Commands to assume:
supabase init
supabase migration new <name>
supabase db reset
supabase db push 7. Internationalization

Support 3 languages:

Arabic (primary, RTL required)
French
English

Requirements:

Use i18n system (e.g. i18next)
All UI strings must be externalized
No hardcoded text in UI
Proper RTL support for Arabic

Structure:

/locales/ar
/locales/fr
/locales/en 8. Database schema

Design Supabase schema:

users
id (uuid)
phone (string)
role (admin / sailor / client)
created_at
announcements
id (uuid)
title
description
price
status (active / sold)
created_by (user id)
created_at 9. Security (RLS)

Implement Supabase Row Level Security:

Sailors can only manage their own announcements
Clients can only read active announcements
Admin has full access
Only authenticated users can access data 10. UI screens
Phone OTP login screen
Language selection screen (first launch)
Role-based home screen
Announcement list screen
Announcement detail screen
Create announcement screen (sailor)
Admin dashboard screen 11. Architecture requirements
Clean and scalable folder structure
Separation of concerns:
UI components
services layer (API calls)
hooks (state logic)
navigation
localization
database access layer
MVP-first but production-ready structure 12. WhatsApp behavior

Contact button opens WhatsApp with:

Admin phone number
Pre-filled message including:
announcement title
announcement ID 13. Output format

Provide:

Project architecture (React Native Expo)
Supabase CLI setup instructions
Complete migration system (initial + RLS + schema)
Supabase SQL migrations (all files)
Authentication implementation (OTP login)
i18n setup (Arabic/French/English + RTL)
Core screens implementation
WhatsApp deep link utility
Step-by-step setup guide (dev to production)

Start with architecture and Supabase migration structure first.

---

14. Implementation clarifications (resolved decisions)

These resolve ambiguities in the spec above. See README.md for full rationale.

- Users table: use a `profiles` table whose `id` is a FK to Supabase `auth.users(id)`. Do not duplicate `auth.users`. Phone lives in `auth.users`; `profiles` holds role + display data.
- Role assignment: a DB trigger auto-creates a `profiles` row (default role `client`) on first sign-in. Users self-select `sailor`/`client` at onboarding. `admin` is assigned manually via SQL only and is never self-assignable.
- RLS role lookup: use `SECURITY DEFINER` helpers `current_user_role()` / `is_admin()` to avoid policy recursion on `profiles`.
- Status enum: `active` | `sold` | `inactive` (reconciles the "mark inactive" requirement). Clients see only `active`.
- Admin WhatsApp number: stored in an `app_settings(key,value)` table (readable by authenticated users, writable by admin), so it can change without an app release.
- Currency: MRU (Mauritanian Ouguiya); `price` is `numeric(12,2)`.
- Phone OTP: requires an SMS provider (Twilio/MessageBird) in Supabase Auth; default country code +222.
- Auth model: phone + password. OTP (SMS) is used ONLY for first-time registration confirmation and for password recovery ("forgot password"). Normal returning logins use the password — no OTP. (Local dev uses a test OTP number to avoid sending real SMS.)
- Images: out of scope for MVP; listings are text + price. Future enhancement via Supabase Storage.
