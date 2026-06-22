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

  /* 여러 줄 텍스트(배열/문자열/객체배열) → 문자열 배열로 정규화 (CMS 출력 호환) */
  function lines(v) {
    if (Array.isArray(v)) return v.map(function (x) {
      return typeof x === "string" ? x : (x && (x.line || x.item || x.feature || x.text)) || "";
    }).filter(function (s) { return s !== ""; });
    if (typeof v === "string") return v.split("\n").filter(function (s) { return s.trim() !== ""; });
    return [];
  }
  /* 포트폴리오 항목 정규화 — 사진/영상/CMS 형식 모두 처리 */
  function normItem(it) {
    if (!it) return { type: "photo", src: "" };
    if (it.youtube) return { type: "youtube", id: it.youtube, category: it.category, caption: it.caption, poster: it.poster };
    if (it.type === "youtube" || it.type === "video") return it;
    var src = it.src || it.image || "";
    return { type: "photo", src: src, category: it.category, caption: it.caption, poster: it.poster || src };
  }
  var PF = (C.portfolio || []).map(normItem);   // 정규화된 포트폴리오

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
    if (ab && C.about.body) ab.innerHTML = lines(C.about.body).map(function (p) { return "<p>" + p + "</p>"; }).join("");
  }

  var yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- 항목 종류 판별 ---------- */
  function isVideo(item) { return item && (item.type === "video" || item.type === "youtube"); }
  // 타일(썸네일)에 보여줄 이미지 경로
  function thumbOf(item) {
    if (item.type === "youtube") return item.poster || ("https://img.youtube.com/vi/" + item.id + "/hqdefault.jpg");
    return item.poster || item.src;
  }

  /* ---------- 포트폴리오 갤러리 ---------- */
  var gallery = $("#gallery");
  function renderGallery(filter) {
    if (!gallery || !C.portfolio) return;
    gallery.innerHTML = "";
    C.portfolio.forEach(function (item, i) {
      if (filter && filter !== "all" && item.category !== filter) return;
      item = normItem(item);
      var fig = document.createElement("div");
      fig.className = "gallery-item reveal" + (isVideo(item) ? " is-video" : "");
      fig.dataset.index = i;
      fig.style.transitionDelay = ((gallery.children.length % 3) * 0.08) + "s";
      fig.innerHTML =
        '<img src="' + thumbOf(item) + '" alt="' + (item.caption || "portfolio") + '" loading="lazy" />' +
        (isVideo(item) ? '<span class="play"></span>' : "") +
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
      var feats = lines(p.features).map(function (f) { return "<li>" + f + "</li>"; }).join("");
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
    if (C.naverBlog) links.push('<a href="' + C.naverBlog + '" target="_blank" rel="noopener">네이버 블로그</a>');
    if (C.youtube) links.push('<a href="' + C.youtube + '" target="_blank" rel="noopener">YouTube</a>');
    if (C.phone) links.push('<a href="tel:' + C.phone.replace(/[^0-9+]/g, "") + '">' + C.phone + "</a>");
    if (C.email) links.push('<a href="mailto:' + C.email + '">' + C.email + "</a>");
    cl.innerHTML = links.join("");
  }

  /* ---------- Q&A 아코디언 ---------- */
  var faqList = $("#faqList");
  if (faqList && C.faq) {
    C.faq.forEach(function (item, i) {
      var row = document.createElement("div");
      row.className = "faq-item reveal";
      row.style.transitionDelay = (Math.min(i, 6) * 0.05) + "s";
      var ans = (item.a || "").replace(/\n/g, "<br />");
      row.innerHTML =
        '<button class="faq-q" type="button">' +
          '<span class="faq-qmark">Q</span><span class="faq-qtext">' + item.q + "</span>" +
          '<span class="faq-icon"></span>' +
        "</button>" +
        '<div class="faq-a"><div class="faq-a-inner">' + ans + "</div></div>";
      var btn = row.querySelector(".faq-q");
      var panel = row.querySelector(".faq-a");
      btn.addEventListener("click", function () {
        var open = row.classList.contains("open");
        // 하나만 열리도록(아코디언) — 여러 개 동시에 열고 싶으면 아래 forEach 줄을 지우세요.
        $$(".faq-item.open").forEach(function (r) {
          r.classList.remove("open");
          r.querySelector(".faq-a").style.maxHeight = null;
        });
        if (!open) {
          row.classList.add("open");
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
      faqList.appendChild(row);
    });
  }

  /* ---------- 후기 ---------- */
  var reviewGrid = $("#reviewGrid");
  if (reviewGrid && C.reviews) {
    reviewGrid.innerHTML = C.reviews.map(function (r, i) {
      var photo = r.image ? '<img class="r-photo" src="' + r.image + '" alt="후기 사진" loading="lazy" />' : "";
      var sub = [r.venue, r.date].filter(Boolean).join(" · ");
      return '<div class="review-card reveal" style="transition-delay:' + (Math.min(i, 5) * 0.07) + 's">' +
        photo +
        '<div class="stars">★★★★★</div>' +
        '<p class="r-text">' + (r.text || "") + "</p>" +
        '<div class="r-meta"><div class="r-name">' + (r.name || "") + "</div>" +
        (sub ? '<div class="r-sub">' + sub + "</div>" : "") + "</div></div>";
    }).join("");
  }

  /* ---------- 예약 절차 ---------- */
  var processList = $("#processList");
  if (processList && C.process) {
    processList.innerHTML = C.process.map(function (s, i) {
      return '<div class="process-step reveal" style="transition-delay:' + (i * 0.08) + 's">' +
        '<div class="num">' + (i + 1) + "</div>" +
        '<div><div class="p-title">' + (s.title || "") + "</div>" +
        '<div class="p-desc">' + (s.desc || "") + "</div></div></div>";
    }).join("");
  }

  /* ---------- 예약 문의 폼 ---------- */
  var bForm = $("#bookingForm");
  if (bForm) {
    if (C.booking && C.booking.note) {
      var bn = $("#bookingNote");
      if (bn) bn.innerHTML = C.booking.note;
    }
    bForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = $("#bookingStatus");
      var fd = new FormData(bForm);
      var d = {
        name: (fd.get("name") || "").trim(),
        phone: (fd.get("phone") || "").trim(),
        date: (fd.get("date") || "").trim(),
        venue: (fd.get("venue") || "").trim(),
        message: (fd.get("message") || "").trim(),
      };
      if (!d.name || !d.phone) { status.className = "bf-status err"; status.textContent = "이름과 연락처를 입력해 주세요."; return; }

      var endpoint = C.booking && C.booking.endpoint;
      if (endpoint) {
        // Formspree 등으로 전송
        var btn = bForm.querySelector(".bf-submit");
        btn.disabled = true; status.className = "bf-status"; status.textContent = "보내는 중...";
        fetch(endpoint, {
          method: "POST", headers: { "Accept": "application/json" }, body: fd,
        }).then(function (r) {
          if (r.ok) {
            bForm.reset(); status.className = "bf-status ok";
            status.textContent = "예약 문의가 접수되었어요! 빠르게 연락드릴게요.";
          } else { throw new Error("fail"); }
        }).catch(function () {
          status.className = "bf-status err";
          status.textContent = "전송에 실패했어요. 카카오톡/인스타그램으로 연락 부탁드려요.";
        }).then(function () { btn.disabled = false; });
      } else if (C.email) {
        // 설정된 이메일로 메일 앱 열기
        var subject = "[예약문의] " + d.name + "님";
        var body =
          "이름: " + d.name + "\n연락처: " + d.phone +
          "\n예식일: " + (d.date || "-") + "\n예식장: " + (d.venue || "-") +
          "\n\n문의내용:\n" + (d.message || "-");
        window.location.href = "mailto:" + C.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
        status.className = "bf-status ok";
        status.textContent = "메일 앱이 열렸어요. 전송을 완료해 주세요.";
      } else {
        // 이메일/폼주소가 없으면 카카오톡 채널로 안내 (입력 내용은 클립보드에 복사)
        var txt = "[예약문의] " + d.name + " / " + d.phone +
          " / 예식일 " + (d.date || "-") + " / " + (d.venue || "-") +
          (d.message ? "\n" + d.message : "");
        if (navigator.clipboard) { try { navigator.clipboard.writeText(txt); } catch (e) {} }
        status.className = "bf-status ok";
        status.textContent = "문의 내용이 복사되었어요. 카카오톡 채널 또는 인스타그램으로 붙여넣어 보내주세요!";
        if (C.kakao) window.open(C.kakao, "_blank");
      }
    });
  }

  /* ---------- 라이트박스 (사진 + 영상) ---------- */
  var lb = $("#lightbox"), lbStage = $("#lbStage");
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
    var item = normItem(C.portfolio[visible[pos]]);
    if (!item) return;
    lbStage.innerHTML = "";   // 이전 내용(특히 영상) 정리 → 소리/재생 중단
    var el;
    if (item.type === "youtube") {
      el = document.createElement("iframe");
      el.className = "lb-media";
      el.src = "https://www.youtube.com/embed/" + item.id + "?autoplay=1&rel=0";
      el.allow = "autoplay; encrypted-media; fullscreen";
      el.setAttribute("allowfullscreen", "");
    } else if (item.type === "video") {
      el = document.createElement("video");
      el.className = "lb-media";
      el.src = item.src;
      if (item.poster) el.poster = item.poster;
      el.controls = true; el.autoplay = true; el.playsInline = true;
    } else {
      el = document.createElement("img");
      el.className = "lb-media";
      el.src = item.src;
      el.alt = item.caption || "";
    }
    lbStage.appendChild(el);
  }
  function move(d) { pos = (pos + d + visible.length) % visible.length; showLb(); }
  function closeLb() { lb.classList.remove("open"); lbStage.innerHTML = ""; document.body.style.overflow = ""; }

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

  /* ---------- 헤더 스크롤 효과 + 히어로 패럴랙스 ---------- */
  var header = $("#header");
  var heroBg = $("[data-hero-bg]");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      header.classList.toggle("scrolled", y > 60);
      // y>0 일 때만 적용 → 처음 로드 시 CSS 줌인 인트로는 그대로 살림
      if (heroBg && !reduceMotion && y > 0 && y < window.innerHeight) {
        heroBg.style.transform = "scale(1.06) translateY(" + (y * 0.18) + "px)";
      }
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

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
