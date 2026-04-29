const CACHE_NAME = 'lashon-v1';
const BASE = '/Lesson-2.0/';

// קבצים לשמירה במטמון לשימוש offline
const PRECACHE = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  // שיעורי יחידה 1
  BASE + 'u1_l1.html', BASE + 'u1_l2.html', BASE + 'u1_l3.html',
  BASE + 'u1_l4.html', BASE + 'u1_l5.html', BASE + 'u1_exam.html',
  // שיעורי יחידה 2
  BASE + 'u2_lesson1.html', BASE + 'u2_lesson2.html', BASE + 'u2_lesson3.html',
  BASE + 'u2_lesson4.html', BASE + 'u2_lesson5.html', BASE + 'u2_exam.html',
  // שיעורי יחידה 3
  BASE + 'u3_lesson5.html', BASE + 'u3_lesson6.html', BASE + 'u3_lesson7.html',
  BASE + 'u3_lesson8.html', BASE + 'u3_lesson9.html', BASE + 'u3_lesson10.html',
  BASE + 'u3_lesson11.html', BASE + 'u3_exam.html',
  // שיעורי יחידה 4
  BASE + 'u4_lesson1.html', BASE + 'u4_lesson2.html', BASE + 'u4_lesson3.html',
  BASE + 'u4_lesson4.html', BASE + 'u4_lesson5.html', BASE + 'u4_lesson6.html',
  BASE + 'u4_exam.html',
  // גופנים
  'https://fonts.googleapis.com/css2?family=Secular+One&family=Heebo:wght@300;400;500;600;700;800;900&display=swap'
];

// התקנה — שמירת קבצים במטמון
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE.filter(u => !u.startsWith('http'))))
      .then(() => self.skipWaiting())
  );
});

// הפעלה — מחיקת מטמון ישן
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// בקשות — network first, אחר כך cache
self.addEventListener('fetch', event => {
  // לא מטפלים בבקשות Firebase
  if (event.request.url.includes('firestore') || 
      event.request.url.includes('firebase') ||
      event.request.url.includes('googleapis.com/identitytoolkit')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // שמירה במטמון של תגובות מוצלחות
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // אם אין רשת — החזר מהמטמון
        return caches.match(event.request)
          .then(cached => cached || caches.match(BASE + 'index.html'));
      })
  );
});
