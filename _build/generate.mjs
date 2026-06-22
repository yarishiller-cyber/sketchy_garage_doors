#!/usr/bin/env node
/* =====================================================================
   generate.mjs — static site generator for Sketchy Garage Doors.
   Emits all .html pages from one consistent layout + per-page data.
   Run:  node _build/generate.mjs
   Uses ROOT-ABSOLUTE paths (/styles.css, /assets/...) so every page in any
   folder resolves identically on Hostinger.
   ===================================================================== */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync(new URL("../site-config.json", import.meta.url)));
const DOMAIN = "https://sketchygaragedoors.ca";
const BRAND = "Sketchy Garage Doors";
const EMAIL = cfg.email;
const TEL_DISPLAY = cfg.phoneDisplay;
const TEL = cfg.phoneHref;
const SMS_BODY = encodeURIComponent(cfg.smsBody);
const ASSETV = "20260621d";
const TODAY = "2026-06-21";

/* ---------------- icons ---------------- */
const I = {
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  dollar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  wrench: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0 5 5l-9 9a2.83 2.83 0 0 1-4-4z"/></svg>',
  coil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M4 11h16M4 15h16M4 19h16M6 5l2 16M12 5l2 16M18 5l-2 16"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  track: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3v18M18 3v18M6 7h12M6 12h12M6 17h12"/></svg>',
  door: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M4 8h16M4 13h16M9 18h6"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3 6.5 7 .9-5 4.8 1.3 7-6.3-3.4L5.7 21l1.3-7-5-4.8 7-.9z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  handshake: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m11 17 2 2a1 1 0 0 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 0 0 3-3l-3.9-3.9a2 2 0 0 0-2.8 0l-.4.4a2 2 0 0 1-2.8 0l-1.6-1.6a1 1 0 0 0-1.4 0L3 8"/><path d="m21 3-3 1-4 4M3 12l2-2"/></svg>',
};

/* ---------------- shared chunks ---------------- */
const callBtn = (cls = "btn btn--primary") => `<a class="${cls}" href="tel:${TEL}" data-evt="call">${I.phone}<span>Call ${TEL_DISPLAY}</span></a>`;
const textBtn = (cls = "btn btn--on-dark") => `<a class="${cls}" href="sms:${TEL}?&body=${SMS_BODY}" data-evt="text">${I.chat}<span>Text us</span></a>`;

const NAV = [
  ["/services.html", "Services"],
  ["/service-areas/", "Service Areas"],
  ["/about.html", "About"],
  ["/faq.html", "FAQ"],
  ["/contact.html", "Contact"],
];

const SERVICES_NAV = [
  ["/garage-door-spring-repair.html", "Spring repair"],
  ["/garage-door-opener-repair-installation.html", "Opener repair & install"],
  ["/garage-door-cable-repair.html", "Cable repair"],
  ["/garage-door-off-track-roller-repair.html", "Off-track & rollers"],
  ["/new-garage-door-installation.html", "New door installation"],
  ["/garage-door-maintenance-tune-up.html", "Maintenance & tune-up"],
  ["/emergency-garage-door-repair.html", "Emergency repair"],
];

// service URL -> relevant photo (reused on cards across the site)
const SERVICE_IMG = {
  "/garage-door-spring-repair.html": "/assets/img/svc-spring.webp",
  "/garage-door-opener-repair-installation.html": "/assets/img/svc-opener.webp",
  "/garage-door-cable-repair.html": "/assets/img/svc-cable.webp",
  "/garage-door-off-track-roller-repair.html": "/assets/img/svc-offtrack.webp",
  "/new-garage-door-installation.html": "/assets/img/svc-newdoor.webp",
  "/garage-door-maintenance-tune-up.html": "/assets/img/svc-maintenance.webp",
  "/emergency-garage-door-repair.html": "/assets/img/svc-emergency.webp",
};
// responsive <img> for a card photo banner
function cardImg(img, alt) {
  const b = img.replace(/\.webp$/, "");
  return `<img src="${b}-480.webp" srcset="${b}-480.webp 480w, ${b}-960.webp 960w" sizes="(max-width:820px) 100vw, 380px" width="960" height="600" loading="lazy" decoding="async" alt="${alt}">`;
}
// an image-topped card (anchor or div)
function imgCard({ img, alt, title, desc, href, link, badge, tag }) {
  const inner = `<div class="card__pic">${badge ? `<span class="card__badge">${badge}</span>` : ""}${cardImg(img, alt)}</div>
      <div class="card__body"><h3>${title}</h3><p>${desc}</p>${link ? `<span class="card__link">${link} ${I.arrow}</span>` : ""}</div>`;
  return href
    ? `<a class="card card--img card--service" href="${href}" style="text-decoration:none">${inner}</a>`
    : `<div class="card card--img">${inner}</div>`;
}

const CITIES = ["Vancouver", "Burnaby", "Surrey", "Richmond", "Coquitlam", "North Vancouver", "Port Coquitlam", "Port Moody", "New Westminster", "West Vancouver", "Delta", "Langley", "Maple Ridge", "Pitt Meadows", "White Rock"];
// Footer shows a curated subset (full list lives on the Service Areas hub).
const FOOTER_CITIES = ["Vancouver", "Burnaby", "Surrey", "Richmond", "Coquitlam", "North Vancouver", "Langley", "Delta"];
// Smaller communities mentioned (no dedicated page) for honest extra coverage.
const EXTRA_AREAS = ["Tsawwassen", "Ladner", "Anmore", "Belcarra", "Lions Bay"];
const citySlug = (n) => n.toLowerCase().replace(/ /g, "-");

function header(curPath = "") {
  const isCur = (h) => h === curPath
    || (h === "/service-areas/" && curPath.startsWith("/service-areas/"))
    || (h === "/services.html" && /(garage-door-|new-garage-door|emergency-garage)/.test(curPath));
  return `<header class="site-header">
  <div class="container nav">
    <a class="brand" href="/" aria-label="${BRAND} home">
      <span class="brand__mark" aria-hidden="true">${I.door}</span>
      <span>Sketchy<b>·</b>Garage Doors</span>
    </a>
    <nav aria-label="Primary">
      <ul class="nav__links" id="nav-links">
        ${NAV.map(([h, t]) => `<li><a href="${h}"${isCur(h) ? ' aria-current="page"' : ""}>${t}</a></li>`).join("\n        ")}
        <li class="nav__cta-row"><a class="btn btn--primary btn--block" href="tel:${TEL}" data-evt="call">${I.phone}<span>Call ${TEL_DISPLAY}</span></a></li>
      </ul>
    </nav>
    <div class="nav__actions">
      <a class="nav__call" href="tel:${TEL}" data-evt="call">${I.phone}<span>${TEL_DISPLAY}</span></a>
      <button class="nav__toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="nav-links">${I.menu}</button>
    </div>
  </div>
</header>`;
}

function fab() {
  return `<div class="fab" role="navigation" aria-label="Quick contact">
  <a class="fab__call" href="tel:${TEL}" aria-label="Call ${BRAND} at ${TEL_DISPLAY}" data-evt="call">${I.phone}<span>Call now</span></a>
  <a class="fab__text" href="sms:${TEL}?&body=${SMS_BODY}" aria-label="Text ${BRAND}" data-evt="text">${I.chat}<span>Text us</span></a>
</div>`;
}

function partnerCTA() {
  return `<section class="section section--tight" style="background:var(--bg-soft)">
  <div class="container" data-reveal>
    <div class="note-box" style="display:flex;flex-wrap:wrap;gap:1.2rem;align-items:center;justify-content:space-between">
      <div style="max-width:60ch">
        <span class="tag">${I.handshake} Trade partners</span>
        <h3 style="margin:.6rem 0 .3rem">Busy crew? Take our overflow.</h3>
        <p style="margin:0">We get more calls than we can take. If you're a licensed installer or a related trade, apply to receive vetted overflow garage-door jobs across Greater Vancouver.</p>
      </div>
      <a class="btn btn--dark" href="/become-a-partner.html">Become a partner ${I.arrow}</a>
    </div>
  </div>
</section>`;
}

function footer() {
  const sp = cfg.springPricing;
  return `${partnerCTA()}
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a class="brand" href="/"><span class="brand__mark" aria-hidden="true">${I.door}</span><span>Sketchy Garage Doors</span></a>
        <p>Sketchy name. Spotless work. Honest, guaranteed garage-door repair &amp; installation across Greater Vancouver — upfront pricing, no $19.99 bait.</p>
        <p style="margin:0"><strong style="color:#fff">Licensed (business licence), insured &amp; WorkSafeBC-covered.</strong></p>
      </div>
      <div>
        <h4>Services</h4>
        <ul>${SERVICES_NAV.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
      </div>
      <div>
        <h4>Service areas</h4>
        <ul>${FOOTER_CITIES.map((c) => `<li><a href="/service-areas/${citySlug(c)}.html">${c}</a></li>`).join("")}<li><a href="/service-areas/">All Metro Vancouver →</a></li></ul>
      </div>
      <div class="footer-contact">
        <h4>Get in touch</h4>
        <ul>
          <li><a href="tel:${TEL}" data-evt="call">${I.phone}<span>${TEL_DISPLAY}</span></a></li>
          <li><a href="sms:${TEL}?&body=${SMS_BODY}" data-evt="text">${I.chat}<span>Text us</span></a></li>
          <li><a href="mailto:${EMAIL}">${I.mail}<span>${EMAIL}</span></a></li>
          <li style="margin-top:.4rem">${I.clock}<span>${cfg.hoursDisplay}</span></li>
        </ul>
      </div>
    </div>

    <div style="margin-top:2rem">
      <button class="footer-price-toggle" type="button" aria-expanded="false" aria-controls="footer-prices">${I.dollar}<span class="lbl">Show prices</span></button>
      <div class="footer-prices" id="footer-prices">
        <h4 style="margin-top:0">Spring repair — real prices, no surprises</h4>
        <table>
          <tr><td>${sp.singleSpring.label}</td><td>$${sp.singleSpring.price}</td></tr>
          <tr><td>${sp.twoSpringsNewCables.label} <span style="color:rgba(255,255,255,.6)">(cables free)</span></td><td>$${sp.twoSpringsNewCables.price}</td></tr>
          <tr><td>${sp.twoSpringsHighCycle.label} <span style="color:rgba(255,255,255,.6)">(cables free)</span></td><td>$${sp.twoSpringsHighCycle.price}</td></tr>
        </table>
        <p style="margin:.8rem 0 0;font-size:.875rem;color:rgba(255,255,255,.7)">Free safety inspection with every spring job · written quote before we start. <a href="/garage-door-spring-repair.html" style="color:var(--accent)">See full spring pricing →</a></p>
      </div>
    </div>

    <div class="footer-bottom">
      <div>© <span id="year">2026</span> ${BRAND}. Serving Greater Vancouver, BC.</div>
      <div style="display:flex;gap:1rem;flex-wrap:wrap">
        <a href="/privacy-policy.html">Privacy</a>
        <a href="/terms-of-service.html">Terms</a>
        <a href="/become-a-partner.html">Partner with us</a>
      </div>
    </div>
  </div>
</footer>`;
}

/* ---------------- business JSON-LD (entity, reused) ---------------- */
function businessNode() {
  return {
    "@type": "HomeAndConstructionBusiness",
    "@id": `${DOMAIN}/#business`,
    name: BRAND,
    image: [`${DOMAIN}/assets/img/home-hero-desktop.webp`, `${DOMAIN}/assets/img/about.webp`],
    logo: `${DOMAIN}/assets/og/logo-512.png`,
    url: `${DOMAIN}/`,
    telephone: cfg.phone,
    email: EMAIL,
    priceRange: "$$",
    currenciesAccepted: "CAD",
    paymentAccepted: "Cash, Credit Card, Debit, e-Transfer",
    slogan: "Sketchy name. Spotless work.",
    description: "Honest, guaranteed garage-door repair and installation across Greater Vancouver. Spring repair, openers, cables, off-track doors, new doors and same-day emergency service. Upfront pricing, no surprise fees.",
    address: { "@type": "PostalAddress", addressLocality: "Vancouver", addressRegion: "BC", addressCountry: "CA" },
    geo: { "@type": "GeoCoordinates", latitude: cfg.geo.lat, longitude: cfg.geo.lng },
    areaServed: CITIES.concat(EXTRA_AREAS).map((c) => ({ "@type": "City", name: c })),
    openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "07:00", closes: "20:00" }],
    knowsAbout: ["garage door spring repair", "garage door openers", "garage door cable repair", "off-track garage doors", "new garage door installation"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Garage door repair & installation services",
      itemListElement: SERVICES_NAV.map(([h, t]) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: t, url: DOMAIN + h, serviceType: t, provider: { "@id": `${DOMAIN}/#business` }, areaServed: { "@type": "City", name: "Greater Vancouver" } },
      })),
    },
  };
}
function breadcrumb(items) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it[0], item: DOMAIN + it[1] })) };
}
function faqNode(faqs) {
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f[0], acceptedAnswer: { "@type": "Answer", text: f[1].replace(/<[^>]+>/g, "") } })) };
}

/* ---------------- layout ---------------- */
function heroPreload(img) {
  const b = img.replace(/\.webp$/, "");
  return `<link rel="preload" as="image" href="${b}-960.webp" imagesrcset="${b}-480.webp 480w, ${b}-960.webp 960w, ${img} 1024w" imagesizes="100vw" fetchpriority="high">`;
}
function layout({ path, title, desc, body, jsonld = [], ogImg = "/assets/og/og-default.png", bodyClass = "", preload = "", noindex = false }) {
  const canonical = DOMAIN + path;
  const graph = { "@context": "https://schema.org", "@graph": [businessNode(), { "@type": "WebSite", "@id": `${DOMAIN}/#website`, url: `${DOMAIN}/`, name: BRAND, publisher: { "@id": `${DOMAIN}/#business` } }] };
  const ld = [graph].concat(jsonld);
  return `<!DOCTYPE html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#15171a">
<meta name="robots" content="${noindex ? "noindex, follow" : "index, follow, max-image-preview:large"}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${BRAND}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${DOMAIN}${ogImg}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${DOMAIN}${ogImg}">
<link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
${preload}
<link rel="preload" as="font" type="font/woff2" href="/fonts/space-grotesk-700-latin.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/fonts/inter-400-latin.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/fonts/inter-600-latin.woff2" crossorigin>
<link rel="stylesheet" href="/fonts/fonts.css?v=${ASSETV}">
<link rel="stylesheet" href="/styles.css?v=${ASSETV}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/og/logo-512.png" sizes="512x512" type="image/png">
<link rel="apple-touch-icon" href="/assets/og/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n")}
</head>
<body class="${bodyClass}">
<a class="skip-link" href="#main">Skip to content</a>
${header(path)}
<main id="main">
${body}
</main>
${footer()}
${fab()}
<script src="/script.js?v=${ASSETV}" defer></script>
<script type="module">
  const boot = async () => {
    try {
      const m = await import("https://cdn.jsdelivr.net/npm/motion@latest/+esm");
      window.__motion = { animate: m.animate, inView: m.inView, scroll: m.scroll, stagger: m.stagger };
      const mod = await import("/js/motion.js");
      mod.initMotion();
    } catch (e) { /* CDN blocked: motion.js fallback reveals all content */ }
  };
  if ("requestIdleCallback" in window) requestIdleCallback(boot, { timeout: 1800 });
  else setTimeout(boot, 200);
</script>
</body>
</html>`;
}

