How to run it

1. Backend (already running ✅)
   The local Supabase stack is up. For reference, from the repo root:

supabase start # start the stack (Docker)
supabase db reset # re-apply migrations (already done)
supabase stop # stop it when finished
Studio (DB GUI): http://127.0.0.1:54323
API: http://127.0.0.1:54321 2. The app — run the Expo dev server (this is interactive, so run it yourself in a terminal):

cd app
npx expo start
Then choose a target:

i → iOS simulator (needs Xcode)
a → Android emulator (needs Android Studio)
w → web browser (quickest smoke test)
Expo Go app on your phone → scan the QR code
What you'll see
The themed Shell screen: "Teyvay / سوق موريتانيا" with three language chips (العربية / Français / English). Tapping switches language live; tapping العربية flips the layout to RTL.

Two gotchas
Physical phone: 127.0.0.1 points at the phone itself, not your Mac. Edit app/.env and set EXPO_PUBLIC_SUPABASE_URL=http://<your-Mac-LAN-IP>:54321 (e.g. 192.168.x.x), then restart expo start. Simulator/emulator/web don't need this.
Full RTL flip (Arabic): native layout direction only fully applies after an app reload. In dev, press r in the Expo terminal after switching to Arabic.
Want me to start the Expo dev server in the background here so you can open it (web), or are you good to run it yourself?
