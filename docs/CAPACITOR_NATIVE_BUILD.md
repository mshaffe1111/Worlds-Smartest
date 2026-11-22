# World's Smartest — Native iOS & Android Packaging Guide (Capacitor)

This project ships with a production-ready [`capacitor.config.json`](../capacitor.config.json), a full Airplane-Mode Service Worker ([`public/sw.js`](../public/sw.js)), and a zero-hard-dependency native Core Haptics / Android Haptics bridge in [`src/audio/HapticsEngine.ts`](../src/audio/HapticsEngine.ts).

| Property | Value |
| :--- | :--- |
| **App ID / Bundle ID** | `com.meridian.worldssmartest` |
| **App Name** | `World's Smartest` |
| **Web Asset Directory** | `dist` (`vite build`, `base: "./"`) |
| **Native Surface / Status Bar** | `#050811` (Sovereign Obsidian, dark status bar with light icons) |

---

## 1. Prerequisites

- **Shared:** Node.js `>= 20`, npm `>= 10`.
- **iOS (macOS only):** Xcode `15+`, Xcode Command Line Tools (`xcode-select --install`), CocoaPods (`brew install cocoapods`), and an Apple Developer Program account for TestFlight / App Store distribution.
- **Android (Windows / macOS / Linux):** Android Studio (Iguana or newer), JDK `17`, Android SDK Platform `34+`, and Google Play Console developer access.

---

## 2. Install Capacitor Packages & Native Plugins

The web build has **zero compile-time hard dependencies** on Capacitor (haptics are typed via an ambient `Window.Capacitor` bridge). Install Capacitor packages only when preparing native builds:

```bash
npm install @capacitor/core @capacitor/haptics @capacitor/status-bar @capacitor/splash-screen
npm install -D @capacitor/cli @capacitor/ios @capacitor/android
```

---

## 3. Build Web Bundle & Initialize Native Platforms

Build the Vite production bundle (`dist/`) and generate the native `ios/` and `android/` projects once:

```bash
npm run build
npx cap add ios
npx cap add android
```

After any subsequent web code or asset change, rebuild and sync both platforms with one command:

```bash
npm run cap:sync
```

---

## 4. iOS Packaging (Xcode → TestFlight / App Store)

1. Build, sync, and launch Xcode:
   ```bash
   npm run cap:ios
   ```
2. **Signing & Capabilities (`App` target):**
   - Verify **Bundle Identifier** is `com.meridian.worldssmartest`.
   - Select your Apple **Team** and enable **Automatically manage signing**.
   - Set **Minimum Deployments** to `iOS 15.0+` (for full WebGL2 + Core Haptics support).
3. **Full-Bleed Safe Areas & Status Bar:**
   - `capacitor.config.json` sets `ios.contentInset: "never"`, `scrollEnabled: false`, and `backgroundColor: "#050811"`.
   - `index.html` already includes `viewport-fit=cover`, and `src/styles/sovereign.css` respects `env(safe-area-inset-*)` so the 3D WebGL2 Prism stage runs edge-to-edge without notch clipping.
   - In `Info.plist`, set `UIViewControllerBasedStatusBarAppearance` = `YES` and `UIStatusBarStyle` = `UIStatusBarStyleLightContent`.
4. **App Icon & Launch Screen:**
   - Generate the `1024x1024` opaque App Store icon from `public/icon-512.png` / `public/icon.svg` on `#050811` background and place it in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`.
5. **Core Haptics Verification:**
   - With `@capacitor/haptics` installed, `HapticsEngine` automatically detects `window.Capacitor.isNativePlatform()` and routes:
     - `spinTick()` → `Haptics.selectionChanged()`
     - `tap()` / `uiTap()` / `peelSnap()` / `lockThunk()` → `Haptics.impact({ style: 'LIGHT' | 'MEDIUM' | 'HEAVY' })`
     - `goldResonance()` / `correctBloom()` → `Haptics.notification({ type: 'SUCCESS' })`
     - `backfireFracture()` / `wrongThud(true)` → `Haptics.notification({ type: 'ERROR' })`
6. **Archive & Upload:**
   - Select **Any iOS Device (arm64)** → **Product → Archive** → **Distribute App → App Store Connect**.

---

## 5. Android Packaging (Android Studio → Google Play)

1. Build, sync, and launch Android Studio:
   ```bash
   npm run cap:android
   ```
2. **Application ID & SDK Levels (`android/app/build.gradle`):**
   - Verify `applicationId "com.meridian.worldssmartest"`, `minSdkVersion >= 24`, and `targetSdkVersion >= 34`.
   - `@capacitor/haptics` automatically merges `<uses-permission android:name="android.permission.VIBRATE" />` into the manifest.
3. **Adaptive Icon & Obsidian Splash:**
   - Open **File → New → Image Asset** in Android Studio and import `public/icon-maskable-512.png` with background color `#050811`.
   - Confirm `android/app/src/main/res/values/styles.xml` uses dark `#050811` window/status bar colors to eliminate any cold-start white flash.
4. **HTTPS Local WebView Scheme:**
   - `capacitor.config.json` configures `server.androidScheme: "https"` so Cache Storage, WebGL2, ES modules, and `localStorage` persistence work cleanly inside Android System WebView.
5. **Build Signed Play Store Bundle (`.aab`):**
   - Choose **Build → Generate Signed Bundle / APK → Android App Bundle (`.aab`)**.
   - Sign with your release keystore and upload the generated `.aab` to Google Play Console.

---

## 6. Offline-First & QA Notes

- **Bundled Native Assets:** Because Capacitor copies the entire `dist/` directory (including `assets/aaa_models/*.glb`, `assets/audio/*.mp3`, and `data/*`) inside the `.ipa` / `.aab`, native builds boot and play 100% offline out of the box with zero network dependency.
- **PWA / Web Airplane Mode:** On web deployments (`http://localhost:8088/` and `https://mshaffe1111.github.io/Worlds-Smartest/`), `public/sw.js` and `src/pwa/OfflineServiceWorkerClient.ts` provide subpath-safe precaching plus on-demand Offline Vault packs (`ESSENTIAL`, `BASEBALL_PRO`, `FULL_WORLD_CIRCUIT`).
- **QA Bypass:** Append `?nosw=1` to any URL to bypass Service Worker registration and fetch interception during isolated regression runs.
