

## Fix: Mobile Updates Not Appearing on Phone

### Root Cause
The app uses a PWA service worker with `registerType: "autoUpdate"` and aggressive caching (`globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"]`). When you visit on your phone, the service worker serves the **old cached version** of the JavaScript/CSS files, so none of the recent code changes are visible.

### Fix 1: Force Service Worker to Skip Waiting and Reload

**File: `src/main.tsx`**
- Register the PWA with `onNeedRefresh` callback that auto-reloads when a new version is detected
- Import `registerSW` from `virtual:pwa-register` and call `registerSW({ immediate: true })` so the new service worker activates immediately instead of waiting for the next visit

### Fix 2: Add `skipWaiting: true` to Workbox Config

**File: `vite.config.ts`**
- Add `skipWaiting: true` and `clientsClaim: true` to the `workbox` config so the new service worker takes over immediately without waiting for all tabs to close

### Fix 3: Mobile Header Polish

**File: `src/components/Header.tsx`**
- Hide the subtitle on mobile (`hidden sm:block`) to save vertical space
- Reduce header title size on mobile to `text-xl`
- Reduce padding on mobile (`py-2 sm:py-4`)

### What the user should do after deployment
- On the phone: close all tabs of the app, then reopen it (or clear the browser/PWA cache manually once)
- After this fix ships, future updates will auto-apply without manual cache clearing

### Technical Details

Files to modify:
1. `vite.config.ts` -- add `skipWaiting: true`, `clientsClaim: true` to workbox
2. `src/main.tsx` -- add explicit SW registration with immediate reload
3. `src/components/Header.tsx` -- compact mobile header

