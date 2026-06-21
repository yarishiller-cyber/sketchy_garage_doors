/* Sketchy Garage Doors — script.js (vanilla, no deps)
   - mobile nav drawer
   - footer price-reveal toggle (accessible; degrades to visible without JS)
   - progressive-enhancement form submit (fetch -> thank-you; mailto fallback)
   - footer year
*/
(function () {
  "use strict";

  /* ---- Mobile nav ---- */
  var toggle = document.querySelector(".nav__toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { links.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---- Footer price-reveal toggle ---- */
  var pBtn = document.querySelector(".footer-price-toggle");
  var pPanel = document.getElementById("footer-prices");
  if (pBtn && pPanel) {
    // JS present -> start collapsed (no-JS users see it open as a fallback)
    pPanel.hidden = true;
    pBtn.setAttribute("aria-expanded", "false");
    pBtn.addEventListener("click", function () {
      var open = pPanel.hidden;
      pPanel.hidden = !open;
      pBtn.setAttribute("aria-expanded", open ? "true" : "false");
      var label = pBtn.querySelector(".lbl");
      if (label) label.textContent = open ? "Hide prices" : "Show prices";
      if (open && window.__motion && pPanel.animate) {
        window.__motion.animate(pPanel, { opacity: [0, 1], transform: ["translateY(8px)", "translateY(0)"] }, { duration: 0.4, easing: [0.16, 1, 0.3, 1] });
      }
    });
  }

  /* ---- In-page price-reveal buttons (e.g. spring page) ---- */
  document.querySelectorAll("[data-price-toggle]").forEach(function (btn) {
    var target = document.getElementById(btn.getAttribute("data-price-toggle"));
    if (!target) return;
    target.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", function () {
      var open = target.hidden;
      target.hidden = !open;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* ---- Form submit (progressive enhancement) ---- */
  document.querySelectorAll("form[data-ajax]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      // honeypot: if filled, silently succeed (likely bot)
      var hp = form.querySelector('input[name="company_url"]');
      if (hp && hp.value) { e.preventDefault(); window.location.href = "/thank-you.html"; return; }

      if (!window.fetch) return; // let the normal POST happen
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = "Sending…"; }

      var data = new FormData(form);
      fetch(form.getAttribute("action") || "/form-handler.php", { method: "POST", body: data, headers: { "Accept": "application/json" } })
        .then(function (r) { return r.ok ? r : Promise.reject(r); })
        .then(function () { window.location.href = "/thank-you.html"; })
        .catch(function () {
          // Fallback: open a pre-filled email so the lead is never lost
          try {
            var subj = encodeURIComponent("Garage door enquiry — " + (data.get("name") || "website"));
            var lines = [];
            data.forEach(function (v, k) { if (k !== "company_url" && v) lines.push(k + ": " + v); });
            window.location.href = "mailto:info@sketchygaragedoors.ca?subject=" + subj + "&body=" + encodeURIComponent(lines.join("\n"));
          } catch (err) { /* noop */ }
          if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || "Send"; }
        });
    });
  });

  /* ---- Footer year ---- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
