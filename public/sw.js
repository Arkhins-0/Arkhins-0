const CACHE_NAME = 'portfolio-v1';

// Small static assets pre-cached during SW install
const PRECACHE_ASSETS = [
  '/',
  '/images/profile.jpg',
  '/images/OG.png',
  '/images/education/Bharath.png',
  '/images/education/SSV.png',
  '/images/companies/gdsc.png',
  '/images/companies/tt.png',
  '/images/companies/teachnook.png',
  '/images/companies/tetron.png',
  '/images/projects/hygieia.png',
  '/images/projects/BidNest.png',
  '/images/projects/BidNest-1.png',
  '/images/projects/ctr.png',
  '/images/projects/stock-prediction.png',
  '/images/projects/stock-prediction-1.png',
  '/images/skills/python.png',
  '/images/skills/react.png',
  '/images/skills/next.js.png',
  '/images/skills/javascript.png',
  '/images/skills/tailwindcss.png',
  '/images/skills/figma.png',
  '/images/skills/tensorflow.png',
  '/images/skills/git.png',
  '/images/skills/firebase.png',
  '/images/skills/android.png',
  '/images/skills/angular.png',
  '/images/skills/c.png',
  '/images/skills/css3.png',
  '/images/skills/html5.png',
  '/images/skills/java.png',
  '/images/skills/kotlin.png',
  '/images/skills/powerbi.png',
  '/images/volunteering/f4-race.png',
];

// Large video files — cached on first actual request (network-first then cache)
const VIDEO_EXTS = ['.mp4', '.webm'];

function isVideo(url) {
  return VIDEO_EXTS.some((ext) => url.pathname.endsWith(ext));
}

// ─── Install: pre-cache static assets ─────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(
          PRECACHE_ASSETS.map((url) => cache.add(url).catch(() => null))
        )
      )
      .then(() => self.skipWaiting())
  );
});

// ─── Activate: clean old caches ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch: serve from cache; update cache in background ──────────────────────
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Only handle same-origin + Google Fonts
  const isSameOrigin = url.origin === self.location.origin;
  const isGoogleFonts = url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com');
  if (!isSameOrigin && !isGoogleFonts) return;

  // Skip Next.js dev HMR
  if (url.pathname.startsWith('/_next/webpack-hmr')) return;

  if (isVideo(url)) {
    // Cache-first for videos once cached; otherwise network then cache
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((response) => {
          if (response.ok && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Stale-while-revalidate for everything else
  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        })
        .catch(() => cached); // fallback to cache if offline

      return cached || networkFetch;
    })
  );
});

// Skip waiting when notified (e.g. after update)
self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});
