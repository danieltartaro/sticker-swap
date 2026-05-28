// Detects whether the app is currently running as an installed standalone PWA
// (vs. inside a regular browser tab). Two surfaces to check:
//
//   1. `window.matchMedia('(display-mode: standalone)')` — the modern, spec'd
//      check. Works on Android Chrome's installed PWA and on iOS Safari's
//      home-screen install (iOS 16.4+).
//   2. `(window.navigator as { standalone?: boolean }).standalone` — Apple's
//      iOS-specific Safari API. Older iOS versions (and some edge cases) only
//      expose this one.
//
// Either being true means we're standalone. Both being false means we're in a
// regular tab and the "Save to home screen" affordance should be shown.

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const mqStandalone =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone =
    (window.navigator as { standalone?: boolean }).standalone === true;
  return mqStandalone || iosStandalone;
}
