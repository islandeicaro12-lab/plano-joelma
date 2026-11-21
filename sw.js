// Plano de Saúde de Joelma — service worker
// A página sempre vem da internet primeiro (assim as atualizações chegam na hora);
// a cópia guardada só é usada se o aparelho estiver sem conexão.
const CACHE = "plano-joelma-v1";
const SHELL = ["/", "/index.html", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // só cuida dos arquivos do próprio site; Firebase e fontes passam direto
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => {
      const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("/index.html")))
  );
});