/* ---------------- reusable section builders ---------------- */
function pagehead({ h1, sub, img, alt, crumbs }) {
  const base = img.replace(/\.webp$/, "");
  const srcset = `${base}-480.webp 480w, ${base}-960.webp 960w, ${img} 1024w`;
  return `<section class="pagehead pagehead--img">
  <img class="pagehead__bg" src="${base}-960.webp" srcset="${srcset}" sizes="100vw" alt="" aria-hidden="true" fetchpriority="high" width="1024" height="1024">
  <div class="container">
    <div>
      ${crumbs ? `<nav class="crumbs" aria-label="Breadcrumb" style="color:rgba(255,255,255,.7)">${crumbs}</nav>` : ""}
      <h1>${h1}</h1>
      <p class="lead">${sub}</p>
      <div class="pagehead__cta">${callBtn()} ${textBtn("btn btn--on-dark")}</div>
    </div>
  </div>
</section>`;
}
function ctaBand(h = "Garage door acting up? Let's fix it today.", p = "Real technicians, upfront quotes, and a workmanship guarantee. Call or text and we'll sort it out.") {
  return `<section class="section cta-band" data-reveal>
  <div class="container">
    <h2>${h}</h2>
    <p class="mx-auto maxw" style="margin-inline:auto">${p}</p>
    <div style="display:flex;gap:.8rem;justify-content:center;flex-wrap:wrap;margin-top:1.4rem">
      ${callBtn("btn btn--dark btn--lg cta-pulse")}
      <a class="btn btn--ghost btn--lg" href="/contact.html" style="border-color:#15171a;color:#15171a">Get a free quote</a>
    </div>
  </div>
</section>`;
}
function faqSection(faqs, heading = "Frequently asked questions") {
  return `<section class="section section--soft">
  <div class="container" style="max-width:820px">
    <div class="center" data-reveal><span class="eyebrow">Straight answers</span><h2>${heading}</h2></div>
    <div class="faq" data-stagger style="margin-top:2rem">
      ${faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("\n      ")}
    </div>
  </div>
</section>`;
}
function trustChip(txt, icon) { return `<span class="hero__micro" style="margin:0"><span class="dot"></span>${txt}</span>`; }

const ASSURANCES = [
  [I.clock, "Same-day service", "Most repairs handled the day you call across Metro Vancouver."],
  [I.dollar, "Upfront pricing", "Written quote before we touch a thing. No $19.99 bait, no mystery fees."],
  [I.shield, "Licensed &amp; insured", "Business-licensed, insured &amp; WorkSafeBC-covered."],
  [I.check, "Fixed right, guaranteed", "Workmanship warranty — if it's not right, we come back free."],
];
function assuranceStrip() {
  return `<section class="trustbar"><div class="container"><div class="trustbar__grid">
    ${ASSURANCES.map(([ic, t, d]) => `<div class="trustbar__item">${ic}<span>${t}</span></div>`).join("\n    ")}
  </div></div></section>`;
}

mkdirSync(new URL("../service-areas/", import.meta.url), { recursive: true });
const out = (rel, html) => { writeFileSync(new URL("../" + rel, import.meta.url), html); console.log("wrote", rel); };

/* =====================================================================
   SERVICE PAGE DATA (unique copy each)
   ===================================================================== */
const services = {
  spring: {
    file: "garage-door-spring-repair.html",
    nav: "Spring repair",
    h1: "Garage Door Spring Repair Across Greater Vancouver",
    title: "Garage Door Spring Repair Greater Vancouver | Sketchy",
    desc: "Broken garage door spring? Same-day torsion & extension replacement across Metro Vancouver — single from $189, two + free cables from $329. Guaranteed.",
    img: "/assets/img/svc-spring.webp",
    serviceType: "Garage Door Spring Repair",
    range: cfg.serviceRanges.spring,
    lead: `A broken garage door spring is the most common — and most urgent — repair we do. When a torsion spring snaps, the door becomes far too heavy for the opener (or you) to lift safely, often trapping a car inside. <strong>We replace broken springs the same day across Greater Vancouver</strong>, with real prices posted up front: a single spring from <span class="price-amt">$${cfg.springPricing.singleSpring.price}</span>, or both springs replaced as a matched pair with <strong>free new cables</strong> from <span class="price-amt">$${cfg.springPricing.twoSpringsNewCables.price}</span>. Every spring job includes a free safety inspection and a written quote before we start. No $19.99 bait, no surprise fees — just the spring you actually need, done right and guaranteed.`,
    faqs: [
      ["How much does it cost to replace a garage door spring in Vancouver?", `Most spring jobs in the Lower Mainland land between $${cfg.springPricing.singleSpring.price} and $${cfg.springPricing.twoSpringsHighCycle.price}. A single torsion spring replacement starts at $${cfg.springPricing.singleSpring.price}; replacing both springs as a matched pair with new cables included starts at $${cfg.springPricing.twoSpringsNewCables.price}; longer-life high-cycle springs are $${cfg.springPricing.twoSpringsHighCycle.price} with cables free. You get a written quote before any work begins.`],
      ["Can you replace a garage door spring the same day?", "Yes — broken springs are our priority call. We stock the common torsion sizes on the van and reach most of Metro Vancouver the same day. Call or text us with a photo of the spring and we'll confirm a window."],
      ["Should I replace one spring or both?", "If your door has two springs and one breaks, the second is usually close behind (they wear at the same rate). Replacing both as a matched pair avoids a second call-out and keeps the door balanced — that's why our two-spring tier includes free cables. If your other spring is genuinely new, we'll happily just do the one."],
      ["Why are high-cycle springs more expensive?", "A standard spring is rated for roughly 10,000 open/close cycles (about 7 years at average use). High-cycle springs are wound from heavier wire and rated for roughly double that, so they last far longer on busy doors. They cost more up front but are cheaper over the life of the door."],
      ["Is it safe to replace a torsion spring myself?", "Honestly, no — torsion springs hold enormous stored energy and can cause serious injury if released without the right winding bars and technique. This is the one repair we'd never tell a homeowner to DIY. Let a licensed, insured tech handle it."],
      ["Do you repair extension springs too?", "Yes. Older single-car and lighter doors often use extension springs along the horizontal tracks. We service and replace both torsion and extension systems, and we'll add the safety cables that keep an extension spring from becoming a projectile if it breaks."],
    ],
  },
  opener: {
    file: "garage-door-opener-repair-installation.html",
    nav: "Opener repair & install",
    h1: "Garage Door Opener Repair & Installation",
    title: "Garage Door Opener Repair & Installation Vancouver | Sketchy",
    desc: "Opener won't open, reversing or beeping? We repair & install LiftMaster myQ openers across Metro Vancouver. Repairs $129–$249, new from $399. Same-day.",
    img: "/assets/img/svc-opener.webp",
    serviceType: "Garage Door Opener Repair and Installation",
    range: cfg.serviceRanges.opener,
    lead: `If your opener hums but won't lift, reverses halfway, beeps, or ignores the remote, we'll diagnose it on the spot and tell you straight whether it's a quick fix or time for a new unit. <strong>Opener repairs across Greater Vancouver run $129–$249</strong>; a brand-new LiftMaster opener starts at <strong>$399 installed</strong>. Many "dead" openers are actually a tripped safety sensor, a stripped drive gear, a dead backup battery, or a worn logic board — all things we carry parts for. When replacement is the smarter call, we install LiftMaster's myQ Wi-Fi line so you can open, close and check the garage from your phone. Written quote first, every time.`,
    openers: true,
    faqs: [
      ["Why does my garage door open then close again right away?", "That's almost always the safety sensors (photo-eyes) near the floor. If they're misaligned, dirty, or have a blocked beam, the opener reverses to protect anyone underneath. We realign and test them as part of a standard opener visit — often a quick, inexpensive fix."],
      ["Can you fix my opener or do I need a new one?", "We repair before we replace. Common fixable faults are drive gears, trolleys, capacitors, logic boards, remotes and sensors. If the motor is burned out or the unit is 15+ years old and parts are scarce, we'll show you the math on repair vs. replace so you decide."],
      ["What opener brands do you service?", "All the major brands — LiftMaster, Chamberlain, Genie, Craftsman, Marantec and more. For new installs we fit LiftMaster because the myQ app, battery backup options and parts availability in BC are the best we've found."],
      ["Do new openers work during a power outage?", "The battery-backup models do. On the BC coast where winter storms knock out power, we usually recommend a belt-drive or wall-mount opener with integrated battery backup so you're never locked out (or in)."],
      ["How long does a new opener installation take?", "Most single-opener installs take about 1.5–2.5 hours including haul-away of the old unit, programming your remotes and the wall console, and setting the travel and force limits properly so the door is safe."],
    ],
  },
  cable: {
    file: "garage-door-cable-repair.html",
    nav: "Cable repair",
    h1: "Garage Door Cable Repair",
    title: "Garage Door Cable Repair Greater Vancouver | Sketchy",
    desc: "Frayed or snapped cable, or door hanging crooked? Same-day garage door cable repair across Metro Vancouver, $159–$229. Licensed, insured & guaranteed.",
    img: "/assets/img/svc-cable.webp",
    serviceType: "Garage Door Cable Repair",
    range: cfg.serviceRanges.cable,
    lead: `Garage door cables work hand-in-hand with the springs to carry the door's weight. When a cable frays, slips off the drum, or snaps, the door often hangs crooked, jams in the track, or won't move at all — and a loaded cable under tension is genuinely dangerous to poke at. <strong>We repair and replace garage door cables across Greater Vancouver for $159–$229</strong>, usually the same day. Out here the coastal rain, salt air and damp garages rust cables from the inside out, so we always inspect both sides and the spring set while we're there. You'll get a written quote first and a workmanship guarantee on the repair.`,
    faqs: [
      ["Why did my garage door cable snap?", "Usually age and corrosion. Metro Vancouver's damp, salty coastal air rusts the thin galvanized strands over time, and a frayed cable eventually lets go — often right after a spring breaks and overloads it. Cables can also jump the drum if the door comes off balance."],
      ["Is a broken cable dangerous?", "A cable that's still attached can be under heavy spring tension, and a door with one snapped cable can drop or twist suddenly. Don't operate the opener and keep kids and cars clear until it's fixed. We handle it safely with the spring tension released properly."],
      ["Do you replace both cables at once?", "We recommend it. Cables wear as a pair, so if one has corroded or frayed enough to fail, the other isn't far behind. Doing both keeps the door balanced and saves you a second call-out — and it's a small part cost."],
      ["Can I still use my garage door with a frayed cable?", "Please don't. A frayed cable can snap mid-travel and let the door fall or bind in the track, damaging panels and rollers. Pull the manual release if needed and call us — same-day cable repair is one of our quickest visits."],
    ],
  },
  offtrack: {
    file: "garage-door-off-track-roller-repair.html",
    nav: "Off-track & rollers",
    h1: "Off-Track & Roller Repair",
    title: "Garage Door Off Track & Roller Repair Vancouver | Sketchy",
    desc: "Garage door off its track, stuck or grinding? We re-rail doors and replace worn, noisy rollers across Metro Vancouver, $149–$289. Same-day & guaranteed.",
    img: "/assets/img/svc-offtrack.webp",
    serviceType: "Garage Door Off-Track and Roller Repair",
    range: cfg.serviceRanges.offtrack,
    lead: `A door that's jumped its track — leaning, jammed at an angle, or grinding and squealing — needs a careful hand, not a crowbar. Forcing it bends the track and cracks panels. <strong>We re-rail off-track doors and replace worn rollers across Greater Vancouver for $149–$289</strong>, usually same day. Most off-track doors trace back to a worn roller, a bent track from a bumper tap, a loose bottom bracket, or a broken cable letting the door slip. We straighten or replace the affected track, fit smooth nylon rollers, check the brackets and re-balance the door so it glides quietly again. Written quote before any work.`,
    faqs: [
      ["My garage door came off the track — can I force it back on?", "Please don't try to muscle it. An off-track door is usually under spring tension and can drop or twist, and prying the track bends it permanently. Stop using the opener and call us — re-railing safely is a routine same-day fix for us."],
      ["Why is my garage door so loud and grinding?", "Most garage-door noise is worn steel rollers, dry hinges, or loose hardware. Swapping to sealed nylon rollers and properly lubricating the moving parts makes most doors dramatically quieter — a popular add-on when there's living space above the garage."],
      ["What causes a garage door to go off track?", "The big four: worn or broken rollers, a track bent by a vehicle bump, a snapped cable or spring throwing the door out of balance, or loose lag bolts and brackets. We fix the cause, not just the symptom, so it doesn't jump again."],
      ["How long do garage door rollers last?", "Basic steel rollers often wear out in 5–7 years, especially in damp coastal garages. Quality nylon rollers with sealed bearings can last 10–20 years and run far quieter. We'll show you what's on your door and what we'd put back."],
    ],
  },
  newdoor: {
    file: "new-garage-door-installation.html",
    nav: "New door installation",
    h1: "New Garage Door Installation",
    title: "New Garage Door Installation Vancouver | Sketchy",
    desc: "Replacing a tired or damaged garage door? Insulated steel, aluminium-glass & carriage doors installed across Metro Vancouver from $1,290. Free quotes.",
    img: "/assets/img/svc-newdoor.webp",
    serviceType: "Garage Door Installation",
    range: cfg.serviceRanges.newdoor,
    lead: `When a door is rusted, dented beyond repair, or just dated, a new one is one of the highest-return upgrades a Vancouver home can make — it's the biggest moving thing on your house. <strong>We supply and install new garage doors across Greater Vancouver from $1,290</strong>, including haul-away of the old door and fresh hardware. We fit insulated steel doors (a smart move for our wet, cool winters and garages used as gyms or shops), modern aluminium-and-glass doors for contemporary builds, and carriage-style doors for character homes. We measure on-site, give you a written all-in quote with no vague "from" pricing, and install it level, sealed and balanced.`,
    faqs: [
      ["How much does a new garage door cost installed in Vancouver?", "A standard single insulated steel door starts around $1,290 installed; a double door or a premium aluminium-glass or carriage-style door costs more. We quote the all-in number — door, tracks, hardware, install and haul-away — after a free on-site measure, so there are no surprises."],
      ["Should I get an insulated garage door?", "On the coast, usually yes. Insulated (polyurethane-core) doors hold heat far better for garages used as workshops, gyms or rooms above living space, dampen street noise, and are more rigid and dent-resistant. We'll talk through R-values for your situation."],
      ["How long does a garage door installation take?", "Most single-door replacements are done in 3–5 hours; doubles or jobs needing new tracks and an opener take most of a day. We program the opener and balance the door before we leave."],
      ["Do you remove and dispose of my old door?", "Yes — haul-away and disposal of the old door, tracks and hardware is included in our install quote. You're left with a clean garage and a working door."],
      ["What door brands and styles do you install?", "We install quality North-American door lines in steel, aluminium-glass and carriage styles, in the colours and window options to match your home. Tell us your look and budget and we'll bring options to the quote."],
    ],
  },
  maintenance: {
    file: "garage-door-maintenance-tune-up.html",
    nav: "Maintenance & tune-up",
    h1: "Garage Door Maintenance & Tune-Up",
    title: "Garage Door Tune-Up & Maintenance Vancouver | Sketchy",
    desc: "Keep your door quiet and safe with a $129 flat-rate tune-up across Metro Vancouver: balance, rollers, hinges, springs & full safety check. Book ahead.",
    img: "/assets/img/svc-maintenance.webp",
    serviceType: "Garage Door Maintenance and Tune-Up",
    range: cfg.serviceRanges.maintenance,
    lead: `A garage door is the heaviest, most-used moving part of your home — and a 20-minute tune-up is the cheapest way to avoid a snapped-spring emergency on a rainy Tuesday. <strong>Our flat-rate $129 tune-up covers the whole system</strong>: we balance the door, tighten hardware, lubricate rollers, hinges and springs, test the auto-reverse and photo-eye safety sensors, adjust the opener's travel and force, and inspect cables and springs for wear. You get an honest report — what's healthy, what to watch, and what (if anything) actually needs attention. No upselling things you don't need. Ideal once a year, especially before winter cold snaps spike spring failures.`,
    faqs: [
      ["How often should I service my garage door?", "Once a year for an average home; twice if the door cycles many times a day or there's living space above the garage. Annual maintenance catches frayed cables and tired springs before they fail and keeps the safety sensors working."],
      ["What's included in your tune-up?", "Door balance test, lubrication of rollers/hinges/springs, hardware tightening, cable and spring inspection, roller condition check, opener travel-and-force adjustment, and a full safety-sensor and auto-reverse test. We finish with a plain-English report."],
      ["Will a tune-up make my noisy door quieter?", "Usually a lot quieter. Most noise is dry hinges, worn rollers and loose bolts — all addressed in a tune-up. If your rollers are worn out we'll quote quiet nylon replacements rather than just masking it with grease."],
      ["Can a tune-up prevent a broken spring?", "It can't make a spring last forever, but we measure wear and can warn you when a spring is near the end of its cycle life — so you can replace it on your schedule instead of waking up to a trapped car."],
    ],
  },
  emergency: {
    file: "emergency-garage-door-repair.html",
    nav: "Emergency repair",
    h1: "Emergency Garage Door Repair",
    title: "Emergency Garage Door Repair Vancouver | Sketchy",
    desc: "Door stuck open, car trapped, or won't close at night? Fast same-day emergency garage door repair across Metro Vancouver. Honest after-hours rates.",
    img: "/assets/img/svc-emergency.webp",
    serviceType: "Emergency Garage Door Repair",
    range: cfg.serviceRanges.emergency,
    lead: `A garage door that won't close leaves your home open; one that won't open can trap your car when you need to leave. Either way it's stressful — and it's exactly when shady operators love to overcharge a panicked homeowner. <strong>We do fast same-day emergency garage door repair across Greater Vancouver with the same honest, written pricing as any other day</strong> — a fair, clearly-stated after-hours rate, never a made-up "emergency" number. Most urgent calls are a broken spring, a snapped cable, an off-track door, or a dead opener, and we carry the common parts to fix them on the first visit. Call or text and we'll tell you straight when we can be there.`,
    faqs: [
      ["My garage door won't close and it's night — what do I do?", "Text or call us right away; we'll talk you through securing it. Often the cause is a blocked or misaligned safety sensor, which we can fix fast. If we can't get there immediately, we'll help you safely lock the door down for the night so your home isn't left open."],
      ["Do you charge huge emergency fees?", "No. We quote a fair, clearly-stated after-hours rate before we come — the same honest pricing as a daytime call, just with a modest after-hours add-on. The whole point of a company called Sketchy is to be the opposite of one. No panic upsells."],
      ["My car is trapped behind a broken door — can you come today?", "That's a priority call for us. A snapped spring makes the door too heavy to lift by hand; don't force it. Call or text and we'll get a same-day window to you and bring the parts to free your car and fix the door properly."],
      ["What counts as an emergency repair?", "A door stuck open (security risk), a door that's fallen or jammed off-track, a broken spring or cable trapping a vehicle, or an opener failure that's left you locked out. If it can't safely wait, treat it as an emergency and call."],
    ],
  },
};

