/* ============================================================
   BONITA SNAP · 동작 스크립트
   site-config.js 내용을 화면에 그려주고, 갤러리/메뉴/라이트박스를
   제어합니다. 일반적인 경우 이 파일은 수정할 필요가 없습니다.
   ============================================================ */
(function () {
  "use strict";
  var C = window.SITE_CONFIG || {};
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* ---------- 기본 텍스트/이미지 채우기 ---------- */
  $$("[data-brand]").forEach(function (el) { if (C.brand) el.textContent = C.brand; });
  if (C.tagline) { var tg = $("[data-tagline]"); if (tg) tg.textContent = C.tagline; }

  if (C.hero) {
    var hb = $("[data-hero-bg]");
    if (hb && C.hero.image) hb.style.backgroundImage = "url('" + C.hero.image + "')";
    if (C.hero.title) $("[data-hero-title]").textContent = C.hero.title;
    if (C.hero.subtitle) $("[data-hero-sub]").textContent = C.hero.subtitle;
  }

  if (C.about) {
    var ai = $("[data-about-img]");
    if (ai && C.about.image) ai.src = C.about.image;
    if (C.about.title) $("[data-about-title]").textContent = C.about.title;
    var ab = $("[data-about-body]");
    if (ab && C.about.body) ab.innerHTML = C.about.body.map(function (p) { return "<p>" + p + "</p>"; }).join("");
  }

  var yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- 포트폴리오 갤러리 ---------- */
  var gallery = $("#gallery");
  function renderGallery(filter) {
    if (!gallery || !C.portfolio) return;
    gallery.innerHTML = "";
    C.portfolio.forEach(function (item, i) {
      if (filter && filter !== "all" && item.category !== filter) return;
      var fig = document.createElement("div");
      fig.className = "gallery-item reveal";
      fig.dataset.index = i;
      fig.innerHTML =
        '<img src="' + item.src + '" alt="' + (item.caption || "portfolio") + '" loading="lazy" />' +
        '<span class="cap">' + (item.caption || "") + "</span>";
      fig.addEventListener("click", function () { openLightbox(i); });
      gallery.appendChild(fig);
    });
    observeReveal();
  }

  /* ---------- 필터 버튼 ---------- */
  $$(".filter").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $$(".filter").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      renderGallery(btn.dataset.filter);
    });
  });

  /* ---------- 가격 카드 ---------- */
  var priceGrid = $("#priceGrid");
  if (priceGrid && C.products) {
    priceGrid.innerHTML = C.products.map(function (p) {
      var feats = (p.features || []).map(function (f) { return "<li>" + f + "</li>"; }).join("");
      return '<div class="price-card reveal">' +
        "<h3>" + p.name + "</h3>" +
        '<p class="pc-desc">' + (p.desc || "") + "</p>" +
        '<p class="pc-price">' + (p.price || "") + "</p>" +
        "<ul>" + feats + "</ul></div>";
    }).join("");
  }

  /* ---------- 문의 링크 ---------- */
  var cl = $("#contactLinks");
  if (cl) {
    var links = [];
    if (C.instagram) links.push('<a href="' + C.instagram + '" target="_blank" rel="noopener">Instagram</a>');
    if (C.kakao) links.push('<a href="' + C.kakao + '" target="_blank" rel="noopener">카카오톡 채널</a>');
    if (C.phone) links.push('<a href="tel:' + C.phone.replace(/[^0-9+]/g, "") + '">' + C.phone + "</a>");
    if (C.email) links.push('<a href="mailto:' + C.email + '">' + C.email + "</a>");
    cl.innerHTML = links.join("");
  }

  /* ---------- 라이트박스 ---------- */
  var lb = $("#lightbox"), lbImg = $("#lbImg");
  var visible = [];          // 현재 보이는 항목 인덱스 목록
  var pos = 0;
  function currentList() {
    return $$(".gallery-item").map(function (el) { return parseInt(el.dataset.index, 10); });
  }
  function openLightbox(realIndex) {
    visible = currentList();
    pos = visible.indexOf(realIndex);
    showLb();
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function showLb() {
    var item = C.portfolio[visible[pos]];
    if (item) lbImg.src = item.src;
  }
  function move(d) { pos = (pos + d + visible.length) % visible.length; showLb(); }
  function closeLb() { lb.classList.remove("open"); document.body.style.overflow = ""; }

  $("#lbClose").addEventListener("click", closeLb);
  $("#lbPrev").addEventListener("click", function () { move(-1); });
  $("#lbNext").addEventListener("click", function () { move(1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") move(-1);
    if (e.key === "ArrowRight") move(1);
  });

  /* ---------- 헤더 스크롤 효과 ---------- */
  var header = $("#header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 60); }
  window.addEventListener("scroll", onScroll); onScroll();

  /* ---------- 모바일 메뉴 ---------- */
  var toggle = $("#navToggle"), nav = $("#nav");
  toggle.addEventListener("click", function () {
    nav.classList.toggle("open"); toggle.classList.toggle("open");
  });
  $$(".nav a").forEach(function (a) {
    a.addEventListener("click", function () { nav.classList.remove("open"); toggle.classList.remove("open"); });
  });

  /* ---------- 스크롤 등장 애니메이션 ---------- */
  var io;
  function observeReveal() {
    if (!("IntersectionObserver" in window)) { $$(".reveal").forEach(function (el) { el.classList.add("in"); }); return; }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
      }, { threshold: 0.12 });
    }
    $$(".reveal:not(.in)").forEach(function (el) { io.observe(el); });
  }

  /* ---------- 초기 실행 ---------- */
  renderGallery("all");
  observeReveal();
})();
