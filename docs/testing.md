# Testing plan — Expo app unit tests

**Stack:** Expo SDK 54, React Native 0.81, React 19, TypeScript. No test runner
exists yet. The code is cleanly layered (pure utils → services → hooks →
components), so we roll out tests in tiers: the highest-ROI tests (pure
functions) need zero mocking, and we add infrastructure only as we climb.

## Tooling

| Concern               | Choice                                                                 |
| --------------------- | ---------------------------------------------------------------------- |
| Runner / preset       | `jest-expo` (official Expo preset, version-matched to SDK 54)          |
| Component / hook tests| `@testing-library/react-native` v13+ (bundles jest-native matchers)    |
| Types                 | `@types/jest`                                                          |
| Transform             | Babel (via `jest-expo`) — no `ts-jest` needed                          |

> Per `app/AGENTS.md`, confirm the exact `jest-expo` version against the SDK 54
> docs (https://docs.expo.dev/versions/v56.0.0/) before installing.

Dev deps to add: `jest`, `jest-expo`, `@testing-library/react-native`,
`@types/jest`. Scripts: `"test": "jest"`, `"test:watch": "jest --watch"`.

## Gotchas specific to this codebase

1. **`src/core/supabase/env.ts` throws at import time** when
   `EXPO_PUBLIC_SUPABASE_*` are unset. Any test that transitively imports the
   Supabase client crashes. → Set dummy env vars in a Jest setup file *and* mock
   the client module in service tests.
2. **Supabase client is a chainable builder** (`.from().select().eq().order()`).
   Service tests need a small chainable mock, not real network calls.
3. **Native/Expo modules** (`expo-localization`, `@react-native-async-storage`,
   `react-native-url-polyfill`) need mocks. async-storage ships an official
   `jest/async-storage-mock`; the others get manual mocks in setup.
4. **i18n** — components call `useTranslation()`; mock `react-i18next` to return
   keys verbatim so assertions are stable.

## Phased rollout (by ROI)

### Phase 0 — Infrastructure (~½ day)
Install deps; add `jest.config.js` (`preset: 'jest-expo'`, `setupFilesAfterEnv`),
`jest.setup.ts` (dummy env vars + global mocks), and a `__mocks__/` dir. Land one
trivial passing test to prove the harness, then add CI: a new `app-test.yml`
workflow that runs `jest` on PRs touching `app/**`.

### Phase 1 — Pure functions (highest value, no mocking)
- **`src/core/utils/date.ts`** — `toISODate` (the UTC off-by-one is the point),
  `parseISODate` (valid / empty / garbage), `ageFromBirthdate` (birthday-today
  and not-yet-this-year boundaries).
- **`src/core/utils/format.ts`** — `formatAmount` (grouping, non-finite → 0),
  `formatPrice`, `refCode` (short ids, non-alphanumeric stripping).
- **`src/modules/auth/utils.ts`** — `isValidPhone`, `isValidEmail`,
  `normalizePhone`, `maxBirthdate` (MIN_AGE = 18 boundary).
- **`src/modules/announcements/utils.ts`** — `localizedTitle` /
  `localizedDescription` fallback chains (en→fr→ar; empty string treated as null).
- **`src/core/utils/whatsapp.ts`** — `buildWhatsappUrl` (strips `+`/spaces,
  encodes message).

### Phase 2 — i18n key parity (cheap, high signal)
Data-driven test asserting `en.json` / `fr.json` / `ar.json` have identical key
sets — for both `core/i18n/locales` and each module's `locales/`. Catches missing
translations before they ship.

### Phase 3 — Services (mocked Supabase)
Build one reusable chainable Supabase mock, then test each service's two paths —
success returns mapped data, and `error` is thrown:
`announcements.service`, `auth.service`, `profile.service`, `admin.service`,
`settings.service`. Assert correct table/columns/filters and error propagation.

### Phase 4 — Hooks (RNTL `renderHook` + mocked services)
- `useAnnouncements` — scope routing (`mine` without `userId` → `[]`),
  error → `error: true`, loading lifecycle.
- `useAuth`, `useProfiles`.

### Phase 5 — Component smoke tests (optional, lower ROI)
Render + interaction for shared components (`Button`, `Field`, `PhoneField`,
`AnnouncementCard`). Defer unless UI regressions become painful.

## Conventions

- Co-locate tests as `*.test.ts(x)` next to source.
- Coverage gate: start at **0 enforced**; ramp to ~70% on `utils/` and
  `services/` after Phase 3. Do not gate on UI coverage.
- **Don't test:** generated `core/types/database.ts`, thin `index.ts` barrels, or
  full screens (cover their logic via hooks/services instead).

## Bottom line

Phases 0–2 deliver most of the value for roughly one day of work. Phases 3–4 add
confidence around the data layer. Phase 5 is opt-in.