/* ---------------- opener picker ---------------- */
const openerManifest = JSON.parse(readFileSync("/home/user/garagedoors-shared/assets/liftmaster/manifest.json"));
const openerPrices = { "2220L": 549, "6580L": 749, "98022L": 949, "2420L": 649, "4690": 699, "6690L": 799, "98032": 1049 };
function openerCard(m) {
  const price = openerPrices[m.sku];
  const base = "/assets/openers/" + m.image.replace(".webp", "");
  return `<div class="opener" data-reveal>
    <div class="opener__main">
      <img class="opener__img" src="${base}.webp" srcset="${base}-480.webp 480w, ${base}.webp 1000w" sizes="150px" width="150" height="118" loading="lazy" decoding="async" alt="${m.imageAlt}">
      <div class="opener__info">
        <span class="opener__tag">${m.tag}</span>
        <h3>${m.name}</h3>
        <p class="opener__spec">${m.series} · ${m.drive} · ${m.hp}${m.batteryBackup ? " · battery backup" : ""}</p>
        <p class="opener__price">$${price} <span style="font-size:.8rem;font-weight:600;color:var(--ink-soft)">installed</span></p>
        <p style="font-size:.9rem;margin:0">${m.tagline}</p>
        <ul class="opener__pills">${m.specs.slice(0, 4).map((s, i) => `<li class="${i === 0 ? "is-feature" : ""}">${s}</li>`).join("")}</ul>
      </div>
    </div>
    <div class="opener__foot">
      <span style="font-size:.85rem;color:var(--ink-soft)">myQ Wi-Fi · Security+ 2.0</span>
      <a class="opener__quote" href="tel:${TEL}" data-evt="call">Get this installed →</a>
    </div>
  </div>`;
}
const openerAll = openerManifest.primary.concat(openerManifest.secondary);
function openerListLd() {
  return {
    "@context": "https://schema.org", "@type": "ItemList",
    name: "Residential LiftMaster garage door openers installed by Sketchy Garage Doors",
    itemListElement: openerAll.map((m, i) => ({
      "@type": "ListItem", position: i + 1,
      item: {
        "@type": "Product", name: m.name, image: DOMAIN + "/assets/openers/" + m.image,
        description: m.blurb, brand: { "@type": "Brand", name: "LiftMaster" }, category: "Garage door opener",
        offers: { "@type": "Offer", price: String(openerPrices[m.sku]), priceCurrency: "CAD", availability: "https://schema.org/InStock", seller: { "@id": `${DOMAIN}/#business` } },
      },
    })),
  };
}
function openerSection() {
  return `<section class="section section--soft">
  <div class="container">
    <div class="center" data-reveal style="max-width:700px;margin-inline:auto">
      <span class="eyebrow">Pick the right opener for your home</span>
      <h2>Residential LiftMaster openers we install</h2>
      <p class="lead mx-auto">Real prices, installed — including haul-away of your old unit and full programming. Every model runs the myQ app so you can open, close and check your garage from your phone, with battery-backup options for our storm-prone coast. Not sure which fits? We'll recommend the right one for your door and budget — no upselling.</p>
    </div>
    <div class="openers" style="margin-top:2rem;max-width:760px;margin-inline:auto">
      ${openerManifest.primary.map(openerCard).join("\n      ")}
    </div>
    <details style="max-width:760px;margin:1.2rem auto 0">
      <summary class="btn btn--ghost openers__toggle" style="cursor:pointer">View more openers</summary>
      <div class="openers" style="margin-top:1.2rem">
        ${openerManifest.secondary.map(openerCard).join("\n        ")}
      </div>
    </details>
    <p class="center" style="margin-top:1.5rem;font-size:.9rem;color:var(--ink-soft)">Prices are installed, including haul-away of your old opener and programming. Final quote confirmed on site.</p>
  </div>
</section>`;
}

