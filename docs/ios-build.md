# Build & install on a physical iPhone with Xcode

This is an Expo (SDK 54 / React Native 0.81) app with **no committed `ios/`
folder** — the native project is generated on demand with `expo prebuild`. This
guide is intentionally detailed: it takes you from a clean checkout all the way
to the app running on your own iPhone, and then to a signed release build you
can share.

> Per `app/AGENTS.md`, cross-check any command against the exact SDK 54 docs:
> https://docs.expo.dev/ — everything below targets Expo SDK 54 / RN 0.81.

All terminal commands assume you are **inside the `app/` directory** unless
stated otherwise:

```bash
cd /Users/ahmedgreigra/projects/teyvay/app
```

---

## 1. Prerequisites

You can only build for iOS on **macOS**. Work through each item and run the
verification command — don't move on until it succeeds.

### 1.1 Xcode

1. Install **Xcode** from the Mac App Store (large download, ~7–15 GB).
2. Launch it once and accept the license + let it "Install additional
   components" when prompted.
3. Point the command-line tools at this Xcode and accept the license in a
   terminal:
   ```bash
   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
   sudo xcodebuild -license accept
   ```
4. Verify:
   ```bash
   xcodebuild -version        # e.g. Xcode 16.x
   xcode-select -p            # → /Applications/Xcode.app/Contents/Developer
   ```

### 1.2 Command Line Tools

```bash
xcode-select --install       # skips if already installed
```

### 1.3 CocoaPods (native dependency manager)

```bash
brew install cocoapods       # or: sudo gem install cocoapods
pod --version                # verify (e.g. 1.15.x)
```

### 1.4 Node & project dependencies

```bash
node -v                      # should be v22.x
npm install                  # installs app/ dependencies
```

### 1.5 Apple account & device

- An **Apple ID**. A *free* Apple ID can sign and install on your own device
  (with a 7-day limit, see §5). A paid **Apple Developer Program** membership
  ($99/yr) is required for TestFlight / App Store and removes the 7-day limit.
- Your **iPhone** + a USB-to-Lightning/USB-C cable.
- Unlock the iPhone, plug it in, and tap **Trust** on the "Trust This Computer?"
  prompt (enter your passcode).

> **Where does the Apple ID go?** Nowhere in this repo — not in `app.json`,
> `.env`, or any code. You sign it into **Xcode** once, and Xcode uses it to
> sign the app:
>
> 1. Xcode → **Settings…** (⌘,) → **Accounts** tab.
> 2. Click **＋** (bottom-left) → **Apple ID** → sign in (email, password, 2FA).
> 3. It appears in the list with a **Personal Team** (free) or your paid team.
>
> Later, during signing (§5.2), you select this account in the **Team**
> dropdown. That's the only place the Apple ID is referenced.

---

## 2. One-time project configuration

### 2.1 Set a bundle identifier

Every iOS app needs a globally-unique **bundle identifier** in reverse-domain
form. `app.json` doesn't define one yet, so add it under `expo.ios`. Pick your
own value — if you don't own a domain, any unique string works for personal
installs (append your initials to avoid collisions):

```jsonc
// app/app.json  →  inside "expo"
"ios": {
  "supportsTablet": true,
  "bundleIdentifier": "com.teyvay.app"
}
```

> The identifier is permanent for a given app on the App Store, so choose
> deliberately if you plan to publish. For local testing you can change it
> freely.

### 2.2 Update the app name and slug

These live in `app/app.json` under `expo` and both default to `"app"`:

```jsonc
// app/app.json
{
  "expo": {
    "name": "Teyvay",        // ← home-screen label + Xcode display name
    "slug": "teyvay",        // ← Expo project identifier (URL-safe)
    ...
  }
}
```

What each one controls:

- **`name`** — the human-facing app title. It's what shows **under the icon on
  the iPhone home screen** and as the product/display name in Xcode. Can contain
  spaces and capitals (e.g. `"Teyvay"`). Keep it short — iOS truncates long
  home-screen labels.
- **`slug`** — a URL-safe identifier for the Expo project (lowercase, hyphens,
  no spaces, e.g. `"teyvay"`). It's used by Expo's services and over-the-air
  updates, **not** shown to users. It should be stable once set.

