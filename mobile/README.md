# MTG Collection - Mobile App (Expo, iOS)

A minimal React Native (Expo) app: register, log in, and view the cards
in your inventory. Talks directly to your existing Express/MongoDB
backend (`/api/register`, `/api/login`, `/api/getinventory`).

## 1. Install dependencies

```bash
cd mtg-mobile
npm install
```

## 2. Point it at your backend

Open `src/config.js` and set `API_BASE_URL` to wherever your Express
server (the one that has `api.js` mounted on it) actually runs.

This is **not necessarily the same as your website's URL** - it depends
on how you deployed things:

- Same server serves both the site and `/api/*` routes → use the
  website URL.
- Website and API are hosted separately (e.g. site on Vercel/Netlify,
  API on Render/Railway/Heroku/your own server) → use the API server's
  own URL.
- Testing locally on your computer while running the app on your
  iPhone via Expo Go → use your computer's **LAN IP**, not `localhost`
  (the phone can't resolve that), e.g. `http://192.168.1.50:5000`.
  Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to find your LAN
  IP, and make sure your iPhone is on the same Wi-Fi network as your
  computer.

## 3. Run it on your iPhone

```bash
npx expo start
```

A QR code will show up in the terminal / browser tab. Open your
iPhone's **Camera app** (not Expo Go itself) and point it at the QR
code - it'll show a banner to open it in Expo Go. (Install Expo Go
from the App Store first if you haven't.)

If your Wi-Fi network has client isolation (common on corporate/school
networks, where your phone can't see your PC), use:

```bash
npx expo start --tunnel
```

If npm warns about version mismatches after install, run:

```bash
npx expo install --fix
```

## Troubleshooting: "Project is incompatible with this version of Expo Go"

Expo Go (the app on the App Store/Play Store) only ever supports **one**
specific Expo SDK version at a time - whatever the current one is.
If this project was built against an older SDK than what Expo Go
currently supports, you'll see this error, and there's no way to fix
it from your phone (the App Store won't offer a "downgrade").

The fix is to bump the project's SDK version to match. From the
`mtg-mobile` folder:

```bash
rm -rf node_modules package-lock.json
npm install
npx expo install --fix
```

`expo install --fix` reads the `expo` version in `package.json` and
automatically rewrites every other Expo-managed dependency (React,
React Native, navigation libraries, async-storage, etc.) to the exact
versions that are compatible with that SDK - much more reliable than
guessing version numbers by hand. Then run `npx expo start` again.

If this happens again in the future (Expo ships a new SDK every few
months and Expo Go always moves to the latest one), the fix is the
same: bump `"expo"` in `package.json` to the new major version and
re-run the two commands above.

## 4. Building a real installable app (optional, later)

When you're ready to install this on a device without Expo Go, or
submit to the App Store, you'll need an [Apple Developer Program](https://developer.apple.com/programs/)
membership ($99/year) - Apple requires this even for installing on
your own iPhone outside of Expo Go/TestFlight. You do **not** need a
Mac; EAS builds iOS apps on Expo's cloud servers.

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p ios --profile preview
```

This produces a downloadable, installable build. From there, `eas
submit -p ios` uploads it to TestFlight/the App Store when you're
ready to share it more broadly.

(If you also want an Android build later, swap `-p ios` for
`-p android` above - no Apple account needed for that path, and no
Android Studio/SDK needed either since EAS builds it in the cloud too.)

## What's implemented

- **Auth**: register / login, session persisted via `AsyncStorage`
- **Inventory tab**: your cards, server-side search (`/api/searchinventory`), inline +/- quantity controls (`/api/addinventory` / `/api/removeinventory`)
- **Decks tab**: list your decks, create new ones, open a deck to see/add/remove its cards (cards are added from your inventory), delete a deck
- **Browse tab**: search the full card catalog (`/api/searchcards`) and add any card straight to your inventory
- **Account tab**: shows your username, log out (with confirmation)
- **Card detail screen**: full card info, color-coded rarity, mana cost shown as colored pips

### One-time setup after pulling this update

This update added a new dependency (`@react-navigation/bottom-tabs`, needed for the Inventory/Decks/Browse/Account tab bar). Run this once:

```bash
npx expo install --fix
```

If you get any "cannot find module '@react-navigation/bottom-tabs'" type error, do a full clean install instead:

```bash
rm -rf node_modules package-lock.json
npm install
npx expo install --fix
```



## Project structure

```
mtg-mobile/
  App.js                        entry point, wraps navigation in AuthProvider
  src/
    config.js                   <-- EDIT: your API base URL
    api.js                      fetch wrappers for register/login/getinventory
    context/AuthContext.js      session state + AsyncStorage persistence
    navigation/RootNavigator.js switches Login/Register vs Inventory screen
    screens/
      LoginScreen.js
      RegisterScreen.js
      InventoryScreen.js
    utils/jwt.js                decodes the JWT payload (no server call needed)
```

## Extending later

Adding search, decks, or add/remove-from-inventory is straightforward
from here - the same `post()` helper in `src/api.js` works for any of
the other endpoints in your Swagger doc (`/api/searchinventory`,
`/api/getdecks`, `/api/addinventory`, etc.); just add a function and a
screen the same way `getInventory` + `InventoryScreen` are built.
