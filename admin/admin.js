(function () {
  "use strict";

  var started = false;
  var tokenHash = /(invite_token|confirmation_token|recovery_token|email_change_token|access_token)=/.test(window.location.hash || "");

  function showLoading() {
    var loading = document.getElementById("cmsLoading");
    if (loading) loading.hidden = false;
  }

  function hideWelcome() {
    var welcome = document.getElementById("adminWelcome");
    if (welcome) welcome.hidden = true;
    document.body.classList.add("is-editor");
  }

  function startCms() {
    if (started) return;
    started = true;
    hideWelcome();
    showLoading();

    var init = window.initCMS || (window.CMS && window.CMS.init);
    if (typeof init === "function") {
      init();
      setTimeout(function () {
        var loading = document.getElementById("cmsLoading");
        if (loading) loading.hidden = true;
      }, 1200);
    } else {
      started = false;
      var loading = document.getElementById("cmsLoading");
      if (loading) loading.hidden = true;
      window.alert("편집기를 불러오지 못했어요. 새로고침 후 다시 시도해 주세요.");
    }
  }

  var open = document.getElementById("openCms");
  if (open) open.addEventListener("click", startCms);

  if (tokenHash) {
    setTimeout(startCms, 250);
  }

  window.addEventListener("hashchange", function () {
    if (/(invite_token|confirmation_token|recovery_token|email_change_token|access_token)=/.test(window.location.hash || "")) {
      startCms();
    }
  });
})();