> `name`/`slug` are **not** the same as the iOS **bundle identifier** (§2.1).
> The bundle ID (`com.teyvay.app`) is what Apple uses to uniquely identify the
> app for signing and the App Store; `name`/`slug` are Expo-level labels.

After editing, regenerate the native project so the change is picked up:

```bash
npx expo prebuild -p ios --clean
```

(If you only change `name`, the next normal `npx expo prebuild -p ios` is
enough; `--clean` guarantees a fresh project when in doubt.)

### 2.3 Provide the Supabase env vars

The JS bundle reads the public Supabase vars **at build time**. Ensure
`app/.env` exists (copy the example) and is filled in:

```bash
cp .env.example .env          # if you don't have .env yet
```

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

#### Where to find these two values

1. Sign in at **https://supabase.com/dashboard** and open **your project**
   (the Development or Production project you want this build to talk to).
2. In the left sidebar click the **gear / Project Settings**.
3. Open the **API** section (Project Settings → **API**). You'll see:
   - **Project URL** → copy into `EXPO_PUBLIC_SUPABASE_URL`
     (looks like `https://abcdwxyz.supabase.co`).
   - **Project API keys → `anon` `public`** → copy into
     `EXPO_PUBLIC_SUPABASE_ANON_KEY` (a long JWT starting with `eyJ...`).

> Use the **`anon` public** key only — it's safe to ship in a client app and is
> governed by your Row-Level Security policies. **Never** put the `service_role`
> key in the app; it bypasses RLS. (The `service_role`/DB password belong in CI
> secrets — see `docs/ci-cd.md` §4.)

#### Local Supabase vs hosted

The committed `.env.example` points at **local** Supabase
(`http://127.0.0.1:54321`). Two cases for a device build:

- **Pointing at a hosted project (recommended for device installs):** use the
  dashboard **Project URL** + **anon key** as above. This just works on the
  phone over the internet.
- **Pointing at your local `supabase start` stack:** `127.0.0.1` refers to the
  *iPhone itself*, not your Mac — so it won't connect. Replace it with your
  Mac's **LAN IP** and keep the port, e.g.
  `EXPO_PUBLIC_SUPABASE_URL=http://192.168.1.23:54321`, with the phone on the
  same Wi-Fi. Find the IP with `ipconfig getifaddr en0`.

If these are missing the app throws on launch (see `src/core/supabase/env.ts`).
Changing `.env` requires a rebuild to take effect.

---

## 3. Generate the native iOS project (prebuild)

`ios/` is a build artifact (gitignored), so generate it:

```bash
npx expo prebuild -p ios
```

What this does:

- Creates the `ios/` directory containing the Xcode project + **workspace**.
- Applies your `app.json` config (name, bundle ID, icons, plugins like
  `expo-localization` and `@react-native-community/datetimepicker`).
- Runs `pod install` to fetch native dependencies.

Verify it worked:

```bash
ls ios/*.xcworkspace          # → ios/app.xcworkspace
```

Re-run `npx expo prebuild -p ios` whenever you change `app.json`, native
config, or add a library with native code. If a build gets into a weird state,
regenerate from clean:

```bash
npx expo prebuild -p ios --clean
```

---

## 4. Build & install — two routes

You have two ways to get the app onto the phone. **Route A** is fastest for
everyday testing; **Route B** gives you full control and is where you fix
signing.

### Route A — let Expo build & install (recommended for iteration)

1. Plug in and unlock the iPhone.
2. Run:
   ```bash
   npx expo run:ios --device
   ```
3. If more than one device/simulator is connected, pick your **iPhone** from the
   list.
4. Expo compiles via the Xcode toolchain, installs, and launches the app on the
   device. The **first build takes several minutes**; subsequent builds are
   incremental and much faster.

If this fails with a **signing** error, do the one-time Xcode signing setup in
Route B (§5.2) once, then re-run the command above.

### Route B — build & install from Xcode (full control)

#### 5.1 Open the workspace

Always open the **`.xcworkspace`**, never the `.xcodeproj` (the workspace
includes the CocoaPods):

```bash
open ios/app.xcworkspace
```

#### 5.2 Configure signing (one-time)

