# Teyvay — Run & Test Guide

## 1. Backend (local Supabase)

From the repo root:

```bash
supabase start      # start the stack (Docker)
supabase db reset   # re-apply migrations + wipe data (clean slate)
supabase stop       # stop it when finished
```

- Studio (DB GUI): http://127.0.0.1:54323
- API: http://127.0.0.1:54321

## 2. The app (Expo dev server)

```bash
cd app
npx expo start        # add -c to clear the Metro cache after dependency/env changes
```

Then choose a target:

- `i` → iOS simulator (needs Xcode)
- `a` → Android emulator (needs Android Studio)
- `w` → web browser (quickest smoke test)
- Expo Go on your phone → scan the QR (or "Enter URL manually": `exp://<Mac-LAN-IP>:8081`)

## 3. Network setup (IMPORTANT for a physical phone)

On a real phone, `127.0.0.1` means the phone itself — not your Mac — so all
Supabase calls fail with an error. Point the app at your Mac's LAN IP:

1. Find your Mac IP: `ipconfig getifaddr en0` (e.g. `192.168.1.34`).
2. Edit [app/.env](app/.env):
   ```
   EXPO_PUBLIC_SUPABASE_URL=http://<Mac-LAN-IP>:54321
   ```
3. Restart `npx expo start -c`.

Phone and Mac must be on the **same Wi-Fi** (no "client isolation"/guest mode).
Simulator / emulator / web can use `127.0.0.1` and don't need this.

## 4. Testing authentication

Real SMS is not sent locally, so only ONE test number works, with a fixed code:

- Phone: `+22231234567`, `+22231234568`, or `+22231234569` (3 test accounts)
- OTP code: `123456` (same for all)
- Password: any value you choose (min 6 characters)

> Use two different numbers to test both sides: register one as **Merchant**
> (create a listing), another as **Client** (browse + Contact via WhatsApp).

Auth model: **password login by default**; OTP is used ONLY for first-time
registration and for password recovery.

### A — Register (first time, uses OTP)

1. Sign in screen → "Don't have an account? Create one"
2. Phone `+22231234567`, password (≥6), confirm → Continue
3. Enter OTP `123456` → Verify
4. Pick a role (Merchant / Client) → you reach the home shell showing your role

### B — Normal login (no OTP)

1. On the shell → Sign out
2. Sign in: phone `+22231234567` + your password → straight in, no OTP

### C — Forgot password (uses OTP)

1. Sign in screen → "Forgot password?"
2. Phone `+22231234567` → Send code → OTP `123456` → Verify
3. Set a new password → back in. The old password no longer works.

### Reset the test account

To re-test registration from scratch (wipes all users + data):

```bash
supabase db reset
```

### Make a user an admin (after they sign in once)

```sql
update public.profiles set role = 'admin' where phone = '22231234567';
```

(Run in Studio → SQL editor, or via psql. Note: stored without the leading `+`.)

## 5. Roles

- **Merchant** (تاجر / Commerçant) — seller. DB enum value: `merchant`.
- **Client** (زبون / Client) — buyer.
- **Admin** (مسؤول) — granted via SQL only, never self-assignable.

## 6. RTL (Arabic)

Switching to Arabic flips the layout to RTL, but native layout direction only
fully applies after an app reload. In dev: shake → Reload, or press `r` in the
Expo terminal.
