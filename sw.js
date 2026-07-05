const CACHE_NAME = 'bulk-tracker-v2';
const ASSETS = ['./bulk-nutrition-tracker-pwa.html', './manifest.json'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(()=>{})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ネットワーク優先: 常に最新を取りに行き、取得できた分をキャッシュに保存。
// オフラインなど取得失敗時のみ、保存済みキャッシュを使う。
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).then((res) => {
      const resClone = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone)).catch(()=>{});
      return res;
    }).catch(() => caches.match(event.request))
  );
});
