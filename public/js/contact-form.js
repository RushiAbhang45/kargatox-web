// Phase 3: wires the static markup in views/site/contact.ejs (data-error-for spans,
// #contact-form-error, the #cf-hp honeypot) up to the real POST /api/enquiries route —
// same client-side shape as the already-reviewed legacy-nextjs-app/src/app/(site)/
// contact/contact-form.tsx (inline field errors, a submitting/sent state), just vanilla
// JS/fetch instead of a React component. Loaded only on the Contact page (its own
// <script defer> tag), not sitewide via doc-head.ejs — no other page has this form.
//
// Client change list 2026-11-02 added: digits-only phone input sized to the chosen
// country's number length, LinkedIn/website/meeting fields, the signed form token and
// optional Turnstile token, an animated "submitted" state, and — for visitors who said
// yes to a meeting — a "pick a time" button that opens Calendly prefilled with their
// name and email. Server-side checks (routes/api.js) remain the real gate; the checks
// here only give faster feedback.
(function () {
  "use strict";

  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var FIELDS = ["name", "email", "phone", "linkedinUrl", "website", "details"];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var container = document.getElementById("contact-form-container");
    var globalError = document.getElementById("contact-form-error");
    var submitButton = form.querySelector('button[type="submit"]');
    var submitLabel = submitButton ? submitButton.textContent : "Submit Inquiry";
    var countrySelect = form.querySelector("#cf-phone-country");
    var phoneInput = form.querySelector("#cf-phone");
    var calendlyUrl = form.getAttribute("data-calendly-url");
    var contactEmail = form.getAttribute("data-contact-email");

    var fieldInputs = {
      name: form.querySelector("#cf-name"),
      email: form.querySelector("#cf-email"),
      phone: phoneInput,
      linkedinUrl: form.querySelector("#cf-linkedin"),
      website: form.querySelector("#cf-website"),
      details: form.querySelector("#cf-details"),
    };

    function fieldErrorEl(key) {
      return form.querySelector('[data-error-for="' + key + '"]');
    }

    function setFieldError(key, message) {
      var el = fieldErrorEl(key);
      var input = fieldInputs[key];
      if (input) input.setAttribute("aria-invalid", message ? "true" : "false");
      if (!el) return;
      var hint = el.getAttribute("data-hint");
      el.textContent = message || hint || "";
      el.classList.toggle("is-hint", !message && !!hint);
    }

    function clearErrors() {
      FIELDS.forEach(function (key) {
        setFieldError(key, "");
      });
      globalError.textContent = "";
      globalError.classList.add("hidden");
    }

    function showGlobalError(message) {
      globalError.textContent = message;
      globalError.classList.remove("hidden");
    }

    // ---- Phone: digits only, max length follows the selected country ----
    function selectedCountry() {
      var opt = countrySelect.options[countrySelect.selectedIndex];
      return {
        name: opt.textContent.replace(/^\+\d+\s*/, "").trim(),
        min: Number(opt.getAttribute("data-min")),
        max: Number(opt.getAttribute("data-max")),
      };
    }
    function syncPhoneLimits() {
      var c = selectedCountry();
      phoneInput.maxLength = c.max;
      if (phoneInput.value.length > c.max) phoneInput.value = phoneInput.value.slice(0, c.max);
    }
    phoneInput.addEventListener("input", function () {
      var digits = phoneInput.value.replace(/\D+/g, "");
      if (digits !== phoneInput.value) phoneInput.value = digits;
      syncPhoneLimits();
    });
    phoneInput.addEventListener("keydown", function (e) {
      if (e.key.length === 1 && !/\d/.test(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault();
    });
    countrySelect.addEventListener("change", syncPhoneLimits);
    syncPhoneLimits();

    // Errors clear as the visitor fixes the field.
    FIELDS.forEach(function (key) {
      var input = fieldInputs[key];
      if (input) input.addEventListener("input", function () { setFieldError(key, ""); });
    });

    function validate(v) {
      var errors = {};
      if (!v.name) errors.name = "Please enter your name";
      if (!EMAIL_PATTERN.test(v.email)) errors.email = "Please enter a valid email";
      if (v.phone) {
        var c = selectedCountry();
        if (v.phone.length < c.min || v.phone.length > c.max) {
          errors.phone = c.min === c.max ? c.name + " numbers have " + c.min + " digits" : c.name + " numbers have " + c.min + "–" + c.max + " digits";
        }
      }
      if (v.linkedinUrl && !/(^|\.|\/\/)linkedin\.com(\/|$)/i.test(v.linkedinUrl)) {
        errors.linkedinUrl = "Please enter a linkedin.com profile or company link";
      }
      if (v.website && !/^(https?:\/\/)?[a-z0-9.-]+\.[a-z]{2,}(\/\S*)?$/i.test(v.website)) {
        errors.website = "Please enter a valid website, e.g. yourcompany.com";
      }
      if (!v.details) errors.details = "Please tell us a little about your requirements";
      return errors;
    }

    // Opens Calendly's popup prefilled; returns true when the plain link should be followed instead.
    function openCalendly(name, email) {
      if (window.Calendly) {
        window.Calendly.initPopupWidget({ url: calendlyUrl, prefill: { name: name, email: email } });
        return false;
      }
      return true;
    }

    function showSent(v) {
      var firstName = v.name.split(" ")[0] || v.name;
      var meetingUrl = calendlyUrl + "?name=" + encodeURIComponent(v.name) + "&email=" + encodeURIComponent(v.email);
      var actions = v.wantsMeeting === "yes"
        ? '<a href="' + esc(meetingUrl) + '" target="_blank" rel="noopener" data-sent-calendly class="inline-block rounded-pill bg-orange-500 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-orange-400 hover:text-white">Pick a time for our call →</a>'
        : '<a href="' + esc(meetingUrl) + '" target="_blank" rel="noopener" data-sent-calendly class="text-[14px] font-semibold text-orange-400 hover:text-white">Prefer to talk sooner? Book a call →</a>';

      var render = function () {
        container.innerHTML =
          '<div class="kx-sent" role="status" aria-live="polite">' +
          '<div class="kx-sent-badge" aria-hidden="true"><svg viewBox="0 0 76 76"><circle class="kx-sent-circle" cx="38" cy="38" r="38"/><path class="kx-sent-check" d="M24 39.5 34 49l18-21"/></svg></div>' +
          '<h2 class="kx-sent-line font-display text-[24px] font-bold tracking-[-0.02em]">Thanks, ' + esc(firstName) + ". Your inquiry is in.</h2>" +
          '<p class="kx-sent-line max-w-[360px] text-[14px] leading-[1.6] text-mist">Our team will review your scope and reply to <strong class="text-white">' + esc(v.email) + "</strong> within one business day. A welcome email from " + esc(contactEmail) + " is on its way.</p>" +
          (v.website ? '<p class="kx-sent-line max-w-[360px] text-[13px] leading-[1.6] text-mist-2">We\'re running a quick health check on ' + esc(v.website.replace(/^https?:\/\//i, "")) + " so we come prepared.</p>" : "") +
          '<div class="kx-sent-line mt-2">' + actions + "</div>" +
          "</div>";
        var link = container.querySelector("[data-sent-calendly]");
        if (link) link.addEventListener("click", function (e) {
          if (!openCalendly(v.name, v.email)) e.preventDefault();
        });
      };

      var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return render();
      form.classList.add("kx-form-leave");
      setTimeout(render, 330);
    }

    function setBusy(busy) {
      if (!submitButton) return;
      submitButton.disabled = busy;
      submitButton.textContent = busy ? "Submitting…" : submitLabel;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearErrors();

      var meeting = form.querySelector('input[name="wantsMeeting"]:checked');
      var turnstile = form.querySelector('[name="cf-turnstile-response"]');
      var v = {
        name: fieldInputs.name.value.trim(),
        email: fieldInputs.email.value.trim(),
        phoneCountry: countrySelect.value,
        phone: phoneInput.value.trim(),
        service: form.querySelector("#cf-service").value,
        linkedinUrl: fieldInputs.linkedinUrl.value.trim(),
        website: fieldInputs.website.value.trim(),
        wantsMeeting: meeting ? meeting.value : "",
        details: fieldInputs.details.value.trim(),
      };

      var errors = validate(v);
      var errorKeys = Object.keys(errors);
      if (errorKeys.length) {
        errorKeys.forEach(function (key) {
          setFieldError(key, errors[key]);
        });
        var first = fieldInputs[errorKeys[0]];
        if (first) first.focus();
        return;
      }

      setBusy(true);

      fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: v.name,
          email: v.email,
          phoneCountry: v.phoneCountry,
          phone: v.phone || undefined,
          service: v.service,
          linkedinUrl: v.linkedinUrl || undefined,
          website: v.website || undefined,
          wantsMeeting: v.wantsMeeting,
          details: v.details,
          source: form.querySelector("#cf-source").value,
          revenueCheckId: form.querySelector("#cf-check-id").value || undefined,
          formToken: form.querySelector("#cf-token").value,
          turnstileToken: turnstile ? turnstile.value : undefined,
          company: form.querySelector("#cf-hp").value,
        }),
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          if (!result.ok) {
            showGlobalError((result.data && result.data.error) || "Something went wrong. Please try again.");
            var fieldErrors = result.data && result.data.fieldErrors;
            if (fieldErrors) {
              Object.keys(fieldErrors).forEach(function (key) {
                setFieldError(key, fieldErrors[key]);
              });
            }
            if (window.turnstile) window.turnstile.reset();
            setBusy(false);
            return;
          }
          showSent(v);
        })
        .catch(function () {
          showGlobalError("Network error. Please check your connection and try again.");
          setBusy(false);
        });
    });
  });
})();