/* ---------------- render service pages ---------------- */
function servicePage(key) {
  const s = services[key];
  const crumbs = `<a href="/">Home</a> / <a href="/services.html">Services</a> / <span style="color:#fff">${s.nav}</span>`;
  const offer = key === "spring"
    ? { "@type": "Offer", priceCurrency: "CAD", priceSpecification: { "@type": "PriceSpecification", minPrice: "189", maxPrice: "429", priceCurrency: "CAD" } }
    : { "@type": "Offer", priceCurrency: "CAD" };
  const serviceLd = {
    "@context": "https://schema.org", "@type": "Service", serviceType: s.serviceType,
    name: s.h1, provider: { "@id": `${DOMAIN}/#business` },
    areaServed: { "@type": "City", name: "Greater Vancouver" }, description: s.desc, offers: offer,
  };
  const otherServices = SERVICES_NAV.filter(([h]) => !h.includes(s.file));

  let extra = "";
  if (key === "spring") extra = springTiers() + springTypes();
  if (key === "opener") extra = openerSection();
  const extraLd = key === "opener" ? [openerListLd()] : [];

  const body = `${pagehead({ h1: s.h1, sub: s.desc.split(". ")[0] + ".", img: s.img, alt: s.h1, crumbs })}
${assuranceStrip()}
<section class="section">
  <div class="container split">
    <div data-reveal>
      <span class="eyebrow">${s.nav} · ${s.range}</span>
      <h2>${s.h1.replace(" Across Greater Vancouver", "")}</h2>
      <p class="lead">${s.lead}</p>
      <div style="display:flex;gap:.7rem;flex-wrap:wrap;margin-top:1.2rem">${callBtn()} ${textBtn("btn btn--ghost")}</div>
    </div>
    <div class="split__media zoom-frame" data-reveal="right">
      <img src="${s.img}" width="1024" height="1024" loading="lazy" decoding="async" alt="${s.h1} — Sketchy Garage Doors technician at work in Metro Vancouver">
    </div>
  </div>
</section>
${extra}
<section class="section section--soft">
  <div class="container">
    <div class="center" data-reveal><span class="eyebrow">What you get</span><h2>Why homeowners call the company named Sketchy</h2></div>
    <div class="grid grid--3" data-stagger style="margin-top:2rem">
      ${imgCard({ img: "/assets/img/trust-pricing.webp", alt: "Upfront written price quote on a clipboard", title: "Upfront, written pricing", desc: `You approve the number before we start. No bait pricing, no "while we're in here" surprises.` })}
      ${imgCard({ img: "/assets/img/trust-licensed.webp", alt: "Licensed and insured Sketchy Garage Doors technician by the van", title: "Licensed &amp; insured", desc: `Business-licensed, insured &amp; WorkSafeBC-covered — the boring paperwork that means you're protected.` })}
      ${imgCard({ img: "/assets/img/trust-guarantee.webp", alt: "Technician giving a thumbs up by a finished garage door", title: "Guaranteed work", desc: `Quality parts and a workmanship warranty. If it isn't right, we come back and make it right.` })}
    </div>
  </div>
</section>
${faqSection(s.faqs)}
<section class="section">
  <div class="container center" data-reveal>
    <span class="eyebrow">More we fix</span>
    <h2>Other garage-door services</h2>
    <div class="coverage-list" style="justify-content:center">${otherServices.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</div>
  </div>
</section>
${ctaBand()}`;

  out(s.file, layout({
    path: "/" + s.file, title: s.title, desc: s.desc, body, ogImg: s.img, preload: heroPreload(s.img),
    jsonld: [serviceLd, ...extraLd, breadcrumb([["Home", "/"], ["Services", "/services.html"], [s.nav, "/" + s.file]]), faqNode(s.faqs)],
  }));
}

function springTiers() {
  const sp = cfg.springPricing;
  const tier = (t, featured, tag) => `<div class="tier${featured ? " tier--featured" : ""}">
    <span class="tier__tag">${tag}</span>
    <h3>${t.label}</h3>
    <div class="tier__price">$${t.price} <small>installed</small></div>
    <p>${t.blurb}</p>
    <ul class="checks">${(t.includes || ["Replace broken spring", "Lubricate & balance door", "Free safety inspection"]).map((x) => `<li>${I.check}<span>${x[0].toUpperCase() + x.slice(1)}</span></li>`).join("")}</ul>
    ${callBtn("btn btn--primary btn--block")}
  </div>`;
  return `<section class="section">
  <div class="container">
    <div class="priceblock" data-reveal>
      <span class="eyebrow">Real prices · no $19.99 bait</span>
      <h2>Spring repair pricing, posted up front</h2>
      <p class="lead">${sp.rangeNote} Pick the tier that fits — we'll confirm on site and never start without your OK.</p>
      <div class="tier-grid">
        ${tier(sp.singleSpring, false, "Quick fix")}
        ${tier(sp.twoSpringsNewCables, true, "Most popular")}
        ${tier(sp.twoSpringsHighCycle, false, "Longest life")}
      </div>
      <p class="price-note">${I.check} Free cables on both two-spring tiers &nbsp;·&nbsp; ${I.check} Free safety inspection every job &nbsp;·&nbsp; ${I.check} Written quote before we touch a thing</p>
    </div>
  </div>
</section>`;
}

function springTypes() {
  return `<section class="section section--soft">
  <div class="container">
    <div class="center" data-reveal style="max-width:680px;margin-inline:auto">
      <span class="eyebrow">Know your door</span>
      <h2>Two kinds of residential garage door spring</h2>
      <p class="lead mx-auto">Most homes use one of these two systems. We service and replace both — and we'll tell you which one you've got and what it'll cost before we start.</p>
    </div>
    <div class="grid grid--2" data-stagger style="margin-top:2.2rem">
      <div class="card" style="padding:0;overflow:hidden">
        <div class="zoom-frame" style="border-radius:0"><img src="/assets/img/spring-torsion.webp" srcset="/assets/img/spring-torsion-480.webp 480w, /assets/img/spring-torsion-960.webp 960w, /assets/img/spring-torsion.webp 1024w" sizes="(max-width:820px) 100vw, 560px" width="1024" height="1024" loading="lazy" decoding="async" alt="Torsion spring mounted on the shaft above a residential garage door"></div>
        <div style="padding:var(--s-6)">
          <span class="tag">Most common</span>
          <h3 style="margin-top:.7rem">Torsion springs (above the door)</h3>
          <p>Mounted on a steel shaft above the opening, torsion springs are safer, last longer (≈15,000–20,000 cycles), and run smoother — standard on most modern double doors. They wind under huge tension, which is exactly why you never DIY them.</p>
          <ul class="checks"><li>${I.check}<span>Longer life, smoother &amp; quieter operation</span></li><li>${I.check}<span>Best for heavier insulated &amp; double doors</span></li></ul>
        </div>
      </div>
      <div class="card" style="padding:0;overflow:hidden">
        <div class="zoom-frame" style="border-radius:0"><img src="/assets/img/spring-extension.webp" srcset="/assets/img/spring-extension-480.webp 480w, /assets/img/spring-extension-960.webp 960w, /assets/img/spring-extension.webp 1024w" sizes="(max-width:820px) 100vw, 560px" width="1024" height="1024" loading="lazy" decoding="async" alt="Extension spring running along the horizontal track of a residential garage door"></div>
        <div style="padding:var(--s-6)">
          <span class="tag">Older / lighter doors</span>
          <h3 style="margin-top:.7rem">Extension springs (along the tracks)</h3>
          <p>Stretched along the horizontal tracks on each side, extension springs are common on older and single-car doors. They're rated for fewer cycles (≈10,000) and should always have a safety cable so a broken spring can't become a projectile.</p>
          <ul class="checks"><li>${I.check}<span>We always fit/upgrade safety cables</span></li><li>${I.check}<span>Replaced in pairs to keep the door balanced</span></li></ul>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

/* =====================================================================
   CITY PAGE DATA (unique local copy each)
   ===================================================================== */
const cityData = {
  "Vancouver": {
    img: "/assets/img/city-vancouver.webp",
    intro: `Vancouver's housing is a patchwork — and so are its garage doors. We service everything from century-old East Van and Kitsilano character homes with original wooden doors and laneway garages, to glassy new builds on the West Side, to apartment and townhouse complexes downtown. <strong>The common enemy here is moisture</strong>: the city's famous damp and salt air rust cables and springs and swell wooden doors that stick. We fix springs, cables, openers and off-track doors across every Vancouver neighbourhood — same day, with pricing posted up front.`,
    detail: `<h2>Garage-door realities in Vancouver</h2>
      <p>From the steep lots of Grandview and the laneway homes of Mount Pleasant to the heritage craftsman houses of Dunbar and Point Grey, Vancouver throws a lot at a garage door. Older homes often hide single extension-spring setups and narrow, tight-radius tracks; newer West-Side and Cambie-corridor builds run heavier insulated doors that need properly-sized springs. Laneway-house garages are tight to work in but we're set up for it.</p>
      <p>If your door sticks on damp mornings, screeches on the rollers, or the opener struggles after a wet week, that's coastal Vancouver doing its thing — and all of it is routine for us.</p>`,
    neigh: ["Kitsilano", "East Vancouver", "Mount Pleasant", "Dunbar", "Point Grey", "Kerrisdale", "Marpole", "Hastings-Sunrise"],
    faqs: [
      ["How fast can you reach my Vancouver neighbourhood?", "We cover the whole city — East Van to the West Side, Downtown to Marpole — and reach most addresses the same day. Call or text with your postal code and we'll give you a real arrival window."],
      ["Do you work on older Vancouver homes with wooden garage doors?", "Constantly. Heritage and character homes often have heavier wooden doors and older spring or track setups; we service them, re-balance them, and can quote a modern insulated replacement if the old door is past saving."],
      ["Can you service laneway house garages?", "Yes. Laneway and infill garages are tight, but we're equipped for compact installs and repairs — springs, openers and new doors included."],
    ],
  },
  "Burnaby": {
    img: "/assets/img/city-burnaby.webp",
    intro: `Burnaby is a city of double-garage family homes — and double-garage homes mean double the springs, cables and rollers that eventually wear out. From the hillside homes around Burnaby Mountain and SFU to the established neighbourhoods of Burnaby Heights, Deer Lake and Metrotown, we handle spring breaks, opener faults and off-track doors across the whole city, same day. <strong>Most Burnaby calls are a snapped spring or a tired opener on a hard-working double door</strong> — both things we carry parts for and fix on the first visit, with the price agreed before we start.`,
    detail: `<h2>What we see on Burnaby doors</h2>
      <p>Burnaby's mix of solid 1960s–80s homes and newer builds means a lot of heavy double doors that get used as the main entrance to the house. High-use doors burn through standard springs faster, which is why we so often recommend the matched-pair or high-cycle spring tiers here. The elevation around Capitol Hill and Burnaby Mountain also means cold snaps hit a little harder — and cold is when brittle springs let go.</p>
      <p>Whether you're near Brentwood, Edmonds, Lougheed or Deer Lake, we'll get the door balanced, quiet and safe again.</p>`,
    neigh: ["Burnaby Heights", "Metrotown", "Brentwood", "Deer Lake", "Capitol Hill", "Edmonds", "Lougheed", "SFU / Burnaby Mountain"],
    faqs: [
      ["Do you cover all of Burnaby?", "Yes — North and South Burnaby, from Burnaby Heights and Capitol Hill to Metrotown, Edmonds and the Lougheed corridor. Same-day service for most repairs."],
      ["My double garage door has two springs — do both need replacing?", "Usually yes. On a busy Burnaby double door the springs wear together, so replacing the pair (with free cables) avoids a repeat call-out and keeps the heavy door balanced."],
      ["Can you install a quieter opener for a bedroom above the garage?", "Definitely. Many Burnaby homes have rooms over the garage — we fit ultra-quiet belt-drive or wall-mount LiftMaster openers and swap noisy steel rollers for nylon."],
    ],
  },
  "Surrey": {
    img: "/assets/img/city-surrey.webp",
    intro: `Surrey is big, fast-growing, and full of newer homes with large double and even triple garages — which is exactly why garage-door repair demand here is huge. From Cloverdale and South Surrey/White Rock to Fleetwood, Guildford and Newton, we cover the whole city with same-day spring, cable, opener and off-track repair. <strong>On newer Surrey builds the most common call is an opener or sensor fault, plus springs that wear early on big, heavy, frequently-used doors.</strong> Whatever the issue, you'll get an honest written quote first — no inflated "newer home" pricing.`,
    detail: `<h2>Garage doors in a fast-growing Surrey</h2>
      <p>Because so much of Surrey was built in the last 20–30 years, we see a lot of original-equipment springs and openers reaching the end of their service life all at once. Big double and triple doors in Panorama Ridge, Morgan Heights and Clayton put serious cycles on their hardware, and the further south you go toward White Rock the more the coastal salt air gets into cables and springs.</p>
      <p>We stock the common torsion sizes and LiftMaster parts for newer installs, so most Surrey repairs are one-visit fixes.</p>`,
    neigh: ["Cloverdale", "South Surrey", "Fleetwood", "Guildford", "Newton", "Clayton Heights", "Panorama Ridge", "Morgan Creek"],
    faqs: [
      ["Do you service all of Surrey and White Rock?", "Yes — Cloverdale, Fleetwood, Guildford, Newton, Clayton, South Surrey and White Rock. Surrey's spread out, so call or text your area and we'll confirm the soonest same-day window."],
      ["My newer home's garage door already broke a spring — is that normal?", "It's common. Builder-grade springs on big double/triple doors that cycle many times a day can wear out in a few years. We'll fit a properly-sized matched pair or high-cycle springs that last much longer."],
      ["Can you do triple-car garage doors?", "Absolutely. Larger and triple doors are common in Surrey; we size springs and openers correctly for the extra weight so the door runs balanced and safe."],
    ],
  },
  "Richmond": {
    img: "/assets/img/city-richmond.webp",
    intro: `Richmond sits at sea level on the Fraser delta, and that flat, coastal, salt-laden environment is tough on garage-door hardware. From Steveston's seaside homes to Brighouse, Broadmoor and the newer subdivisions off No. 3 Road, we service springs, cables, openers and off-track doors across the whole island city — same day. <strong>The signature Richmond problem is corrosion</strong>: damp ocean air rusts cables, springs and steel rollers faster than almost anywhere in Metro Vancouver, so we always check the whole system and can fit corrosion-resistant parts. Upfront pricing, every visit.`,
    detail: `<h2>Why Richmond is hard on garage doors</h2>
      <p>Being surrounded by water means more humidity and salt in the air, and that accelerates rust on the thin galvanized cables and the spring wire that carry your door's weight. We see frayed cables and surface-rusted springs in Richmond years before they'd fail somewhere drier. The flat terrain also means a lot of homes with attached double garages used daily.</p>
      <p>From Steveston Village and Terra Nova to Broadmoor, Hamilton and the City Centre towers' townhome complexes, we'll get your door sorted and tell you honestly how much corrosion life is left in the rest.</p>`,
    neigh: ["Steveston", "Brighouse", "Broadmoor", "Terra Nova", "Hamilton", "Seafair", "Thompson", "City Centre"],
    faqs: [
      ["Why do my garage door cables keep rusting in Richmond?", "Richmond's coastal, sea-level air carries more moisture and salt, which corrodes galvanized cables and spring wire faster. We can fit higher-grade, corrosion-resistant cables and recommend an annual tune-up to catch rust early."],
      ["Do you serve Steveston and all of Richmond?", "Yes — Steveston, Brighouse, Broadmoor, Terra Nova, Seafair, Hamilton and City Centre. Same-day service across the island for most repairs."],
      ["My spring broke during a cold snap — is the salt air to blame?", "It's a combination: salt-air corrosion weakens the spring, then a cold snap makes the steel brittle and it finally snaps. Replacing as a matched pair and a yearly inspection is the best defence in Richmond."],
    ],
  },
  "Coquitlam": {
    img: "/assets/img/city-coquitlam.webp",
    intro: `Coquitlam climbs from the Fraser up into the forested slopes below Burke Mountain, and that range of elevation and tree cover shapes its garage-door wear. From Burquitlam and Maillardville to the newer hillside neighbourhoods of Burke Mountain and Westwood Plateau, we handle spring, cable, opener and off-track repairs across the Tri-Cities, same day. <strong>Up the mountain, colder winter temperatures and heavy door use mean more broken springs; lower down, damp shaded garages rust cables.</strong> Either way we come with the parts and a written price agreed before we begin.`,
    detail: `<h2>Tri-Cities terrain, Tri-Cities doors</h2>
      <p>Burke Mountain and Westwood Plateau homes sit higher and colder, and cold is the enemy of an aging spring — brittle steel snaps on the first hard frost. The mature trees across Coquitlam also keep many garages shaded and damp, which is great for moss and terrible for steel rollers and cables. Newer Burke Mountain builds tend to have big insulated double doors that need correctly-sized springs.</p>
      <p>From Como Lake and Austin Heights to the top of the plateau, we'll re-balance, repair or replace and leave the door running quietly.</p>`,
    neigh: ["Burke Mountain", "Westwood Plateau", "Burquitlam", "Maillardville", "Austin Heights", "Como Lake", "Eagle Ridge", "River Springs"],
    faqs: [
      ["Do you cover Coquitlam and the Tri-Cities?", "Yes — Coquitlam including Burke Mountain and Westwood Plateau, plus neighbouring Port Coquitlam and Port Moody. Same-day service for most repairs; text us your area for a window."],
      ["Why do springs break in winter up on Burke Mountain?", "Higher-elevation neighbourhoods get colder, and cold makes worn spring steel brittle so it finally snaps — often on the first frosty morning. If your spring is several years old, a pre-winter inspection is cheap insurance."],
      ["My garage rollers are rusty and loud — can you help?", "Yes. Shaded, damp Coquitlam garages rust steel rollers quickly. We swap them for quiet sealed-nylon rollers and lubricate the system so the door runs smoothly again."],
    ],
  },
  "North Vancouver": {
    img: "/assets/img/city-north-vancouver.webp",
    intro: `On the North Shore, the rainforest climate is the headline. North Vancouver gets more rain than almost anywhere in Metro Vancouver, and that constant damp — plus steep, forested lots — is hard on garage doors. From Lower Lonsdale and the Quay up through Lynn Valley, Deep Cove and the British Properties' edge, we service springs, cables, openers and off-track doors across the North Shore, same day. <strong>Persistent moisture rusts cables and springs and swells wooden doors</strong>; we fix all of it and can fit corrosion-resistant, weather-ready hardware, with pricing agreed before we start.`,
    detail: `<h2>North Shore weather vs. your garage door</h2>
      <p>The District and City of North Vancouver sit right under the mountains, so they catch the heaviest coastal rain. That relentless moisture corrodes cables and spring wire and warps older wooden doors until they stick and drag. Steep Lynn Valley and Deep Cove driveways also mean a lot of homes rely on the garage as the main entrance, putting extra cycles on the hardware.</p>
      <p>We service everything from Lower Lonsdale townhomes to the larger homes up the slope, and we'll tell you honestly whether a swollen wooden door is worth re-hanging or ready for a weather-tight insulated replacement.</p>`,
    neigh: ["Lower Lonsdale", "Lynn Valley", "Deep Cove", "Lynnmour", "Edgemont Village", "Capilano", "Pemberton Heights", "Seymour"],
    faqs: [
      ["Do you serve all of North Vancouver?", "Yes — both the City and District of North Vancouver, from Lower Lonsdale and Lynn Valley to Deep Cove, Edgemont and Seymour. Same-day service for most repairs across the North Shore."],
      ["The rain keeps rusting my garage door parts — what can I do?", "North Van's heavy rainfall is brutal on cables and springs. We fit higher-grade corrosion-resistant cables, keep things properly lubricated, and recommend an annual tune-up to catch rust before it causes a failure."],
      ["My wooden garage door sticks and drags — repair or replace?", "Damp North Shore air swells wooden doors over time. Sometimes re-balancing and new hardware fixes the drag; if the door's warped or rotting we'll quote a weather-tight insulated replacement and give you the honest math."],
    ],
  },
  "Port Coquitlam": {
    img: "/assets/img/city-port-coquitlam.webp",
    intro: `Port Coquitlam — PoCo to everyone who lives here — is a tight-knit Tri-Cities community of family homes, and family homes mean garage doors that get hammered every single day. From the flats near the Coquitlam and Pitt rivers up to the newer subdivisions around Citadel Heights, we handle spring, cable, opener and off-track repair across PoCo, same day. <strong>The river-valley damp and the daily-driver double doors here are a tough combo</strong>: moisture rusts cables and high-use springs wear out faster than the manufacturer's cycle rating suggests. You'll always get a written quote before we start.`,
    detail: `<h2>PoCo garage doors, PoCo problems</h2>
      <p>Port Coquitlam sits low in the Coquitlam River floodplain, so garages here see real humidity — and humidity is slow death for galvanized cables and spring wire. Add in that most PoCo homes use the garage as the everyday entrance, and you get springs reaching their cycle limit a few years early. The older homes around Central PoCo and Mary Hill often have heavier or wooden doors; the newer Citadel and Riverwood builds run big insulated double doors.</p>
      <p>From Lincoln Park to Birchland Manor, we'll re-balance, repair or replace and get your door running quietly again.</p>`,
    neigh: ["Central PoCo", "Citadel Heights", "Riverwood", "Mary Hill", "Lincoln Park", "Birchland Manor", "Oxford Heights", "Lower Mary Hill"],
    faqs: [
      ["Do you cover Port Coquitlam and the Tri-Cities?", "Yes — all of PoCo plus neighbouring Coquitlam and Port Moody. Same-day service for most repairs; text us your neighbourhood for a real arrival window."],
      ["Why do my garage cables rust so fast in PoCo?", "Port Coquitlam's low river-valley setting means more humidity, which corrodes thin galvanized cables and spring wire. We can fit higher-grade corrosion-resistant cables and recommend a yearly inspection to catch rust early."],
      ["My double door's spring broke after only a few years — why?", "If the garage is your main entrance, the door may cycle 6–8+ times a day, burning through a standard 10,000-cycle spring fast. We'll fit a matched pair or high-cycle springs rated to last much longer."],
    ],
  },
  "Port Moody": {
    img: "/assets/img/city-port-moody.webp",
    intro: `Port Moody wraps around the head of Burrard Inlet, and that means two things for garage doors: salty inlet air and a lot of newer townhome-and-garage complexes around Suter Brook and Newport Village, plus established homes up toward Heritage Mountain. We service springs, cables, openers and off-track doors across Port Moody, same day. <strong>The combination of coastal salt air and forested, shaded lots rusts hardware and stiffens rollers</strong> — classic Port Moody wear we fix every week, always with the price agreed up front.`,
    detail: `<h2>Inlet air and hillside homes</h2>
      <p>Being right on the saltwater inlet, Port Moody garages cop more corrosive air than inland neighbours, so we see frayed cables and surface-rusted springs sooner. The newer high-density developments at Suter Brook and Newport Village have lots of openers and lighter doors that just need sensor or logic-board fixes, while the larger Heritage Mountain and Heritage Woods homes up the slope run heavier insulated doors that need correctly-sized springs.</p>
      <p>From College Park to Pleasantside and Ioco, we'll get your door balanced, quiet and weather-ready.</p>`,
    neigh: ["Suter Brook", "Newport Village", "Heritage Mountain", "Heritage Woods", "College Park", "Pleasantside", "Ioco", "Glenayre"],
    faqs: [
      ["Do you serve Port Moody?", "Yes — all of Port Moody from Suter Brook and Newport Village to Heritage Mountain and Pleasantside, plus neighbouring Coquitlam and PoCo. Same-day for most repairs."],
      ["Does the inlet salt air really affect my garage door?", "It does. Saltwater air accelerates rust on cables, springs and steel rollers in Port Moody. We fit corrosion-resistant parts where it helps and recommend annual lubrication and inspection to extend their life."],
      ["Can you fix the opener in my townhouse garage?", "Yes — Port Moody has lots of townhome garages. We repair all opener brands and can install a quieter belt-drive or wall-mount unit if there's living space right above the garage."],
    ],
  },
  "New Westminster": {
    img: "/assets/img/city-new-westminster.webp",
    intro: `New West is the Lower Mainland's oldest city, and it shows in the garage doors: steep streets of heritage character homes above the Fraser, tight rear-lane garages, and a growing wave of new townhomes in Queensborough and along the waterfront. We service springs, cables, openers and off-track doors across New Westminster, same day. <strong>Heritage homes here often hide older single-spring setups, narrow tracks and original wooden doors</strong> that the river damp has swollen — exactly the kind of work we're set up for, with honest pricing on every visit.`,
    detail: `<h2>Old city, real character (and real quirks)</h2>
      <p>New Westminster's hilly heritage neighbourhoods — Queen's Park, Glenbrooke North, the West End — are full of older homes with detached lane garages, wooden doors, and extension-spring systems that predate modern torsion setups. Those need a careful, knowledgeable hand. Down on the flats, Queensborough and the waterfront have newer builds with standard insulated doors and myQ openers. The constant near-river humidity rusts cables across the whole city.</p>
      <p>From Sapperton to the Brow of the Hill, we repair the old and the new — and tell you honestly when a tired wooden door is worth saving.</p>`,
    neigh: ["Queen's Park", "Sapperton", "Glenbrooke North", "West End", "Queensborough", "Brow of the Hill", "Uptown", "Downtown / Quay"],
    faqs: [
      ["Do you work on older heritage homes in New West?", "All the time. Queen's Park and the West End are full of character homes with older spring and track setups and wooden lane garages. We service them, re-balance them, and quote a sympathetic replacement only if the door's truly past saving."],
      ["Can you fit a service van down a tight New West rear lane?", "Yes — we're used to New Westminster's narrow heritage lanes and detached garages. Tell us the access when you call and we'll come prepared."],
      ["Do you cover Queensborough too?", "We do — Queensborough, the Quay, Sapperton and all of New West. Same-day service for most repairs."],
    ],
  },
  "West Vancouver": {
    img: "/assets/img/city-west-vancouver.webp",
    intro: `West Vancouver's homes climb the North Shore mountains with ocean views — and they tend to be larger, higher-end properties with big, often custom garage doors. We service springs, cables, openers and off-track doors across West Van, same day, with the discretion and care these homes deserve. <strong>Heavy custom and double doors need properly-sized springs, and the British Properties' steep, forested, salt-and-rain-exposed lots are hard on cables and openers</strong> — all routine for us, and always quoted in writing before any work.`,
    detail: `<h2>Bigger doors, higher standards</h2>
      <p>From Ambleside and Dundarave near the seawall up to the British Properties and Caulfeild, West Vancouver homes often have larger, heavier, or architecturally custom garage doors — sometimes wood-clad — that demand correctly-engineered springs and well-tuned openers to run smoothly and quietly. The elevation brings more rain and the coast brings salt, so cables and hardware corrode; the long, steep driveways make a reliable battery-backup opener genuinely worth it during winter outages.</p>
      <p>We treat these homes (and their owners) with care, and we're precise about what we recommend — no overselling.</p>`,
    neigh: ["Ambleside", "Dundarave", "British Properties", "Caulfeild", "Horseshoe Bay", "Cypress Park", "Sentinel Hill", "Eagle Harbour"],
    faqs: [
      ["Do you service larger custom garage doors in West Vancouver?", "Yes. Many West Van homes have oversized, heavy or custom (often wood-clad) doors that need correctly-sized high-cycle springs and a properly-tuned opener. We engineer the spring set to the actual door weight, not a guess."],
      ["Is a battery-backup opener worth it on a steep West Van driveway?", "Usually yes. Winter storms knock out power on the North Shore, and you don't want to be stranded at the top or bottom of a long driveway. We fit belt-drive and wall-mount LiftMaster openers with integrated battery backup."],
      ["Do you cover the British Properties and Horseshoe Bay?", "Yes — all of West Vancouver from Ambleside and Dundarave to the British Properties, Caulfeild and Horseshoe Bay. Same-day for most repairs."],
    ],
  },
  "Delta": {
    img: "/assets/img/city-delta.webp",
    intro: `Delta spreads across the flat Fraser delta — Ladner, Tsawwassen and North Delta — with big skies, farmland edges and lots of single-family homes with double garages. We service springs, cables, openers and off-track doors throughout Delta, same day. <strong>Down here the wind off the water and the salt-laden coastal air are the enemy</strong>: Tsawwassen's seaside exposure especially rusts cables and springs, while North Delta's busy family homes simply wear their doors out with daily use. Honest, written pricing every time — no $19.99 bait.`,
    detail: `<h2>Flatlands, sea air, hard-working doors</h2>
      <p>Ladner's village homes and the newer riverside builds, Tsawwassen's seaside streets near the ferry and the beach, and North Delta's dense family neighbourhoods each bring their own wear. The closer to the water — especially in Tsawwassen — the faster salt air corrodes galvanized cables and spring wire. The exposed, windy delta also means doors take a beating, and cold snaps blowing across the flats make brittle old springs snap.</p>
      <p>From Ladner Village to Sunshine Hills, we'll repair, re-balance or replace and fit corrosion-resistant parts where the sea air demands it.</p>`,
    neigh: ["Ladner", "Tsawwassen", "North Delta", "Sunshine Hills", "Ladner Village", "Tsawwassen Heights", "Sunshine Woods", "Beach Grove"],
    faqs: [
      ["Do you serve all of Delta — Ladner, Tsawwassen and North Delta?", "Yes, the whole municipality: Ladner, Tsawwassen, North Delta and Sunshine Hills. Delta's spread out, so call or text your area and we'll confirm the soonest same-day window."],
      ["My Tsawwassen home is near the water — why do parts rust so fast?", "Tsawwassen's seaside exposure means salt-laden air that corrodes cables, springs and rollers faster than inland. We fit higher-grade corrosion-resistant cables and recommend a yearly tune-up to catch rust before it fails."],
      ["Do windy cold snaps really break springs out on the flats?", "They contribute — cold makes worn spring steel brittle, and a snap often comes on the first hard frost. If your spring is several years old, a quick pre-winter check is cheap insurance."],
    ],
  },
  "Langley": {
    img: "/assets/img/city-langley.webp",
    intro: `Langley — both the City and the Township — is where suburbia meets acreage, which means everything from compact townhome garages in Willoughby to big triple-car doors and farm-shop overhead doors out toward Aldergrove and Otter. We service springs, cables, openers and off-track doors across Langley, same day. <strong>The big, frequently-used doors on Langley's newer family homes wear springs early</strong>, and acreage properties often have larger or older doors that need real expertise. Always a written quote first.`,
    detail: `<h2>From Willoughby townhomes to Otter acreages</h2>
      <p>Langley's explosive growth in Willoughby and Walnut Grove means a lot of newer homes with big insulated double and triple doors reaching the end of their original springs and openers all at once. Out in the Township — Murrayville, Brookswood, Aldergrove, Otter — you'll find larger lots with heavier doors, detached shops and the occasional farm overhead door, all of which we're equipped to handle. The rural-edge dust and damp are tough on rollers and tracks.</p>
      <p>Whether it's a Fort Langley character home or a new Willoughby build, we'll size the springs right and tune the door to run smooth.</p>`,
    neigh: ["Willoughby", "Walnut Grove", "Murrayville", "Brookswood", "Fort Langley", "Aldergrove", "Otter District", "Langley City"],
    faqs: [
      ["Do you cover both Langley City and the Township?", "Yes — Willoughby, Walnut Grove, Murrayville, Brookswood, Fort Langley, Aldergrove and Langley City. It's a big area, so text us your location for the soonest window."],
      ["Can you handle triple-car and acreage shop doors?", "Absolutely. Langley has lots of triple-car garages and acreage shops with larger or overhead doors. We size springs to the real door weight and service larger openers built for the extra load."],
      ["My newer Willoughby home already needs spring work — normal?", "Common. Builder-grade springs on big double/triple doors that cycle many times a day can wear out in a few years. We'll fit a properly-sized matched pair or high-cycle springs that last far longer."],
    ],
  },
  "Maple Ridge": {
    img: "/assets/img/city-maple-ridge.webp",
    intro: `Maple Ridge backs onto the mountains and the Golden Ears, with a rugged mix of suburban subdivisions, rural acreages and plenty of detached shops. We service springs, cables, openers and off-track doors across Maple Ridge, same day. <strong>The wetter, forested foothills climate keeps garages damp and rusts hardware</strong>, while acreage properties out toward Albion and Whonnock often run larger or older doors that need genuine know-how. You'll always get an honest, written quote before any work begins.`,
    detail: `<h2>Mountain-town doors</h2>
      <p>Maple Ridge sits at the wet, forested edge of the valley, so garages here are damp and shaded — ideal conditions for rusting cables and seizing steel rollers. The town centre and newer Silver Valley and Albion builds have standard insulated double doors, while acreage homes toward Whonnock and Webster's Corners often have heavier or detached-shop doors. Cold mountain mornings are hard on aging springs, which tend to let go on the first frost.</p>
      <p>From Hammond to Silver Valley, we'll repair, re-balance or replace and fit weather-ready parts.</p>`,
    neigh: ["Town Centre", "Silver Valley", "Albion", "Hammond", "Whonnock", "Websters Corners", "Cottonwood", "Yennadon"],
    faqs: [
      ["Do you serve Maple Ridge and acreage properties?", "Yes — the town centre, Silver Valley, Albion, Hammond and rural areas toward Whonnock and Webster's Corners, including detached shop and acreage doors. Same-day for most repairs."],
      ["Why are my rollers rusty and loud in Maple Ridge?", "The damp, shaded foothills climate rusts steel rollers and dries out lubrication quickly. We swap to sealed nylon rollers and lubricate the system so the door runs quiet and smooth."],
      ["Do cold mountain mornings break springs?", "They're a common trigger — cold makes a worn spring brittle until it finally snaps, often on the first frosty day. A pre-winter inspection catches an aging spring before it strands your car."],
    ],
  },
  "Pitt Meadows": {
    img: "/assets/img/city-pitt-meadows.webp",
    intro: `Pitt Meadows is a flat, friendly farm town between the Pitt and Fraser rivers, framed by the Golden Ears — and its homes range from established neighbourhoods to the newer Bonson builds, plus working acreages with shop doors. We service springs, cables, openers and off-track doors across Pitt Meadows, same day. <strong>The low, river-bordered land keeps humidity high and rusts cables and springs</strong>, and the farm-and-family mix means doors that work hard. Upfront, written pricing every visit.`,
    detail: `<h2>Flat land, big sky, damp garages</h2>
      <p>Sitting low between two rivers, Pitt Meadows is one of the more humid pockets of the valley, so garage cables and spring wire corrode faster here. The newer Bonson and Osprey Village developments have standard insulated doors and myQ openers, while the North Meadows acreages often have larger doors and detached shops. Wind across the flats and cold snaps off the river both shorten the life of an aging spring.</p>
      <p>From the dike-trail neighbourhoods to the Golden Ears side of town, we'll get your door balanced, quiet and reliable.</p>`,
    neigh: ["Bonson", "Osprey Village", "North Meadows", "Central Meadows", "Mid Meadows", "South Bonson", "Sawmill", "Highland Park"],
    faqs: [
      ["Do you serve Pitt Meadows?", "Yes — from Bonson and Osprey Village to North Meadows acreages and Central Meadows. Same-day service for most repairs; text us your area for a window."],
      ["Why does my garage hardware rust quickly in Pitt Meadows?", "Pitt Meadows sits low between the Pitt and Fraser rivers, so humidity is high and it corrodes cables, springs and rollers faster. Corrosion-resistant cables plus an annual tune-up are the best defence."],
      ["Can you service acreage shop doors in North Meadows?", "Yes — we handle larger and detached-shop doors common on Pitt Meadows acreages, sizing springs and openers to the real door weight."],
    ],
  },
  "White Rock": {
    img: "/assets/img/city-white-rock.webp",
    intro: `White Rock is a seaside town built on a south-facing slope above Semiahmoo Bay — sunny, breezy, and right on the salt water. We service springs, cables, openers and off-track doors across White Rock and the surrounding Semiahmoo Peninsula, same day. <strong>Nowhere in Metro Vancouver is harder on garage-door hardware than a home this close to the ocean</strong>: salt air rusts cables and springs fast, and the steep streets mean garages that take real daily use. We bring corrosion-resistant parts and an honest, written quote every time.`,
    detail: `<h2>Sea air is brutal on steel</h2>
      <p>White Rock's charm — that beachfront, south-slope, ocean-breeze setting — is exactly what corrodes garage-door cables, springs and steel rollers faster than almost anywhere else in the region. Older bungalows up the hill often have aging spring and track setups, while the newer homes and the South Surrey/Semiahmoo edge run standard insulated doors. The steep streets also mean openers and springs that work hard every day.</p>
      <p>From East Beach and the pier up to the uptown ridge, we fit corrosion-resistant cables and tell you honestly how much life the salt has left in the rest of the system.</p>`,
    neigh: ["East Beach", "West Beach", "Uptown White Rock", "Hillside", "Semiahmoo", "Five Corners", "Marine Drive", "Centennial"],
    faqs: [
      ["Do you serve White Rock and the Semiahmoo Peninsula?", "Yes — White Rock and the surrounding South Surrey/Semiahmoo area. Same-day service for most repairs; text us your street for a real arrival window."],
      ["My cables and springs rust really fast near the beach — why?", "White Rock is right on the salt water, and salt air is the single hardest thing on galvanized cables and spring wire. We fit higher-grade corrosion-resistant cables and recommend a yearly inspection to stay ahead of it."],
      ["Do you work on older White Rock bungalows?", "Yes — the older hillside bungalows often have aging spring and track systems and sometimes wooden doors. We service them, re-balance them, and quote a replacement only if the salt and age have truly won."],
    ],
  },
};

function cityPage(name) {
  const c = cityData[name];
  const slug = citySlug(name);
  const path = "/service-areas/" + slug + ".html";
  const title = `Garage Door Repair ${name} | Same-Day | Sketchy`;
  const desc = `Same-day garage door repair in ${name}, BC — springs, cables, openers, off-track & new doors. Upfront pricing, licensed, insured & guaranteed.`;
  const crumbs = `<a href="/">Home</a> / <a href="/service-areas/">Service Areas</a> / <span style="color:#fff">${name}</span>`;
  const nearby = CITIES.filter((x) => x !== name);
  const serviceLd = {
    "@context": "https://schema.org", "@type": "Service", serviceType: "Garage Door Repair",
    name: `Garage Door Repair ${name}`, provider: { "@id": `${DOMAIN}/#business` },
    areaServed: { "@type": "City", name }, description: desc,
  };
  const body = `${pagehead({ h1: `Garage Door Repair in ${name}`, sub: `Fast, honest garage-door repair across ${name} — springs, cables, openers, off-track doors and new installations. Same-day service, upfront pricing, fully guaranteed.`, img: c.img, alt: `Sketchy Garage Doors van in ${name}, BC`, crumbs })}
${assuranceStrip()}
<section class="section">
  <div class="container" style="max-width:780px">
    <div data-reveal>
      <span class="eyebrow">${I.pin} ${name}, BC</span>
      <h2>Your ${name} garage-door crew</h2>
      <p class="lead">${c.intro}</p>
    </div>
    <div class="prose" data-reveal style="margin-top:1.5rem">${c.detail}</div>
    <div data-reveal style="margin-top:1.5rem">
      <h3>Neighbourhoods we cover in ${name}</h3>
      <ul class="coverage-list">${c.neigh.map((n) => `<li><span>${n}</span></li>`).join("")}</ul>
    </div>
    <div style="display:flex;gap:.7rem;flex-wrap:wrap;margin-top:1.8rem">${callBtn()} ${textBtn("btn btn--ghost")}</div>
  </div>
</section>
<section class="section section--soft">
  <div class="container">
    <div class="center" data-reveal><span class="eyebrow">What we fix in ${name}</span><h2>Every garage-door service</h2></div>
    <div class="grid grid--3" data-stagger style="margin-top:2rem">
      ${SERVICES_NAV.slice(0, 6).map(([h, t]) => imgCard({ img: SERVICE_IMG[h], alt: `${t} in ${name}, BC`, title: t, desc: `Professional ${t.toLowerCase()} across ${name} and the surrounding area.`, href: h, link: "Learn more" })).join("\n      ")}
    </div>
  </div>
</section>
${faqSection(c.faqs, `Garage door FAQs — ${name}`)}
<section class="section">
  <div class="container center" data-reveal>
    <span class="eyebrow">Nearby</span>
    <h2>We also serve</h2>
    <div class="coverage-list" style="justify-content:center">${nearby.map((n) => `<li><a href="/service-areas/${citySlug(n)}.html">${n}</a></li>`).join("")}<li><a href="/service-areas/">All areas →</a></li></div>
  </div>
</section>
${ctaBand(`Need a garage door fixed in ${name} today?`)}`;
  out(path, layout({
    path, title, desc, body, ogImg: c.img, preload: heroPreload(c.img),
    jsonld: [serviceLd, breadcrumb([["Home", "/"], ["Service Areas", "/service-areas/"], [name, path]]), faqNode(c.faqs)],
  }));
}

/* =====================================================================
   HOME
   ===================================================================== */
function home() {
  const homeFaqs = [
    ["Wait — is the name a joke?", "Mostly. \"Sketchy\" is a wink at how easy it is to get burned by garage-door companies — the $19.99 ads, the mystery fees, the unmarked vans. We named ourselves after the thing you're worried about, then built the opposite: upfront written pricing, a marked van, licensed and insured techs, and a workmanship guarantee. Sketchy name. Spotless work."],
    ["How much does a typical garage door repair cost?", `It depends on the problem, but we post real ranges so there are no surprises: spring repair ${cfg.serviceRanges.spring}, opener repairs ${cfg.serviceRanges.opener.split(" · ")[0].toLowerCase()}, cable repair ${cfg.serviceRanges.cable}, off-track and rollers ${cfg.serviceRanges.offtrack}. You always get a written quote before we start. No $19.99 bait pricing.`],
    ["Do you really offer same-day service?", "For most repairs across Greater Vancouver, yes — broken springs and stuck doors are our priority calls and we carry the common parts on the van. Call or text early and we'll give you a real arrival window, not a vague all-day promise."],
    ["Are you licensed and insured?", "Yes. Garage-door work is an unregulated trade in BC (there is no provincial trade licence), so we're precise about what \"licensed\" means: we hold a municipal business licence, carry commercial liability insurance, and are WorkSafeBC-covered. We'll never imply a trade certificate that doesn't exist."],
    ["What areas do you serve?", "All of Greater Vancouver. We have dedicated local pages for 15 cities — Vancouver, Burnaby, Surrey, Richmond, Coquitlam, North Vancouver, Port Coquitlam, Port Moody, New Westminster, West Vancouver, Delta, Langley, Maple Ridge, Pitt Meadows and White Rock — plus the smaller communities in between (Tsawwassen, Ladner, Anmore, Belcarra, Lions Bay)."],
    ["How do I avoid getting scammed on a garage door repair?", "Watch for too-good-to-be-true ad pricing, no written estimate, pressure to replace everything at once, unmarked vehicles, and cash-only demands. Insist on a written quote before work starts and a company that's insured and WorkSafeBC-covered. (That's the whole reason we exist.)"],
  ];
  const serviceCards = [
    ["spring", I.coil, "Broken spring repair", "The #1 emergency. Same-day torsion & extension spring replacement from $189.", "/garage-door-spring-repair.html"],
    ["opener", I.gear, "Opener repair & install", "Won't open, reversing, or beeping? Repairs from $129; new LiftMaster myQ from $399.", "/garage-door-opener-repair-installation.html"],
    ["cable", I.coil, "Cable repair", "Frayed or snapped cable, door hanging crooked? Fixed safely from $159.", "/garage-door-cable-repair.html"],
    ["offtrack", I.track, "Off-track & rollers", "Door jammed, leaning or grinding? We re-rail it and fit quiet rollers from $149.", "/garage-door-off-track-roller-repair.html"],
    ["newdoor", I.door, "New garage doors", "Insulated steel, modern glass & carriage doors installed from $1,290.", "/new-garage-door-installation.html"],
    ["maintenance", I.wrench, "Maintenance & tune-up", "Flat $129 tune-up — balance, lube, safety check. Stop problems before they snap.", "/garage-door-maintenance-tune-up.html"],
    ["emergency", I.bolt, "Emergency repair", "Door stuck open or car trapped? Fast same-day help with honest after-hours rates.", "/emergency-garage-door-repair.html"],
  ];
  const body = `<section class="hero">
  <div class="hero__glow" aria-hidden="true"></div>
  <div class="container hero__inner">
    <div class="hero__copy">
      <span class="eyebrow">Greater Vancouver garage-door repair</span>
      <h1>Sketchy name. <span class="hl">Spotless work.</span></h1>
      <p>The only sketchy thing here is the name. Same-day spring, opener, cable &amp; off-track repair across Metro Vancouver — with upfront written pricing and a fix-it-right guarantee.</p>
      <div class="hero__cta">
        ${callBtn("btn btn--primary btn--lg cta-pulse")}
        ${textBtn("btn btn--on-dark btn--lg")}
      </div>
      <div class="hero__micro">
        <span><span class="dot"></span>Licensed (business licence) · Insured · WorkSafeBC</span>
        <span><span class="dot"></span>Same-day service</span>
        <span><span class="dot"></span>No $19.99 bait</span>
      </div>
    </div>
    <div class="hero__media">
      <div class="frame">
        <picture>
          <source media="(max-width: 768px)" srcset="/assets/img/home-hero-mobile-960.webp 960w, /assets/img/home-hero-mobile-480.webp 480w" sizes="100vw">
          <source media="(min-width: 769px)" srcset="/assets/img/home-hero-desktop.webp 1024w, /assets/img/home-hero-desktop-960.webp 960w" sizes="50vw">
          <img src="/assets/img/home-hero-desktop-960.webp" width="1024" height="900" alt="Sketchy Garage Doors technician beside the branded van at a Vancouver home with an open garage door" fetchpriority="high">
        </picture>
      </div>
      <div class="hero__badge">“A genuinely good company with a genuinely bad name.”</div>
    </div>
  </div>
</section>
${assuranceStrip()}

<section class="section" id="services">
  <div class="container">
    <div class="center" data-reveal style="max-width:680px;margin-inline:auto">
      <span class="eyebrow">What we fix</span>
      <h2>Garage-door repair &amp; installation, done right</h2>
      <p class="lead mx-auto">A broken spring is no laughing matter (the name is). Whatever your door is doing, we fix it fast — and stand behind it.</p>
    </div>
    <div class="grid grid--3" data-stagger style="margin-top:2.4rem">
      ${serviceCards.map(([k, ic, t, d, h]) => imgCard({ img: SERVICE_IMG[h], alt: `${t} — Sketchy Garage Doors technician at work in Metro Vancouver`, title: t, desc: d, href: h, link: "See " + t.toLowerCase() })).join("\n      ")}
    </div>
  </div>
</section>

<section class="section section--dark">
  <div class="container">
    <div class="split">
      <div data-reveal>
        <span class="eyebrow">Price transparency</span>
        <h2>Honest pricing. No $19.99 bait, no mystery fees.</h2>
        <p>The garage-door trade is full of too-good-to-be-true ads that turn into a $600 invoice once the tech is in your driveway. We do the opposite: real ranges posted on the site, and a written quote you approve before we touch a thing.</p>
        <ul class="checks">
          <li>${I.check}<span>Spring repair <strong style="color:#fff">${cfg.serviceRanges.spring}</strong> — single to high-cycle</span></li>
          <li>${I.check}<span>Opener repair <strong style="color:#fff">${cfg.serviceRanges.opener.split(" · ")[0]}</strong>; new from $399 installed</span></li>
          <li>${I.check}<span>Cable repair <strong style="color:#fff">${cfg.serviceRanges.cable}</strong> · Off-track <strong style="color:#fff">${cfg.serviceRanges.offtrack}</strong></span></li>
          <li>${I.check}<span>Free safety inspection with every spring job</span></li>
        </ul>
        <div style="margin-top:1.4rem">${callBtn()} <a class="btn btn--on-dark" href="/garage-door-spring-repair.html">See spring pricing</a></div>
      </div>
      <div class="split__media zoom-frame" data-reveal="right">
        <img src="/assets/img/svc-spring.webp" width="1024" height="1024" loading="lazy" decoding="async" alt="Technician replacing a broken garage door torsion spring in a Metro Vancouver garage">
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container split">
    <div class="split__media zoom-frame" data-reveal="left">
      <img src="/assets/img/about.webp" width="1024" height="1024" loading="lazy" decoding="async" alt="Two Sketchy Garage Doors technicians beside their branded van in Metro Vancouver">
    </div>
    <div data-reveal="right">
      <span class="eyebrow">Why trust a company called Sketchy?</span>
      <h2>Because we named ourselves after the problem — then fixed it.</h2>
      <p>Canadian-owned and run by techs who got tired of watching neighbours get burned by the $19.99-ad crowd. The name's a joke; the credentials aren't. We're business-licensed, fully insured, and WorkSafeBC-covered, we drive a marked van, and we put every price in writing first.</p>
      <ul class="checks">
        <li>${I.check}<span><strong>No fake reviews.</strong> We'd rather earn real ones than invent a wall of five stars.</span></li>
        <li>${I.check}<span><strong>Written quote first.</strong> You approve the number before we start — always.</span></li>
        <li>${I.check}<span><strong>Fixed right or we come back free.</strong> That part is not a joke.</span></li>
      </ul>
      <a class="btn btn--dark" href="/about.html" style="margin-top:1rem">More about us ${I.arrow}</a>
    </div>
  </div>
</section>

<section class="section section--soft">
  <div class="container">
    <div class="center" data-reveal><span class="eyebrow">Risk reversal</span><h2>Our promise, in writing</h2><p class="lead mx-auto">Three guarantees that make a "sketchy" name the safest call you'll make.</p></div>
    <div class="grid grid--3" data-stagger style="margin-top:2rem">
      ${imgCard({ img: "/assets/img/trust-pricing.webp", alt: "Upfront written quote on a clipboard before work begins", title: "Upfront written quote", desc: `You see and approve the full price before any work begins. No bait, no surprises, no "while we were in there."` })}
      ${imgCard({ img: "/assets/img/trust-licensed.webp", alt: "Business-licensed, insured, WorkSafeBC-covered technician", title: "Licensed &amp; insured", desc: "Municipal business licence, commercial liability insurance, and WorkSafeBC coverage. You're protected." })}
      ${imgCard({ img: "/assets/img/trust-guarantee.webp", alt: "Workmanship guarantee — we come back free if it's not right", title: "Workmanship guarantee", desc: "Quality parts and a warranty on our labour. If the fix isn't right, we come back and make it right — free." })}
    </div>
  </div>
</section>

<section class="section section--dark">
  <div class="container">
    <div class="center" data-reveal style="max-width:680px;margin-inline:auto"><span class="eyebrow">${I.pin} Where we work</span><h2>Serving all of Greater Vancouver</h2><p class="lead mx-auto">One crew, the whole Lower Mainland. Pick your city for local detail and same-day service.</p></div>
    <ul class="coverage-list" data-stagger style="justify-content:center;margin-top:2rem">
      ${CITIES.map((c) => `<li><a href="/service-areas/${citySlug(c)}.html">${c}</a></li>`).join("")}
    </ul>
    <p class="center" style="margin-top:1.2rem;color:rgba(255,255,255,.7)">Plus the smaller communities in between: ${EXTRA_AREAS.join(" · ")}.</p>
  </div>
</section>

${faqSection(homeFaqs, "Your questions, answered straight")}
${ctaBand("The name's the only sketchy thing. Let's fix your door.")}`;

  const homePreload = `<link rel="preload" as="image" media="(min-width:769px)" href="/assets/img/home-hero-desktop-960.webp" imagesrcset="/assets/img/home-hero-desktop-960.webp 960w, /assets/img/home-hero-desktop.webp 1024w" imagesizes="50vw" fetchpriority="high">
<link rel="preload" as="image" media="(max-width:768px)" href="/assets/img/home-hero-mobile-480.webp" imagesrcset="/assets/img/home-hero-mobile-480.webp 480w, /assets/img/home-hero-mobile-960.webp 960w" imagesizes="100vw" fetchpriority="high">`;
  out("index.html", layout({
    path: "/", title: "Sketchy Garage Doors | Repair Across Greater Vancouver",
    desc: "Sketchy name, spotless work. Same-day garage door repair across Greater Vancouver — springs, openers, cables, off-track & new doors. Upfront, guaranteed.",
    body, preload: homePreload, jsonld: [faqNode(homeFaqs)],
  }));
}

/* =====================================================================
   SERVICES HUB
   ===================================================================== */
function servicesHub() {
  const cards = [
    [I.coil, "Spring repair", services.spring.desc.split(".")[0] + ".", "/garage-door-spring-repair.html", cfg.serviceRanges.spring],
    [I.gear, "Opener repair & installation", "Repair or replace any opener; new LiftMaster myQ openers installed.", "/garage-door-opener-repair-installation.html", cfg.serviceRanges.opener],
    [I.coil, "Cable repair", "Frayed or snapped cables replaced safely as a balanced pair.", "/garage-door-cable-repair.html", cfg.serviceRanges.cable],
    [I.track, "Off-track & roller repair", "Re-rail jammed doors and fit quiet, long-life nylon rollers.", "/garage-door-off-track-roller-repair.html", cfg.serviceRanges.offtrack],
    [I.door, "New garage door installation", "Insulated steel, aluminium-glass and carriage doors, supplied & fitted.", "/new-garage-door-installation.html", cfg.serviceRanges.newdoor],
    [I.wrench, "Maintenance & tune-up", "Annual flat-rate service to keep the door quiet, balanced and safe.", "/garage-door-maintenance-tune-up.html", cfg.serviceRanges.maintenance],
    [I.bolt, "Emergency repair", "Fast same-day help when the door won't open or close.", "/emergency-garage-door-repair.html", cfg.serviceRanges.emergency],
  ];
  const body = `${pagehead({ h1: "Garage-Door Services Across Greater Vancouver", sub: "Everything we fix and install — springs, openers, cables, off-track doors, new doors, tune-ups and emergencies — all with upfront pricing and a workmanship guarantee.", img: "/assets/img/svc-opener.webp", alt: "Sketchy Garage Doors technician installing an opener", crumbs: `<a href="/">Home</a> / <span style="color:#fff">Services</span>` })}
${assuranceStrip()}
<section class="section">
  <div class="container">
    <div class="grid grid--3" data-stagger>
      ${cards.map(([ic, t, d, h, r]) => imgCard({ img: SERVICE_IMG[h], alt: `${t} in Greater Vancouver`, title: t, desc: d, href: h, link: "Learn more", badge: r })).join("\n      ")}
    </div>
  </div>
</section>
${ctaBand()}`;
  out("services.html", layout({
    path: "/services.html", title: "Garage Door Services Greater Vancouver | Sketchy",
    desc: "Every Sketchy service across Greater Vancouver: spring, opener, cable, off-track & roller repair, new doors, tune-ups & emergency. Upfront pricing.",
    body, preload: heroPreload("/assets/img/svc-opener.webp"), jsonld: [breadcrumb([["Home", "/"], ["Services", "/services.html"]])],
  }));
}

/* =====================================================================
   SERVICE AREAS HUB
   ===================================================================== */
function areasHub() {
  const body = `${pagehead({ h1: "Garage-Door Service Areas — Greater Vancouver", sub: "We cover the whole Lower Mainland with same-day garage-door repair. Choose your city for local detail, common issues and same-day service.", img: "/assets/img/city-vancouver.webp", alt: "Sketchy Garage Doors van on a Vancouver street", crumbs: `<a href="/">Home</a> / <span style="color:#fff">Service Areas</span>` })}
${assuranceStrip()}
<section class="section">
  <div class="container">
    <div class="center" data-reveal style="max-width:680px;margin-inline:auto"><span class="eyebrow">Priority cities</span><h2>Pick your city</h2><p class="lead mx-auto">Each page covers the neighbourhoods we serve, the local garage-door issues we see, and how fast we can reach you.</p></div>
    <div class="grid grid--3" data-stagger style="margin-top:2rem">
      ${CITIES.map((c) => imgCard({ img: cityData[c].img, alt: `Sketchy Garage Doors van in ${c}, BC`, title: c, desc: cityData[c].intro.replace(/<[^>]+>/g, "").split(". ")[0] + ".", href: "/service-areas/" + citySlug(c) + ".html", link: `${c} garage-door repair` })).join("\n      ")}
    </div>
    <div class="center" data-reveal style="margin-top:2.5rem">
      <h3>Also serving</h3>
      <ul class="coverage-list" style="justify-content:center">${EXTRA_AREAS.map((c) => `<li><span>${c}</span></li>`).join("")}</ul>
      <p style="margin-top:1rem;color:var(--ink-soft)">Not sure if we reach you? ${callBtn("btn btn--ghost").replace('class="btn btn--ghost"', 'class="btn btn--ghost" style="margin-top:.5rem"')}</p>
    </div>
  </div>
</section>
${ctaBand()}`;
  out("service-areas/index.html", layout({
    path: "/service-areas/", title: "Garage Door Repair Service Areas | Greater Vancouver",
    desc: "Sketchy Garage Doors serves all of Greater Vancouver — Vancouver, Burnaby, Surrey, Richmond, Coquitlam, North Van & more. Same-day, upfront pricing.",
    body, preload: heroPreload("/assets/img/city-vancouver.webp"), jsonld: [breadcrumb([["Home", "/"], ["Service Areas", "/service-areas/"]])],
  }));
}

/* =====================================================================
   ABOUT / CONTACT / FAQ / PARTNER / THANK-YOU / LEGAL / 404
   ===================================================================== */
function about() {
  const body = `${pagehead({ h1: "A genuinely good company with a genuinely bad name", sub: "We named ourselves Sketchy because that's exactly how the garage-door trade can feel. Then we built the opposite.", img: "/assets/img/about.webp", alt: "Sketchy Garage Doors technicians and van in Metro Vancouver", crumbs: `<a href="/">Home</a> / <span style="color:#fff">About</span>` })}
${assuranceStrip()}
<section class="section">
  <div class="container" style="max-width:780px">
    <div class="prose" data-reveal>
      <span class="eyebrow">Our story</span>
      <h2>Sketchy name. Spotless work.</h2>
      <p>If you've ever Googled "garage door repair near me," you know the feeling: pages of $19.99 ads, identical "trusted, same-day, licensed & insured" copy, and a quiet worry that whoever shows up will quote one number on the phone and a much bigger one in your driveway. The BBB and industry groups warn about it constantly — fake company names, bait pricing, no written estimates, unmarked vans.</p>
      <p>We're Canadian-owned and run by garage-door techs who got tired of watching neighbours get burned. So we did something a little contrarian: we named the company after the thing you're afraid of — <strong>Sketchy</strong> — and then made it impossible for us to actually be sketchy. Marked van. Written quotes. Real licensing. A guarantee with teeth.</p>
      <h2>What "licensed &amp; insured" actually means (we're precise about it)</h2>
      <p>Here's a bit of honesty most companies skip: garage-door technician is an <strong>unregulated trade in British Columbia</strong> — there is no provincial trade licence or certificate for it. So when a competitor says "licensed," it can't mean a trade ticket, because none exists. We tell you exactly what ours means:</p>
      <ul>
        <li><strong>Licensed</strong> — we hold a municipal business licence to operate.</li>
        <li><strong>Insured</strong> — we carry commercial general liability insurance.</li>
        <li><strong>WorkSafeBC-covered</strong> — our work is covered, so you're not on the hook if something goes wrong on your property.</li>
      </ul>
      <p>We'll never imply an official trade certification that doesn't exist. That precision is the whole point of a company called Sketchy.</p>
      <h2>How we work</h2>
      <p>Call or text, tell us what the door's doing (a photo helps), and we'll give you a real arrival window — same day for most repairs. On site, we diagnose, explain the options in plain language, and put the price <em>in writing</em> before we start. You approve it; then we fix it. Quality parts, balanced door, tidy garage, and a workmanship guarantee when we leave.</p>
      <div class="note-box" data-reveal style="margin-top:1.5rem"><strong>The honest bit about reviews:</strong> we're a newer brand, so we're not going to paper this page with a wall of suspiciously perfect five-star quotes. We'd rather earn real reviews on Google than invent fake ones — which, frankly, is also the least "sketchy" thing we could do.</div>
      <div style="display:flex;gap:.7rem;flex-wrap:wrap;margin-top:1.8rem">${callBtn()} ${textBtn("btn btn--ghost")}</div>
    </div>
  </div>
</section>
${ctaBand()}`;
  out("about.html", layout({
    path: "/about.html", title: "About Sketchy Garage Doors | Greater Vancouver",
    desc: "Canadian-owned, licensed, insured & WorkSafeBC-covered garage-door techs across Greater Vancouver. We named ourselves Sketchy, then built the opposite.",
    body, ogImg: "/assets/img/about.webp", preload: heroPreload("/assets/img/about.webp"), jsonld: [breadcrumb([["Home", "/"], ["About", "/about.html"]])],
  }));
}

function contactForm(kind, opts = {}) {
  const isPartner = kind === "partner";
  return `<form class="form" method="post" action="/form-handler.php" data-ajax>
    <input type="hidden" name="kind" value="${kind}">
    <input type="hidden" name="source_page" value="${opts.source || ""}">
    <div class="form__hp" aria-hidden="true"><label>Company URL<input type="text" name="company_url" tabindex="-1" autocomplete="off"></label></div>
    <div class="row">
      <div class="field"><label for="f-name">Your name *</label><input id="f-name" name="name" required autocomplete="name"></div>
      <div class="field"><label for="f-phone">Phone *</label><input id="f-phone" name="phone" type="tel" required autocomplete="tel"></div>
    </div>
    <div class="row">
      <div class="field"><label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email"></div>
      ${isPartner
      ? `<div class="field"><label for="f-company">Company</label><input id="f-company" name="company" autocomplete="organization"></div>`
      : `<div class="field"><label for="f-service">What's going on?</label><select id="f-service" name="service">
          <option value="">Choose a service…</option>
          <option>Broken spring</option><option>Opener repair / install</option><option>Cable repair</option>
          <option>Off-track / rollers</option><option>New garage door</option><option>Maintenance / tune-up</option>
          <option>Emergency — door stuck</option><option>Something else</option></select></div>`}
    </div>
    ${isPartner ? `<div class="row">
      <div class="field"><label for="f-trade">Trade / service</label><input id="f-trade" name="service" placeholder="e.g. door installer, handyman, electrician"></div>
      <div class="field"><label for="f-area">Service area</label><input id="f-area" name="service_area" placeholder="e.g. Surrey + Langley"></div>
    </div>` : `<div class="field"><label for="f-city">Your city / area</label><input id="f-city" name="service_area" placeholder="e.g. East Vancouver"></div>`}
    <div class="field"><label for="f-msg">${isPartner ? "Capacity & notes" : "Anything else? (a photo by text helps too)"}</label><textarea id="f-msg" name="message" placeholder="${isPartner ? "Crew size, how many overflow jobs/week you can take, licensing/insurance…" : "Tell us what the door is doing…"}"></textarea></div>
    <button class="btn btn--primary btn--lg" type="submit">${isPartner ? "Apply to partner" : "Send my request"}</button>
    <p class="form__note">${isPartner ? "We review every application and reply by email." : "We'll reply fast — usually same day. Prefer to talk now? Call or text " + TEL_DISPLAY + "."} No spam, ever.</p>
  </form>`;
}

function contact() {
  const body = `${pagehead({ h1: "Contact Sketchy Garage Doors", sub: "Call, text, or send the form. Fastest help is always a phone call — we answer fast and most repairs are same-day across Greater Vancouver.", img: "/assets/img/contact.webp", alt: "Sketchy Garage Doors van ready for a call-out in Metro Vancouver", crumbs: `<a href="/">Home</a> / <span style="color:#fff">Contact</span>` })}
<section class="section">
  <div class="container split">
    <div data-reveal>
      <span class="eyebrow">Get in touch</span>
      <h2>The fastest fix starts with a call</h2>
      <p class="lead">A garage door is heavy and often urgent — so call or text and talk to a real person. Snap a photo of the problem and text it over; it helps us bring the right parts the first time.</p>
      <ul class="checks" style="margin-top:1.2rem">
        <li>${I.phone}<span><strong>Call:</strong> <a href="tel:${TEL}">${TEL_DISPLAY}</a></span></li>
        <li>${I.chat}<span><strong>Text:</strong> <a href="sms:${TEL}?&body=${SMS_BODY}">${TEL_DISPLAY}</a> (photos welcome)</span></li>
        <li>${I.mail}<span><strong>Email:</strong> <a href="mailto:${EMAIL}">${EMAIL}</a></span></li>
        <li>${I.clock}<span><strong>Hours:</strong> ${cfg.hoursDisplay}</span></li>
        <li>${I.pin}<span><strong>Serving:</strong> All of Greater Vancouver, BC</span></li>
      </ul>
      <div style="margin-top:1.5rem">${callBtn("btn btn--primary btn--lg cta-pulse")}</div>
    </div>
    <div class="card" data-reveal="right">
      <h3>Request a free quote</h3>
      <p style="font-size:.95rem">Tell us what's going on and we'll get right back to you with a real answer — and a written price before any work.</p>
      ${contactForm("contact", { source: "/contact.html" })}
    </div>
  </div>
</section>
${ctaBand()}`;
  out("contact.html", layout({
    path: "/contact.html", title: "Contact Sketchy Garage Doors | Greater Vancouver",
    desc: `Call or text Sketchy Garage Doors at ${TEL_DISPLAY} for same-day garage door repair across Greater Vancouver. Upfront written pricing, free quotes.`,
    body, ogImg: "/assets/img/contact.webp", preload: heroPreload("/assets/img/contact.webp"), jsonld: [breadcrumb([["Home", "/"], ["Contact", "/contact.html"]])],
  }));
}

function faqPage() {
  const faqs = [
    ["Is the name actually a joke?", "Yes — and it's the only joke. \"Sketchy\" pokes fun at how easy it is to get burned by garage-door companies. Everything else is dead serious: business-licensed, insured, WorkSafeBC-covered, written quotes, and a workmanship guarantee. Sketchy name, spotless work."],
    ["How much does garage door repair cost in Greater Vancouver?", `We post real ranges so there are no surprises. Spring repair ${cfg.serviceRanges.spring}; opener repairs ${cfg.serviceRanges.opener.split(" · ")[0].toLowerCase()} with new openers from $399 installed; cable repair ${cfg.serviceRanges.cable}; off-track and rollers ${cfg.serviceRanges.offtrack}; a flat $129 tune-up; new doors from $1,290 installed. You always get a written quote first.`],
    ["Do you offer same-day garage door repair?", "For most repairs across Greater Vancouver, yes. Broken springs, snapped cables and stuck doors are priority calls, and we carry the common parts on the van. Call or text early for the best same-day window."],
    ["Are you licensed and insured in BC?", "Yes, and we're precise about it: garage-door work is an unregulated trade in BC (no provincial trade licence exists), so \"licensed\" means we hold a municipal business licence. We also carry commercial liability insurance and are WorkSafeBC-covered. We never imply a trade certificate that doesn't exist."],
    ["Why do garage door springs break?", "Springs are rated for a set number of open/close cycles (about 10,000 for standard springs — roughly 7 years at average use). Age, rust from our damp coastal air, and cold snaps that make the steel brittle all bring that day forward. When one breaks, the door becomes too heavy to lift safely."],
    ["Should I repair or replace my garage door?", "If the door is structurally sound and just has a broken spring, cable, opener or roller, repair is far cheaper and we'll do exactly that. If panels are rusted or cracked, the door is badly warped, or repairs are stacking up, we'll give you the honest math on a new insulated door."],
    ["How can I tell a garage door company isn't a scam?", "Red flags: too-good-to-be-true ad pricing, no written estimate, high-pressure \"replace everything now\" tactics, unmarked vehicles, and cash-only demands. Green flags: a marked van, a written quote before work, and a company that's insured and WorkSafeBC-covered. (Building the green-flag version is literally why we exist.)"],
    ["Is it safe to fix a garage door spring or cable myself?", "Springs and loaded cables hold a lot of stored energy and cause serious injuries every year. This is the one job we'd genuinely tell you not to DIY. Other things — lubricating rollers, tightening hardware, cleaning the safety sensors — are fine for a careful homeowner."],
    ["What garage door brands and openers do you work on?", "We repair all major door and opener brands (LiftMaster, Chamberlain, Genie, Craftsman, Marantec and more). For new openers we install LiftMaster myQ models for the app control, battery-backup options and parts availability in BC."],
    ["What areas do you serve?", "All of Greater Vancouver. We have dedicated pages for Vancouver, Burnaby, Surrey, Richmond, Coquitlam and North Vancouver, and we also serve Port Coquitlam, Port Moody, New Westminster, West Vancouver, Delta, Langley, Maple Ridge, Pitt Meadows and White Rock."],
    ["Do you charge for a quote?", "No — quotes are free, and we put the number in writing before any work begins. For repairs we diagnose on site; for new doors we measure and give you an all-in price."],
    ["What if the repair doesn't hold?", "We back our work with a workmanship guarantee. If something we fixed isn't right, we come back and make it right — free. That part is not a joke."],
  ];
  const body = `${pagehead({ h1: "Garage Door FAQs", sub: "Straight answers about pricing, timing, safety, scams — and yes, the name. No fluff.", img: "/assets/img/faq.webp", alt: "Technician explaining a garage door repair to a homeowner in Metro Vancouver", crumbs: `<a href="/">Home</a> / <span style="color:#fff">FAQ</span>` })}
${faqSection(faqs, "Everything people ask us")}
${ctaBand()}`;
  out("faq.html", layout({
    path: "/faq.html", title: "Garage Door FAQ — Cost, Timing & Safety | Sketchy",
    desc: "Honest answers on garage door repair costs, same-day timing, BC licensing, broken springs, scam red flags and repair-vs-replace in Greater Vancouver.",
    body, ogImg: "/assets/img/faq.webp", preload: heroPreload("/assets/img/faq.webp"), jsonld: [faqNode(faqs), breadcrumb([["Home", "/"], ["FAQ", "/faq.html"]])],
  }));
}

function partner() {
  const body = `${pagehead({ h1: "Become a Partner", sub: cfg.partnerProgram.headline + ".", img: "/assets/img/partner.webp", alt: "Two tradespeople shaking hands beside the Sketchy Garage Doors van", crumbs: `<a href="/">Home</a> / <span style="color:#fff">Become a Partner</span>` })}
<section class="section">
  <div class="container split">
    <div data-reveal>
      <span class="eyebrow">${I.handshake} Trade partner program</span>
      <h2>We get more calls than we can take.</h2>
      <p class="lead">When we're booked solid, those leads shouldn't go to waste — and they shouldn't go to whoever spent the most on ads. If you're a licensed installer or a related trade who does honest work, apply to receive vetted overflow garage-door jobs across Greater Vancouver.</p>
      <ul class="checks" style="margin-top:1.2rem">
        <li>${I.check}<span>Real jobs from real homeowners — not recycled lead-list spam.</span></li>
        <li>${I.check}<span>You pick the areas and the volume you can handle.</span></li>
        <li>${I.check}<span>We only partner with insured, WorkSafeBC-covered trades — our name's on it too.</span></li>
        <li>${I.check}<span>No lock-in. Take the overflow that fits your schedule.</span></li>
      </ul>
      <p style="margin-top:1.2rem">Questions first? Email <a href="mailto:${EMAIL}">${EMAIL}</a> or call <a href="tel:${TEL}">${TEL_DISPLAY}</a>.</p>
    </div>
    <div class="card" data-reveal="right">
      <h3>Apply to partner</h3>
      <p style="font-size:.95rem">Tell us about your crew and coverage. We review every application and reply by email.</p>
      ${contactForm("partner", { source: "/become-a-partner.html" })}
    </div>
  </div>
</section>
${ctaBand("Homeowner, not a trade? We've got you too.", "Need your own garage door fixed? Call or text and we'll handle it directly.")}`;
  out("become-a-partner.html", layout({
    path: "/become-a-partner.html", title: "Become a Partner | Sketchy Garage Doors",
    desc: "Licensed installers & trades: apply for vetted overflow garage-door jobs across Greater Vancouver. Pick your areas and volume. Apply in two minutes.",
    body, ogImg: "/assets/img/partner.webp", preload: heroPreload("/assets/img/partner.webp"), jsonld: [breadcrumb([["Home", "/"], ["Become a Partner", "/become-a-partner.html"]])],
  }));
}

function thankYou() {
  const body = `<section class="section" style="min-height:60vh;display:grid;place-items:center">
  <div class="container center" style="max-width:620px" data-reveal>
    <div class="card__icon" style="margin:0 auto 1.2rem;width:64px;height:64px">${I.check}</div>
    <span class="eyebrow">Message received</span>
    <h1>Thanks — we've got it.</h1>
    <p class="lead mx-auto">Your request landed in our inbox and we'll get back to you fast, usually the same day. If it's urgent — a door stuck open or a car trapped — please call or text us now so we can prioritise it.</p>
    <div style="display:flex;gap:.8rem;justify-content:center;flex-wrap:wrap;margin-top:1.6rem">
      ${callBtn("btn btn--primary btn--lg cta-pulse")}
      ${textBtn("btn btn--dark btn--lg")}
    </div>
    <p style="margin-top:1.6rem"><a href="/">← Back to home</a></p>
  </div>
</section>`;
  out("thank-you.html", layout({
    path: "/thank-you.html", title: "Thank You | Sketchy Garage Doors",
    desc: "Thanks for contacting Sketchy Garage Doors. We'll reply fast — usually the same day. For urgent garage-door problems, call or text us now.",
    body, bodyClass: "", noindex: true, jsonld: [],
  }));
}

function legal(slug, title, heading, sections) {
  const body = `${pagehead({ h1: heading, sub: "", img: "/assets/img/contact.webp", alt: "", crumbs: `<a href="/">Home</a> / <span style="color:#fff">${heading}</span>` })}
<section class="section"><div class="container" style="max-width:760px"><div class="prose" data-reveal>
  <p><em>Last updated: ${TODAY}.</em></p>
  ${sections}
  <h2>Contact</h2>
  <p>Questions about this policy? Email <a href="mailto:${EMAIL}">${EMAIL}</a> or call ${TEL_DISPLAY}.</p>
</div></div></section>`;
  out(slug, layout({ path: "/" + slug, title, desc: heading + " for Sketchy Garage Doors, Greater Vancouver.", body, preload: heroPreload("/assets/img/contact.webp"), jsonld: [breadcrumb([["Home", "/"], [heading, "/" + slug]])] }));
}

function privacy() {
  legal("privacy-policy.html", "Privacy Policy | Sketchy Garage Doors", "Privacy Policy", `
    <p>Sketchy Garage Doors ("we") respects your privacy. This policy explains what we collect and how we use it.</p>
    <h2>What we collect</h2>
    <p>When you call, text, email, or submit a form, we collect the details you give us — your name, phone number, email, address/service area, and a description of your garage-door issue or partner application. Our website may also collect standard, non-identifying analytics (pages visited, device type) to improve the site.</p>
    <h2>How we use it</h2>
    <p>We use your information solely to respond to your enquiry, schedule and perform service, send you a quote or follow-up, and (for partners) assess your application. We do not sell your personal information.</p>
    <h2>Form submissions</h2>
    <p>Contact and partner forms are delivered to our <a href="mailto:${EMAIL}">${EMAIL}</a> inbox. We retain enquiries only as long as needed to serve you and meet our business and legal obligations.</p>
    <h2>Cookies &amp; analytics</h2>
    <p>We keep tracking to a minimum. Any analytics we use are for aggregate site improvement, not advertising profiles. You can block cookies in your browser without losing core site function.</p>
    <h2>Your choices</h2>
    <p>You can ask us to access, correct, or delete the personal information you've given us at any time — just email us. This policy is provided under applicable BC and Canadian privacy law (PIPA / PIPEDA).</p>`);
}

function terms() {
  legal("terms-of-service.html", "Terms of Service | Sketchy Garage Doors", "Terms of Service", `
    <p>These terms govern your use of the Sketchy Garage Doors website and the information on it.</p>
    <h2>Quotes &amp; pricing</h2>
    <p>Prices and ranges shown on this site are estimates to help you plan and are not a binding offer. Your actual price is the written quote we provide for your specific door after diagnosis or measurement, which you approve before any work begins.</p>
    <h2>Service &amp; workmanship guarantee</h2>
    <p>We stand behind our labour with a workmanship guarantee: if a repair we performed isn't right, we'll return and correct it. Parts carry their manufacturer's warranty. The guarantee covers our work, not pre-existing conditions or unrelated future failures.</p>
    <h2>Licensing</h2>
    <p>Garage-door technician is an unregulated trade in British Columbia; there is no provincial trade licence for it. "Licensed" on this site refers to our municipal business licence. We also carry commercial liability insurance and are WorkSafeBC-covered.</p>
    <h2>Website content</h2>
    <p>Content is provided for general information and may change without notice. Images are representative. We aim for accuracy but don't warrant that everything is error-free.</p>
    <h2>Liability</h2>
    <p>To the extent permitted by law, we are not liable for indirect or consequential damages arising from use of this website. Nothing here limits rights you have under applicable consumer-protection law.</p>`);
}

function notFound() {
  const body = `<section class="section" style="min-height:60vh;display:grid;place-items:center">
  <div class="container center" style="max-width:620px" data-reveal>
    <div class="stat" style="font-size:4rem">404</div>
    <h1>This page went off-track.</h1>
    <p class="lead mx-auto">We couldn't find what you were looking for — but we can definitely find your garage door. Try one of these, or just call us.</p>
    <div class="coverage-list" style="justify-content:center;margin-top:1.5rem">
      <li><a href="/">Home</a></li><li><a href="/services.html">Services</a></li>
      <li><a href="/garage-door-spring-repair.html">Spring repair</a></li>
      <li><a href="/service-areas/">Service areas</a></li><li><a href="/contact.html">Contact</a></li>
    </div>
    <div style="margin-top:1.6rem">${callBtn("btn btn--primary btn--lg")}</div>
  </div>
</section>`;
  out("404.html", layout({ path: "/404.html", title: "Page Not Found | Sketchy Garage Doors", desc: "That page went off-track. Find garage-door services and service areas, or call Sketchy Garage Doors in Greater Vancouver.", body, noindex: true, jsonld: [] }));
}

/* =====================================================================
   BUILD ALL
   ===================================================================== */
home();
servicesHub();
Object.keys(services).forEach(servicePage);
areasHub();
CITIES.forEach(cityPage);
about();
contact();
faqPage();
partner();
thankYou();
privacy();
terms();
notFound();
console.log("\nAll pages generated.");
