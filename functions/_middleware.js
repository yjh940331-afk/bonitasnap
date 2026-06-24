/* =============================================================
   BONITA SNAP · 옛 서비스워커 자동 자폭 미들웨어 (Cloudflare Pages Function)
   -------------------------------------------------------------
   Cloudflare 전환 전 옛 사이트가 기기에 심어둔 서비스워커는
   파일명이 제각각이라(예: firebase-messaging-sw.js, pwa-sw.js,
   workbox-xxxx.js 등) 정적 파일만으로는 전부 못 잡는다.

   브라우저는 등록된 서비스워커 스크립트를 주기적으로(최대 24h)
   네트워크에서 다시 받아 업데이트를 확인한다. 이때:
     "우리가 아는 진짜 .js 파일이 아닌, 루트의 모든 .js 요청"
   에 자폭 스크립트를 돌려주면 → 이름이 무엇이든 옛 서비스워커가
   다음 확인 때 자폭 코드로 교체되어 스스로 사라진다.
   ============================================================= */

// 실제로 존재하는 루트 .js (이건 그대로 서빙)
const REAL_ROOT_JS = new Set([
  "/build.js",
  "/sw.js",
  "/service-worker.js",
  "/serviceworker.js",
]);

const KILL_SWITCH = `/* BONITA SNAP service-worker kill-switch (auto) */
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (event) {
  event.waitUntil((async function () {
    try {
      var keys = await caches.keys();
      await Promise.all(keys.map(function (k) { return caches.delete(k); }));
    } catch (e) {}
    try { await self.registration.unregister(); } catch (e) {}
    var clients = await self.clients.matchAll({ type: "window" });
    clients.forEach(function (c) { try { c.navigate(c.url); } catch (e) {} });
  })());
});
self.addEventListener("fetch", function (event) {
  event.respondWith(fetch(event.request));
});
`;

export async function onRequest(context) {
  const { request, next } = context;
  const path = new URL(request.url).pathname;

  // 루트 바로 아래의 단일 .js 파일이면서, 우리가 아는 진짜 파일이 아니면
  // → 옛 서비스워커 스크립트로 간주하고 자폭 코드를 돌려준다.
  const isRootJs = /^\/[^/]+\.js$/.test(path);
  if (isRootJs && !REAL_ROOT_JS.has(path)) {
    return new Response(KILL_SWITCH, {
      headers: {
        "content-type": "application/javascript; charset=utf-8",
        "cache-control": "no-cache, no-store, must-revalidate",
      },
    });
  }

  // 그 외 모든 요청은 평소대로(정적 파일) 처리
  return next();
}
