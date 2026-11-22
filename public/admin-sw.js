// Green Steel Studio — Scoped Admin Pass-Through Service Worker
// Enables PWA installation on mobile/desktop without caching dynamic Server Action payloads or stale catalog data.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Pass-through: satisfies Chrome PWA install criteria with zero stale data retention.
});

