const CACHE_NAME = 'lashon-v1';

const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/u1_l1.html', '/u1_l2.html', '/u1_l3.html',
  '/u1_l4.html', '/u1_l5.html', '/u1_exam.html',
  '/u2_lesson1.html', '/u2_lesson2.html', '/u2_lesson3.html',
  '/u2_lesson4.html', '/u2_lesson5.html', '/u2_exam.html',
  '/u3_lesson5.html', '/u3_lesson6.html', '/u3_lesson7.html',
  '/u3_lesson8.html', '/u3_lesson9.html', '/u3_lesson10.html',
  '/u3_lesson11.html', '/u3_exam.html',
  '/u4_lesson1.html', '/u4_lesson2.html', '/u4_lesson3.html',
  '/u4_lesson4.html', '/u4_lesson5.html', '/u4_lesson6.html',
  '/u4_exam.html',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('firestore') ||
      event.request.url.includes('firebase')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request)
        .then(cached => cached || caches.match('/index.html')))
  );
});
