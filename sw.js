const CACHE_NAME = 'bulk-tracker-v3';
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

// ネットワーク優先、かつブラウザのHTTPキャッシュも無視して常に最新を取得。
// 取得できない(オフライン)時だけ、保存済みキャッシュにフォールバックする。
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request, { cache: 'no-store' }).then((res) => {
      const resClone = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone)).catch(()=>{});
      return res;
    }).catch(() => caches.match(event.request))
  );
});
