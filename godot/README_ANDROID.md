# World's Smartest — Godot 4.7.2 Android Play Store Guide

1. **Open Project:** Launch **Godot 4.7.2** and import `godot/project.godot` (portrait 9:16 mobile viewport, Vulkan Mobile renderer, shared Blender `.glb` assets, portraits, venues, and `data/questions.json`).
2. **Install Export Templates:** In Godot click **Editor -> Manage Export Templates -> Download and Install** for `4.7.2.stable`, and set your Android SDK + JDK 17 paths under **Editor -> Editor Settings -> Export -> Android**.
3. **Configure Signing Keystore:** Generate a release keystore (`keytool -genkey -v -keystore meridian.jks -alias meridian -keyalg RSA -keysize 2048 -validity 10000`) and assign it in **Project -> Export -> Android Play Store (AAB) -> Keystore**.
4. **Export Play Store Bundle (`.aab`) or Sideload `.apk`:** Select **`Android Play Store (AAB)`** (`com.worldssmartest.meridian`, ARM64-v8a + ARMv7, Portrait locked) or **`Android Direct Sideload (APK)`** and click **Export Project**.
5. **Headless CLI Export:** Run `godot --headless --path godot --export-release "Android Play Store (AAB)" ../builds/android/worlds_smartest_meridian.aab` (or `"Web HTML5"` for browser deployment).
