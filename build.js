#!/usr/bin/env node
/* =============================================================
   BONITA SNAP · 배포 빌드 스크립트
   -------------------------------------------------------------
   Cloudflare Pages 가 배포할 때마다 실행됩니다.
   index.html 의 css/js 버전 쿼리(?v=...)를 이번 배포의
   고유 커밋 해시로 자동 교체해, 브라우저·CDN 캐시가
   항상 새 파일을 받도록 강제합니다.

   - 로컬/CI 어디서 돌려도 안전 (멱등)
   - 빌드가 안 돌아도 사이트는 그대로 동작 (안전한 폴백)
   ============================================================= */
const fs = require("fs");

// Cloudflare Pages 는 CF_PAGES_COMMIT_SHA 를 자동 주입합니다.
// 없으면(로컬) 시간값으로 대체.
const sha = process.env.CF_PAGES_COMMIT_SHA || process.env.GITHUB_SHA || "";
const version = sha ? sha.slice(0, 8) : "dev" + Date.now();

const file = "index.html";
let html = fs.readFileSync(file, "utf8");

// css/style.css?v=... , js/main.js?v=... 등 로컬 정적파일 버전만 교체
const before = html;
html = html.replace(/(\.(?:css|js))\?v=[^"'\s>]*/g, "$1?v=" + version);

if (html === before) {
  console.warn("[build] 교체할 ?v= 버전 토큰을 찾지 못했습니다. (스킵)");
} else {
  fs.writeFileSync(file, html);
  console.log("[build] 정적 파일 버전 스탬프 완료 → ?v=" + version);
}

/* ---------------------------------------------------------------
   포트폴리오 앨범: content/albums/*.json 을 하나로 합쳐
   content/portfolio-albums.json 생성 (사이트는 이 파일 하나만 읽음).
   앨범을 개별 파일로 관리해 업로드/저장이 가볍고 안전해집니다.
   --------------------------------------------------------------- */
try {
  const dir = "content/albums";
  let albums = [];
  if (fs.existsSync(dir)) {
    albums = fs.readdirSync(dir)
      .filter(function (f) { return /\.json$/i.test(f); })
      .map(function (f) {
        try { return JSON.parse(fs.readFileSync(dir + "/" + f, "utf8")); }
        catch (e) { console.warn("[build] 앨범 파싱 실패:", f, e.message); return null; }
      })
      .filter(Boolean);
  }
  // 표시 순서: order(작을수록 먼저) → title
  albums.sort(function (a, b) {
    var ao = typeof a.order === "number" ? a.order : 9999;
    var bo = typeof b.order === "number" ? b.order : 9999;
    if (ao !== bo) return ao - bo;
    return String(a.title || "").localeCompare(String(b.title || ""));
  });
  fs.writeFileSync("content/portfolio-albums.json", JSON.stringify(albums, null, 2));
  console.log("[build] 포트폴리오 앨범 합침 → " + albums.length + "개");
} catch (e) {
  console.warn("[build] 앨범 합치기 실패:", e.message);
}
