// Phase 10: vanilla-JS interactivity for the static markup scaffolded in Phase 1. Wires
// the three DOM hooks left in place by views/partials/site-header.ejs, faq-accordion.ejs,
// and the data-scramble-reveal attributes scattered across views/site/*.ejs. No build
// step, no dependencies — loaded via a plain <script defer> in doc-head.ejs on every page.
(function () {
  "use strict";

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // --- Mobile nav menu (site-header.ejs's #mobile-menu-toggle / #mobile-menu) ---
  function initMobileMenu() {
    var toggle = document.getElementById("mobile-menu-toggle");
    var menu = document.getElementById("mobile-menu");
    if (!toggle || !menu) return;

    // Matches the --breakpoint-nav token (public/css/input.css) the `nav:` variant uses —
    // keeps the toggle's state in sync if the viewport crosses it while the menu is open.
    var desktopQuery = window.matchMedia("(min-width: 900px)");

    function setOpen(open) {
      menu.classList.toggle("hidden", !open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "✕" : "☰";
    }

    toggle.addEventListener("click", function () {
      setOpen(menu.classList.contains("hidden"));
    });

    document.addEventListener("click", function (event) {
      if (menu.classList.contains("hidden")) return;
      if (menu.contains(event.target) || toggle.contains(event.target)) return;
      setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !menu.classList.contains("hidden")) setOpen(false);
    });

    desktopQuery.addEventListener("change", function (event) {
      if (event.matches) setOpen(false);
    });
  }

  // --- FAQ accordion (faq-accordion.ejs's data-faq-trigger / data-faq-panel) ---
  function initFaqAccordions() {
    var accordions = document.querySelectorAll(".faq-accordion");

    accordions.forEach(function (accordion) {
      var triggers = accordion.querySelectorAll("[data-faq-trigger]");

      function setRowOpen(trigger, open) {
        var panel = trigger.parentElement.querySelector("[data-faq-panel]");
        var icon = trigger.querySelector(".faq-icon");
        trigger.setAttribute("aria-expanded", String(open));
        if (panel) panel.classList.toggle("hidden", !open);
        if (icon) {
          icon.textContent = open ? "−" : "+";
          icon.classList.toggle("bg-orange-500", open);
          icon.classList.toggle("text-white", open);
          icon.classList.toggle("bg-chip-neutral", !open);
          icon.classList.toggle("text-ink", !open);
        }
      }

      triggers.forEach(function (trigger) {
        trigger.addEventListener("click", function () {
          var nextOpen = trigger.getAttribute("aria-expanded") !== "true";
          triggers.forEach(function (t) {
            setRowOpen(t, t === trigger ? nextOpen : false);
          });
        });
      });
    });
  }

  // --- Scramble-in text reveal (data-scramble-reveal="...") ---
  var SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  function scrambleReveal(el) {
    var finalText = el.getAttribute("data-scramble-reveal") || el.textContent;
    var frameMs = 30;
    var totalFrames = Math.max(8, Math.round(finalText.length * 1.6));
    var revealEvery = Math.max(1, Math.floor(totalFrames / finalText.length));
    var frame = 0;

    var timer = setInterval(function () {
      frame++;
      var revealCount = Math.floor(frame / revealEvery);
      var out = "";
      for (var i = 0; i < finalText.length; i++) {
        var ch = finalText[i];
        out += ch === " " || i < revealCount ? ch : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
      el.textContent = out;
      if (revealCount >= finalText.length) {
        el.textContent = finalText;
        clearInterval(timer);
      }
    }, frameMs);
  }

  function initScrambleReveal() {
    var els = document.querySelectorAll("[data-scramble-reveal]");
    if (els.length === 0) return;

    // Reduced-motion / no-IntersectionObserver fallback: render the real text immediately,
    // same intent as the legacy app's GSAP ScrambleReveal reduced-motion branch.
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.textContent = el.getAttribute("data-scramble-reveal") || el.textContent;
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          scrambleReveal(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );

    els.forEach(function (el) {
      observer.observe(el);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initFaqAccordions();
    initScrambleReveal();
  });
})();
