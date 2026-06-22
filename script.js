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

  /* ---- Pricing reveal (FLEET-STANDARDS §2): hidden-by-default, footer toggle ----
     Every price element shows a generic label and stores the real price in data-px.
     One footer "Pricing" button swaps all [data-px] across the page. JS-off = generic labels. */
  (function () {
    var btn = document.getElementById("pricing-toggle");
    if (!btn) return;
    var els = [].slice.call(document.querySelectorAll("[data-px]"));
    var saved = new Array(els.length);
    var on = false;
    var lbl = btn.querySelector(".lbl");
    btn.addEventListener("click", function () {
      on = !on;
      els.forEach(function (el, i) {
        if (on) { if (saved[i] == null) saved[i] = el.innerHTML; el.innerHTML = el.getAttribute("data-px"); }
        else { if (saved[i] != null) el.innerHTML = saved[i]; }
      });
      document.body.classList.toggle("show-pricing", on);
      if (lbl) lbl.textContent = on ? "Hide pricing" : "Pricing";
      else btn.textContent = on ? "Hide pricing" : "Pricing";
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  })();

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
