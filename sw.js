const CACHE = 'perla-teren-v1.0.2';
const FILES = ['./', './index.html', './manifest.json',
  './icons/icon-192x192.png', './icons/icon-512x512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  if (new URL(r.url).origin !== location.origin) return;     // Supabase nikad iz predmemorije
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { caches.open(CACHE).then(c => c.put('./index.html', res.clone())); return res; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => {
    if (res && res.status === 200) { const cl = res.clone(); caches.open(CACHE).then(c => c.put(r, cl)); }
    return res;
  }).catch(() => hit)));
});
