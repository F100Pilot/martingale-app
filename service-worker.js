const CACHE_NAME = "martingale-cache-v1";
const OFFLINE_URL = "index.html";

const FILES_TO_CACHE = [
  "/martingale-app/",
  "/martingale-app/index.html",
  "/martingale-app/manifest.json",
  "/martingale-app/icons/icon-192.png",
  "/martingale-app/icons/icon-512.png"
];

// INSTALA
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ATIVA
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH — NETWORK FIRST (HTML) + CACHE FALLBACK
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // ⚠️ NÃO cachear chamadas à API do Worker/D1
  if (url.includes("martingale-db") || url.includes("martingale-api")) {
    return;
  }

  // HTML → Network first
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // Outros → Cache first
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).then((resp) => {
          return resp;
        })
      );
    })
  );
});
