// Phase 3: wires the static markup in views/site/contact.ejs (data-error-for spans,
// #contact-form-error, the #cf-hp honeypot) up to the real POST /api/enquiries route —
// same client-side shape as the already-reviewed legacy-nextjs-app/src/app/(site)/
// contact/contact-form.tsx (inline field errors, a submitting/sent state), just vanilla
// JS/fetch instead of a React component. Loaded only on the Contact page (its own
// <script defer> tag), not sitewide via doc-head.ejs — no other page has this form.
(function () {
  "use strict";

  var EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var container = document.getElementById("contact-form-container");
    var globalError = document.getElementById("contact-form-error");
    var submitButton = form.querySelector('button[type="submit"]');
    var submitLabel = submitButton ? submitButton.textContent : "Submit Inquiry";

    function fieldErrorEl(key) {
      return form.querySelector('[data-error-for="' + key + '"]');
    }

    function clearErrors() {
      ["name", "email", "details"].forEach(function (key) {
        var el = fieldErrorEl(key);
        if (el) el.textContent = "";
      });
      globalError.textContent = "";
      globalError.classList.add("hidden");
    }

    function showGlobalError(message) {
      globalError.textContent = message;
      globalError.classList.remove("hidden");
    }

    function showSent(firstName, email) {
      container.innerHTML =
        '<div class="grid justify-items-center gap-3 py-7 text-center">' +
        '<div class="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-[20px] text-white">✓</div>' +
        '<h2 class="font-display text-[22px] font-bold tracking-[-0.02em]">Thanks, ' +
        firstName +
        ".</h2>" +
        '<p class="max-w-[340px] text-[14px] leading-[1.6] text-mist">Your inquiry is in. Our team will review your scope and reply to ' +
        email +
        " within one business day.</p>" +
        "</div>";
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearErrors();

      var name = form.querySelector("#cf-name").value.trim();
      var email = form.querySelector("#cf-email").value.trim();
      var phone = form.querySelector("#cf-phone").value.trim();
      var service = form.querySelector("#cf-service").value;
      var details = form.querySelector("#cf-details").value.trim();
      var company = form.querySelector("#cf-hp").value;

      var errors = {};
      if (!name) errors.name = "Please enter your name";
      if (!EMAIL_PATTERN.test(email)) errors.email = "Please enter a valid email";
      if (!details) errors.details = "Please tell us a little about your requirements";

      var errorKeys = Object.keys(errors);
      if (errorKeys.length) {
        errorKeys.forEach(function (key) {
          var el = fieldErrorEl(key);
          if (el) el.textContent = errors[key];
        });
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting…";
      }

      fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: phone || undefined,
          service: service,
          details: details,
          source: "Contact form",
          company: company,
        }),
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          if (!result.ok) {
            showGlobalError((result.data && result.data.error) || "Something went wrong. Please try again.");
            var fieldErrors = result.data && result.data.fieldErrors;
            if (fieldErrors) {
              Object.keys(fieldErrors).forEach(function (key) {
                var el = fieldErrorEl(key);
                if (el) el.textContent = fieldErrors[key];
              });
            }
            if (submitButton) {
              submitButton.disabled = false;
              submitButton.textContent = submitLabel;
            }
            return;
          }
          showSent(name.split(" ")[0] || name, email);
        })
        .catch(function () {
          showGlobalError("Network error. Please check your connection and try again.");
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = submitLabel;
          }
        });
    });
  });
})();
