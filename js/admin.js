/* ============================================================
   BONITA SNAP · 관리자 페이지 로직
   - 현재 site-config.js 를 시작값으로 불러와 편집
   - 사진은 자동 압축 후 파일에 포함(데이터 URL)
   - 저장: 설정파일 내려받기  /  GitHub API로 바로 발행
   ============================================================ */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  /* ============================================================
     로그인 잠금
     - 비밀번호는 SHA-256 해시로만 비교(평문 저장 안 함)
     - 기본 비밀번호: bonita2026  → 발행설정 탭에서 꼭 변경하세요
     - 변경한 비밀번호는 site-config.js(adminPassHash)에 저장돼 모든 기기 적용
     ※ 정적 사이트 특성상 완벽한 보안은 아니며, 실제 사이트 변경은
       GitHub 토큰이 있어야만 가능합니다(토큰은 이 브라우저에만 저장).
     ============================================================ */
  var DEFAULT_PASS_HASH = "5f8037ad1f8e442338c5cfb1178a5a20afc6524caacaf66c4b521e67f8620f77"; // "bonita2026"
  function sha256(text) {
    var data = new TextEncoder().encode(text);
    return crypto.subtle.digest("SHA-256", data).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return ("0" + b.toString(16)).slice(-2);
      }).join("");
    });
  }
  function effectiveHash() {
    return (window.SITE_CONFIG && window.SITE_CONFIG.adminPassHash) || DEFAULT_PASS_HASH;
  }
  (function gate() {
    var lock = $("#lock"), form = $("#lockForm"), pass = $("#lockPass"), msg = $("#lockMsg");
    if (sessionStorage.getItem("bonita_admin_ok") === "1") { lock.remove(); return; }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      sha256(pass.value).then(function (h) {
        if (h === effectiveHash()) {
          sessionStorage.setItem("bonita_admin_ok", "1");
          lock.remove();
        } else {
          msg.textContent = "비밀번호가 올바르지 않습니다.";
          pass.value = ""; pass.focus();
        }
      });
    });
    pass.focus();
  })();

  /* ---------- 데이터 준비 (현재 설정 복제) ---------- */
  var DEFAULT = {
    brand: "BONITA SNAP", tagline: "", phone: "", email: "", instagram: "", kakao: "",
    hero: { image: "", title: "", subtitle: "" },
    portfolio: [], products: [], faq: [],
    about: { image: "", title: "", body: [] },
  };
  var D = JSON.parse(JSON.stringify(Object.assign({}, DEFAULT, window.SITE_CONFIG || {})));
  // 누락 필드 보정
  D.hero = Object.assign({ image: "", title: "", subtitle: "" }, D.hero || {});
  D.about = Object.assign({ image: "", title: "", body: [] }, D.about || {});
  D.portfolio = D.portfolio || []; D.products = D.products || []; D.faq = D.faq || [];

  var CATS = [
    { v: "wedding", t: "본식" }, { v: "family", t: "돌·가족" },
    { v: "event", t: "행사" }, { v: "film", t: "영상" },
  ];

  /* ---------- 토스트 알림 ---------- */
  var toastEl = $("#toast"), toastTimer;
  function toast(msg, kind) {
    toastEl.textContent = msg;
    toastEl.className = "toast show" + (kind ? " " + kind : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.className = "toast"; }, 3200);
  }

  /* ---------- 탭 전환 ---------- */
  $$(".tab").forEach(function (t) {
    t.addEventListener("click", function () {
      $$(".tab").forEach(function (x) { x.classList.remove("active"); });
      $$(".pane").forEach(function (x) { x.classList.remove("active"); });
      t.classList.add("active");
      $("#pane-" + t.dataset.pane).classList.add("active");
    });
  });

  /* ---------- 이미지 압축 → 데이터 URL ---------- */
  function compress(file, maxDim, quality) {
    maxDim = maxDim || 1500; quality = quality || 0.82;
    return new Promise(function (resolve, reject) {
      var done = function (bitmapOrImg, w, h) {
        var scale = Math.min(1, maxDim / Math.max(w, h));
        var cw = Math.round(w * scale), ch = Math.round(h * scale);
        var c = document.createElement("canvas"); c.width = cw; c.height = ch;
        c.getContext("2d").drawImage(bitmapOrImg, 0, 0, cw, ch);
        resolve(c.toDataURL("image/jpeg", quality));
      };
      if (window.createImageBitmap) {
        createImageBitmap(file, { imageOrientation: "from-image" })
          .then(function (bm) { done(bm, bm.width, bm.height); })
          .catch(function () { fallback(); });
      } else { fallback(); }
      function fallback() {
        var img = new Image(), url = URL.createObjectURL(file);
        img.onload = function () { done(img, img.naturalWidth, img.naturalHeight); URL.revokeObjectURL(url); };
        img.onerror = function () { reject(new Error("이미지를 읽을 수 없습니다.")); };
        img.src = url;
      }
    });
  }

  /* ---------- 사진 추가 ---------- */
  var drop = $("#drop"), fileInput = $("#fileInput");
  drop.addEventListener("click", function () { fileInput.click(); });
  fileInput.addEventListener("change", function () { handleFiles(fileInput.files); fileInput.value = ""; });
  ["dragenter", "dragover"].forEach(function (e) {
    drop.addEventListener(e, function (ev) { ev.preventDefault(); drop.classList.add("drag"); });
  });
  ["dragleave", "drop"].forEach(function (e) {
    drop.addEventListener(e, function (ev) { ev.preventDefault(); drop.classList.remove("drag"); });
  });
  drop.addEventListener("drop", function (ev) {
    if (ev.dataTransfer && ev.dataTransfer.files) handleFiles(ev.dataTransfer.files);
  });

  function handleFiles(fileList) {
    var files = Array.prototype.slice.call(fileList).filter(function (f) { return /^image\//.test(f.type); });
    if (!files.length) { toast("이미지 파일만 추가할 수 있어요.", "err"); return; }
    toast(files.length + "장 처리 중...");
    var chain = Promise.resolve();
    files.forEach(function (f) {
      chain = chain.then(function () {
        return compress(f).then(function (dataUrl) {
          D.portfolio.push({ src: dataUrl, category: "wedding", caption: "본식 스냅" });
        });
      });
    });
    chain.then(function () { renderGrid(); toast(files.length + "장 추가 완료! 분류·순서를 정리하세요.", "ok"); })
         .catch(function (e) { toast("오류: " + e.message, "err"); });
  }

  /* ---------- 유튜브 영상 추가 ---------- */
  $("#btnAddYt").addEventListener("click", function () {
    var raw = $("#ytId").value.trim();
    if (!raw) { toast("유튜브 영상 ID를 입력하세요.", "err"); return; }
    // 전체 주소를 넣어도 ID만 뽑아냄
    var m = raw.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{6,})/);
    var id = m ? m[1] : raw;
    D.portfolio.push({ type: "youtube", id: id, category: "film", caption: $("#ytCap").value.trim() || "웨딩 필름" });
    $("#ytId").value = ""; $("#ytCap").value = "";
    renderGrid(); toast("영상 추가 완료!", "ok");
  });

  /* ---------- 포트폴리오 그리드 렌더 ---------- */
  function thumbOf(it) {
    if (it.type === "youtube") return it.poster || ("https://img.youtube.com/vi/" + it.id + "/hqdefault.jpg");
    return it.poster || it.src;
  }
  function renderGrid() {
    var grid = $("#grid"); grid.innerHTML = "";
    $("#count").textContent = "(" + D.portfolio.length + "개)";
    D.portfolio.forEach(function (it, i) {
      var isVid = it.type === "youtube" || it.type === "video";
      var el = document.createElement("div"); el.className = "item";
      var opts = CATS.map(function (c) {
        return '<option value="' + c.v + '"' + (it.category === c.v ? " selected" : "") + ">" + c.t + "</option>";
      }).join("");
      el.innerHTML =
        '<div class="thumb"><img src="' + thumbOf(it) + '" alt="">' +
          (isVid ? '<span class="badge">▶ 영상</span>' : "") + "</div>" +
        '<div class="body">' +
          '<select data-act="cat">' + opts + "</select>" +
          '<input type="text" data-act="cap" value="' + (it.caption || "").replace(/"/g, "&quot;") + '" placeholder="설명" />' +
          '<div class="ctrls">' +
            '<div class="move">' +
              '<button class="iconbtn" data-act="up" title="앞으로">▲</button>' +
              '<button class="iconbtn" data-act="down" title="뒤로">▼</button>' +
            "</div>" +
            '<button class="iconbtn del" data-act="del" title="삭제">🗑</button>' +
          "</div>" +
        "</div>";
      el.querySelector('[data-act=cat]').addEventListener("change", function (e) { it.category = e.target.value; });
      el.querySelector('[data-act=cap]').addEventListener("input", function (e) { it.caption = e.target.value; });
      el.querySelector('[data-act=up]').addEventListener("click", function () { swap(i, i - 1); });
      el.querySelector('[data-act=down]').addEventListener("click", function () { swap(i, i + 1); });
      el.querySelector('[data-act=del]').addEventListener("click", function () {
        if (confirm("이 항목을 삭제할까요?")) { D.portfolio.splice(i, 1); renderGrid(); }
      });
      grid.appendChild(el);
    });
    updateSize();
  }
  function swap(a, b) {
    if (b < 0 || b >= D.portfolio.length) return;
    var t = D.portfolio[a]; D.portfolio[a] = D.portfolio[b]; D.portfolio[b] = t; renderGrid();
  }

  /* ---------- 단일 사진 교체(메인/소개) ---------- */
  function pickImage(cb) {
    var inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*";
    inp.onchange = function () {
      if (!inp.files[0]) return;
      compress(inp.files[0], 1800, 0.84).then(cb).catch(function (e) { toast(e.message, "err"); });
    };
    inp.click();
  }
  $("#btnHeroImg").addEventListener("click", function () {
    pickImage(function (u) { D.hero.image = u; $("#heroPrev").src = u; toast("메인 배경 사진 변경됨", "ok"); updateSize(); });
  });
  $("#btnAboutImg").addEventListener("click", function () {
    pickImage(function (u) { D.about.image = u; $("#aboutPrev").src = u; toast("소개 사진 변경됨", "ok"); updateSize(); });
  });

  /* ---------- 기본정보/소개 폼 바인딩 ---------- */
  function bind(id, getter, setter) {
    var el = $(id); el.value = getter() || "";
    el.addEventListener("input", function () { setter(el.value); });
  }
  bind("#f-brand", function () { return D.brand; }, function (v) { D.brand = v; });
  bind("#f-tagline", function () { return D.tagline; }, function (v) { D.tagline = v; });
  bind("#f-phone", function () { return D.phone; }, function (v) { D.phone = v; });
  bind("#f-email", function () { return D.email; }, function (v) { D.email = v; });
  bind("#f-instagram", function () { return D.instagram; }, function (v) { D.instagram = v; });
  bind("#f-kakao", function () { return D.kakao; }, function (v) { D.kakao = v; });
  bind("#f-heroTitle", function () { return D.hero.title; }, function (v) { D.hero.title = v; });
  bind("#f-heroSub", function () { return D.hero.subtitle; }, function (v) { D.hero.subtitle = v; });
  bind("#f-aboutTitle", function () { return D.about.title; }, function (v) { D.about.title = v; });
  var abEl = $("#f-aboutBody");
  abEl.value = (D.about.body || []).join("\n");
  abEl.addEventListener("input", function () {
    D.about.body = abEl.value.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
  });
  if (D.hero.image) $("#heroPrev").src = D.hero.image;
  if (D.about.image) $("#aboutPrev").src = D.about.image;

  /* ---------- 가격 ---------- */
  function renderPrice() {
    var box = $("#priceList"); box.innerHTML = "";
    D.products.forEach(function (p, i) {
      var row = document.createElement("div"); row.className = "listrow";
      row.innerHTML =
        '<button class="btn btn-danger btn-sm del-top" data-act="del">삭제</button>' +
        '<div class="row"><div><label>상품명</label><input data-k="name" type="text" value="' + esc(p.name) + '"></div>' +
        '<div><label>가격</label><input data-k="price" type="text" value="' + esc(p.price) + '"></div></div>' +
        '<label>설명</label><input data-k="desc" type="text" value="' + esc(p.desc) + '">' +
        '<label>포함 특징 (한 줄에 하나씩)</label><textarea data-k="features" rows="3">' + (p.features || []).join("\n") + "</textarea>";
      row.querySelector('[data-k=name]').addEventListener("input", function (e) { p.name = e.target.value; });
      row.querySelector('[data-k=price]').addEventListener("input", function (e) { p.price = e.target.value; });
      row.querySelector('[data-k=desc]').addEventListener("input", function (e) { p.desc = e.target.value; });
      row.querySelector('[data-k=features]').addEventListener("input", function (e) {
        p.features = e.target.value.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
      });
      row.querySelector('[data-act=del]').addEventListener("click", function () { D.products.splice(i, 1); renderPrice(); });
      box.appendChild(row);
    });
  }
  $("#btnAddPrice").addEventListener("click", function () {
    D.products.push({ name: "새 상품", desc: "", price: "", features: [] }); renderPrice();
  });

  /* ---------- Q&A ---------- */
  function renderFaq() {
    var box = $("#faqList"); box.innerHTML = "";
    D.faq.forEach(function (q, i) {
      var row = document.createElement("div"); row.className = "listrow";
      row.innerHTML =
        '<span class="pill">Q' + (i + 1) + "</span>" +
        '<button class="btn btn-danger btn-sm del-top" data-act="del">삭제</button>' +
        '<label>질문</label><input data-k="q" type="text" value="' + esc(q.q) + '">' +
        '<label>답변</label><textarea data-k="a" rows="3">' + esc(q.a) + "</textarea>";
      row.querySelector('[data-k=q]').addEventListener("input", function (e) { q.q = e.target.value; });
      row.querySelector('[data-k=a]').addEventListener("input", function (e) { q.a = e.target.value; });
      row.querySelector('[data-act=del]').addEventListener("click", function () { D.faq.splice(i, 1); renderFaq(); });
      box.appendChild(row);
    });
  }
  $("#btnAddFaq").addEventListener("click", function () {
    D.faq.push({ q: "새 질문", a: "" }); renderFaq();
  });

  function esc(s) { return String(s == null ? "" : s).replace(/"/g, "&quot;"); }

  /* ---------- 설정 파일 만들기 ---------- */
  function buildConfigJS() {
    var header =
      "/* =============================================================\n" +
      "   BONITA SNAP · 사이트 설정 파일\n" +
      "   ※ 이 파일은 관리자 페이지(admin.html)에서 자동 생성됩니다.\n" +
      "      직접 수정도 가능하지만, 관리자 페이지 사용을 권장합니다.\n" +
      "   ============================================================= */\n";
    return header + "window.SITE_CONFIG = " + JSON.stringify(D, null, 2) + ";\n";
  }
  function updateSize() {
    var bytes = new Blob([buildConfigJS()]).size;
    var mb = bytes / 1048576;
    var note = "현재 설정 파일 크기: 약 " + (mb < 1 ? Math.round(bytes / 1024) + " KB" : mb.toFixed(1) + " MB");
    if (mb > 4) note += " ⚠️ 사진이 많아 파일이 큽니다. 너무 크면 로딩이 느려질 수 있어요.";
    $("#sizeNote").textContent = note;
  }

  /* ---------- 내려받기 ---------- */
  $("#btnDownload").addEventListener("click", function () {
    var blob = new Blob([buildConfigJS()], { type: "application/javascript" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "site-config.js";
    document.body.appendChild(a); a.click(); a.remove();
    toast("내려받기 완료! 이 파일을 GitHub의 js 폴더에 올리면 반영돼요.", "ok");
  });

  /* ---------- 비밀번호 변경 ---------- */
  $("#btnSetPw").addEventListener("click", function () {
    var a = $("#pw-new").value, b = $("#pw-new2").value;
    if (!a || a.length < 4) { toast("비밀번호는 4자 이상으로 정하세요.", "err"); return; }
    if (a !== b) { toast("두 비밀번호가 일치하지 않습니다.", "err"); return; }
    sha256(a).then(function (h) {
      D.adminPassHash = h;
      $("#pw-new").value = ""; $("#pw-new2").value = "";
      toast("비밀번호 적용됨! 발행 또는 내려받기를 눌러 저장하세요.", "ok");
      updateSize();
    });
  });

  /* ---------- GitHub 설정 저장/불러오기 ---------- */
  var GH_KEY = "bonita_gh_settings";
  function loadGh() {
    try { return JSON.parse(localStorage.getItem(GH_KEY) || "{}"); } catch (e) { return {}; }
  }
  function fillGh() {
    var g = loadGh();
    $("#gh-owner").value = g.owner || "";
    $("#gh-repo").value = g.repo || "";
    $("#gh-branch").value = g.branch || "main";
    $("#gh-token").value = g.token || "";
    $("#ghStatus").textContent = g.token ? "✅ 발행 설정이 저장되어 있어요." : "아직 설정되지 않았어요.";
  }
  $("#btnSaveGh").addEventListener("click", function () {
    var g = {
      owner: $("#gh-owner").value.trim(), repo: $("#gh-repo").value.trim(),
      branch: ($("#gh-branch").value.trim() || "main"), token: $("#gh-token").value.trim(),
    };
    if (!g.owner || !g.repo || !g.token) { toast("사용자·저장소·토큰을 모두 입력하세요.", "err"); return; }
    localStorage.setItem(GH_KEY, JSON.stringify(g));
    fillGh(); toast("발행 설정 저장 완료!", "ok");
  });
  $("#btnClearGh").addEventListener("click", function () {
    var g = loadGh(); delete g.token; localStorage.setItem(GH_KEY, JSON.stringify(g));
    fillGh(); toast("토큰을 삭제했어요.");
  });

  /* ---------- GitHub로 바로 발행 ---------- */
  $("#btnPublish").addEventListener("click", function () {
    var g = loadGh();
    if (!g.owner || !g.repo || !g.token) {
      toast("먼저 '발행 설정' 탭에서 GitHub 정보를 저장하세요.", "err");
      $$(".tab").forEach(function (x) { x.classList.remove("active"); });
      $$(".pane").forEach(function (x) { x.classList.remove("active"); });
      document.querySelector('.tab[data-pane=publish]').classList.add("active");
      $("#pane-publish").classList.add("active");
      return;
    }
    publishToGitHub(g);
  });

  function ghHeaders(token) {
    return { "Authorization": "token " + token, "Accept": "application/vnd.github+json" };
  }
  function b64(str) { return btoa(unescape(encodeURIComponent(str))); }

  function publishToGitHub(g) {
    var path = "js/site-config.js";
    var base = "https://api.github.com/repos/" + g.owner + "/" + g.repo + "/contents/" + path;
    var status = $("#ghStatus");
    status.textContent = "발행 중... 잠시만요.";
    toast("GitHub에 발행 중...");
    // 1) 기존 파일 SHA 조회 (업데이트에 필요)
    fetch(base + "?ref=" + g.branch, { headers: ghHeaders(g.token) })
      .then(function (r) { return r.status === 200 ? r.json() : null; })
      .then(function (existing) {
        var body = {
          message: "관리자 페이지에서 콘텐츠 업데이트",
          content: b64(buildConfigJS()),
          branch: g.branch,
        };
        if (existing && existing.sha) body.sha = existing.sha;
        return fetch(base, { method: "PUT", headers: ghHeaders(g.token), body: JSON.stringify(body) });
      })
      .then(function (r) {
        return r.json().then(function (data) { return { ok: r.ok, status: r.status, data: data }; });
      })
      .then(function (res) {
        if (res.ok) {
          status.innerHTML = "✅ 발행 완료! 1~2분 뒤 사이트에 반영됩니다.";
          toast("🎉 발행 완료! 1~2분 뒤 사이트에 반영돼요.", "ok");
        } else {
          var msg = (res.data && res.data.message) || ("오류 " + res.status);
          status.textContent = "❌ 실패: " + msg;
          toast("발행 실패: " + msg, "err");
        }
      })
      .catch(function (e) {
        status.textContent = "❌ 네트워크 오류: " + e.message;
        toast("발행 실패(네트워크): " + e.message, "err");
      });
  }

  /* ---------- 첫 렌더 ---------- */
  renderGrid(); renderPrice(); renderFaq(); fillGh(); updateSize();
})();