1. In the left **Project navigator**, click the top **app** project icon.
2. In the editor, select the **app** *target*, then the **Signing &
   Capabilities** tab.
3. Check **Automatically manage signing**.
4. **Team** dropdown → choose your Apple ID team. If it's empty:
   - Xcode menu → **Settings…** (⌘,) → **Accounts** tab → **+** → **Apple ID** →
     sign in. Close Settings and re-open the Team dropdown.
5. If you see a red error like *"Failed to register bundle identifier"* or
   *"... is not available"*, change **Bundle Identifier** here to something
   unique (e.g. `com.teyvay.app.yourinitials`). Keep it in sync with `app.json`
   if you'll prebuild again.
6. Wait until the status shows a valid **Provisioning Profile** (no red text).

#### 5.3 Select the device and run

1. Connect the iPhone. In the toolbar at the top, click the **destination**
   selector (next to the scheme name) and choose your iPhone under
   **iOS Device**. The toolbar should read **app › <Your iPhone>**.
2. Press **▶ Run** (**⌘R**). Xcode builds, installs, and launches on the device.
3. Watch the progress in the toolbar status area; build logs are in the
   **Report navigator** (⌘9) if anything fails.

#### 5.4 First launch on the device (trust)

iOS blocks apps signed by an untrusted developer. The first time:

1. On the iPhone: **Settings → General → VPN & Device Management** (older iOS:
   *Profiles & Device Management*).
2. Under **Developer App**, tap your Apple ID / developer profile → **Trust** →
   confirm.
3. If iOS asks for **Developer Mode**: **Settings → Privacy & Security →
   Developer Mode → On**, then **restart the iPhone** and confirm after reboot.
4. Re-open the app from the home screen.

> **7-day limit (free Apple ID):** the signing certificate expires after a week,
> after which the app won't launch until you rebuild from Xcode (⌘R) or re-run
> `npx expo run:ios --device`. A paid membership extends this to a year.

---

## 6. Generate a signed release build / installable bundle (Archive)

Use this when you want an optimized, signed build (the `.ipa` "bundle") to share
or submit — not for everyday debugging.

1. **Set the destination to a generic device.** In the toolbar destination
   selector choose **Any iOS Device (arm64)**. You cannot Archive while a
   simulator is selected.
2. **Use the Release configuration.** Menu → **Product → Scheme → Edit Scheme…**
   → select **Run** (or **Archive**) in the sidebar → **Build Configuration →
   Release**. Release minifies the JS bundle and disables `__DEV__`.
3. **Archive.** Menu → **Product → Archive**. When it finishes, the **Organizer**
   window opens showing the new archive.
4. **Distribute App** (button on the right of the Organizer). Pick a method:
   - **Development** or **Ad Hoc** → exports a `.ipa` for devices registered to
     your account/profile.
   - **App Store Connect** → uploads to TestFlight / App Store (paid membership
     required).
   Follow the prompts (signing → export) and choose an export folder.
5. **Install the exported `.ipa` on a connected iPhone:**
   ```bash
   xcrun devicectl list devices                                   # find the device id
   xcrun devicectl device install app --device <DEVICE_ID> path/to/app.ipa
   ```
   Alternatives: drag the `.ipa` onto the device in **Apple Configurator**, or
   use **Finder → [device] → Files**.

---

## 7. Troubleshooting

