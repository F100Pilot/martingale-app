const CACHE_NAME = "martingale-cache-v1";

const FILES_TO_CACHE = [
  "/martingale-app/",
  "/martingale-app/index.html",
  "/martingale-app/manifest.json"
];

// Instalação e cache inicial
self.addEventListener("install", evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Estratégia: NETWORK FIRST para API, CACHE FIRST para HTML
self.addEventListener("fetch", evt => {
  const url = evt.request.url;

  // Workers nunca em cache
  if (url.includes("martingale-db") || url.includes("martingale-api")) {
    return; 
  }

  // HTML em cache primeiro
  if (evt.request.destination === "document") {
    evt.respondWith(
      caches.match(evt.request).then(response => {
        return response || fetch(evt.request);
      })
    );
    return;
  }

  // Restante conteúdo: network first
  evt.respondWith(
    fetch(evt.request).catch(() => caches.match(evt.request))
  );
});
