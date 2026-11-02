# CarbonLens Android App

This is the native mobile application workspace. The existing GitHub Pages website remains in the repository root and is not replaced.

## Stack

- React Native
- Expo SDK 57
- Expo Router
- TypeScript

SDK 57 is selected for the initial physical-device workflow with the compatible Expo Go release. The app can later be built as an installable Android APK/AAB using EAS Build.

## Run on an Android phone

1. Install Node.js LTS on your computer.
2. Install **Expo Go** on your Android phone.
3. Open a terminal in this `mobile` folder.
4. Run:

```powershell
npm install
npx expo start
```

5. Put your phone and computer on the same Wi-Fi network.
6. Scan the QR code shown in the terminal using Expo Go.

If the network blocks local discovery, run `npx expo start --tunnel`.

## Current implementation

- Native dashboard shell with honest empty states.
- Bottom navigation for Home, Calculator and Activity.
- Calculator tab temporarily opens the existing website calculator.
- Existing website calculation engine and tests remain untouched.

## Next development step

Port the existing calculation engine into a shared, UI-independent TypeScript module. Then the native calculator can calculate locally and feed real results into the dashboard without requiring an account or backend.

## Type checking

```powershell
npm run typecheck
```