| Symptom | Cause / Fix |
| --- | --- |
| `No profiles for 'com.teyvay.app' were found` | No Team selected or bundle ID taken. Set a Team and a unique bundle ID in Signing & Capabilities (§5.2). |
| `Failed to register bundle identifier` | The ID is already used by another Apple account. Change it to something unique. |
| `Untrusted Developer` when launching | Trust the profile: Settings → VPN & Device Management (§5.4). |
| `Could not launch … Developer Mode disabled` | Enable Developer Mode (§5.4) and reboot. |
| `Command PhaseScriptExecution failed` / Pods errors after a dependency change | Regenerate native project: `npx expo prebuild -p ios --clean`, then rebuild. |
| App quits on launch with a Supabase env error | `app/.env` missing/incomplete — set the `EXPO_PUBLIC_*` vars **before** building, then rebuild. |
| App stops opening after ~a week | Free-account 7-day cert limit — rebuild (⌘R) or use a paid account. |
| `pod install` fails / out of date | `sudo gem install cocoapods` (or `brew upgrade cocoapods`), then prebuild again. |
| Device not listed in Xcode | Unlock the phone, re-plug the cable, tap **Trust**, and wait for Xcode to "Preparing device for development". |
| Metro/JS errors only in `run:ios` debug builds | That's the dev server bundling JS; for a standalone build use the Release Archive (§6). |
| Keychain ("trousseau") password prompt rejects your password while signing | The login keychain is out of sync with your Mac password — see §7.1. It wants your **Mac login** password, never an Apple ID. |
| `Could not connect to the server` / `No script URL provided` on launch | Debug build can't reach the Metro dev server — see §7.2. Start Metro or build Release. |
| `npx expo run:ios --device` boots a wrong/phantom simulator (`Unexpected devicectl JSON version output`) | The bundled `@expo/cli` is older than your Xcode's `devicectl`. Build from Xcode (§5), or target by UDID, or `npm install expo@latest && npx expo install --fix`. |

---

### 7.1 Keychain ("trousseau") password keeps failing during signing

When Xcode/`codesign` signs the app, macOS asks to unlock your **login
keychain**. Two things trip people up:

- It is **not** asking for an **Apple ID** password (personal or otherwise). It
  wants your **macOS login password** — the one you type to log into the Mac.
- If even your correct Mac login password is rejected (you can still log into
  the Mac with it, but the keychain refuses it), the **login keychain password
  drifted out of sync** with your account password — usually after a past
  password reset. The keychain still expects the *old* password.

**Fix — reset the login keychain** (safe here: with automatic signing Xcode just
regenerates the dev certificate; you may need to re-enter some saved Wi-Fi /
website passwords):

1. Open **Keychain Access** → menu **Keychain Access → Settings…** →
   **Reset Default Keychains** → enter your **current Mac login password**.
2. Quit Keychain Access, reopen Xcode.
3. Target **app → Signing & Capabilities** → toggle **Automatically manage
   signing** off/on so the cert is re-created in the fresh keychain.
4. Rebuild (**⌘R**); at the codesign prompt enter your **Mac login password** and
   click **Always Allow** (not just "Allow", or it re-prompts every build).

If you *do* remember the old keychain password, you can instead keep your saved
items: Keychain Access → select **login** → **Edit → Change Password for Keychain
"login"** (old password → new = current Mac password).

### 7.2 `Could not connect to the server` / `No script URL provided`

A **debug** build loads its JavaScript from the **Metro** dev server on your Mac
(e.g. `http://192.168.1.34:8081`). This error (often with `Code=-1004` /
`_kCFStreamErrorCodeKey=61`, i.e. connection refused) means the app can't reach
Metro. Signing/install already succeeded — only the JS fetch failed.

**Option A — start Metro (tethered dev loop):**

```bash
cd app
npx expo start
```

Leave it running, keep the iPhone on the **same Wi-Fi** as the Mac, then
relaunch the app (or shake the device → **Reload**). If it still can't connect,
allow `node` through **System Settings → Network → Firewall** (port 8081).

**Option B — embed the bundle (run untethered, no Metro):** build the **Release**
configuration so the JS is baked into the app — Xcode → **Product → Scheme →
Edit Scheme → Run → Build Configuration → Release**, then **⌘R**. See §6.

---

## 8. Quick reference (TL;DR)

```bash
cd app

# one-time
#  - add expo.ios.bundleIdentifier to app.json
#  - cp .env.example .env  &&  fill in EXPO_PUBLIC_SUPABASE_*
npm install

# generate native project
npx expo prebuild -p ios

# everyday: build + install on a plugged-in iPhone
npx expo run:ios --device

# OR open in Xcode for signing / archiving
open ios/app.xcworkspace
#  Signing & Capabilities → Team + Automatically manage signing
#  destination = your iPhone → ⌘R
#  release bundle: destination = Any iOS Device → Product ▸ Archive ▸ Distribute
```

**Bottom line:** use `npx expo run:ios --device` for day-to-day device testing;
use the Xcode **Archive → Distribute** flow only when you need a signed,
shareable `.ipa`.
