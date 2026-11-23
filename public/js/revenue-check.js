// Home page revenue-check quiz — vanilla port of legacy-nextjs-app/src/components/home/
// revenue-check.tsx (same states: answering → result, Back, Retake; same meters; same
// POST /api/revenue-checks once per completed answer set). Markup shell + copy come from
// views/partials/revenue-check.ejs / lib/revenue-check-data.js. Loaded only by home.ejs.
(function () {
  "use strict";

  var STATUS = ["Leaking", "Needs work", "Healthy"];
  var METER_COLOR = ["bg-orange-400", "bg-white/40", "bg-success-dark"];
  var METER_TEXT = ["text-orange-400", "text-mist-2", "text-success-dark"];
  var METER_WIDTH = ["28%", "62%", "100%"];
  var ALL_METER_COLORS = METER_COLOR.concat(["bg-white/30"]);
  var ALL_METER_TEXT = METER_TEXT.concat(["text-white/50"]);

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function sessionId() {
    try {
      var existing = sessionStorage.getItem("kx-rc-session");
      if (existing) return existing;
    } catch (e) {}
    var id =
      window.crypto && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    try {
      sessionStorage.setItem("kx-rc-session", id);
    } catch (e) {}
    return id;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.querySelector("[data-revenue-check]");
    if (!root) return;
    var data = JSON.parse(root.querySelector("[data-revenue-check-data]").textContent);
    var Q = data.QUESTIONS;
    var stage = root.querySelector("[data-rc-stage]");
    var scoreEl = root.querySelector("[data-rc-score]");

    var answers = [null, null, null];
    var step = 0;
    var checkId = null;
    var postedFor = null;
    var sid = sessionId();

    function weakestIndex() {
      var w = 0;
      answers.forEach(function (v, i) {
        if (v < answers[w]) w = i;
      });
      return w;
    }

    function renderMeters() {
      var answered = answers.filter(function (v) {
        return v != null;
      });
      scoreEl.textContent = answered.length
        ? answered.reduce(function (a, b) {
            return a + b;
          }, 0) + "/6"
        : "–";
      Q.forEach(function (q, i) {
        var meter = root.querySelector('[data-rc-meter="' + q.key + '"]');
        var bar = meter.querySelector("[data-rc-meter-bar]");
        var label = meter.querySelector("[data-rc-meter-label]");
        var v = answers[i];
        bar.classList.remove.apply(bar.classList, ALL_METER_COLORS);
        label.classList.remove.apply(label.classList, ALL_METER_TEXT);
        bar.classList.add(v == null ? "bg-white/30" : METER_COLOR[v]);
        label.classList.add(v == null ? "text-white/50" : METER_TEXT[v]);
        bar.style.width = v == null ? "8%" : METER_WIDTH[v];
        label.textContent = v == null ? "Not answered" : STATUS[v];
      });
    }

    function renderQuestion() {
      var q = Q[step];
      var segments = Q.map(function (_, i) {
        var c = i < step ? "bg-blue-500" : i === step ? "bg-ink" : "bg-chip-neutral";
        return '<div class="h-1 flex-1 rounded-full transition-colors duration-[400ms] ' + c + '"></div>';
      }).join("");
      var options = q.options
        .map(function (o) {
          var selected = answers[step] === o[1];
          return (
            '<button type="button" data-rc-answer="' + o[1] + '" class="flex items-center justify-between gap-4 rounded-[14px] border-[1.5px] px-5 py-[18px] text-left text-[16px] font-medium text-ink transition-[border-color,transform] duration-300 hover:translate-x-1 hover:border-blue-500 ' +
            (selected ? "border-blue-500 bg-[#e8f0ff]" : "border-line bg-white") +
            '"><span>' + esc(o[0]) + '</span><span class="text-blue-500">→</span></button>'
          );
        })
        .join("");
      stage.innerHTML =
        '<div class="grid gap-[18px] kx-rc-enter">' +
        '<div class="flex items-center gap-3.5"><div class="flex flex-1 gap-1.5">' + segments + "</div>" +
        '<span class="whitespace-nowrap font-mono text-xs text-[#737373]">' + (step + 1) + " / " + Q.length + "</span></div>" +
        '<span class="w-fit rounded-chip bg-[#e8f0ff] px-3 py-1.5 font-mono text-xs uppercase tracking-[0.08em] text-blue-600">' + esc(q.area) + "</span>" +
        '<h3 class="font-display text-[clamp(22px,2.4vw,28px)] font-bold tracking-[-0.01em]">' + esc(q.text) + "</h3>" +
        '<div class="grid gap-2.5">' + options + "</div>" +
        (step > 0
          ? '<button type="button" data-rc-back class="w-fit border-0 bg-transparent p-0 text-[15px] font-semibold text-slate hover:text-ink">← Back</button>'
          : "") +
        "</div>";
    }

    function resultHref(r, area) {
      return (
        "/contact?service=" + encodeURIComponent(r.service) +
        "&note=" + encodeURIComponent(data.NOTE_PREFIX + area + " needs attention.") +
        (checkId ? "&checkId=" + encodeURIComponent(checkId) : "")
      );
    }

    function renderResult() {
      var w = Q[weakestIndex()];
      var r = data.RESULTS[w.key];
      var allHealthy = answers.every(function (v) {
        return v === 2;
      });
      var chips = r.services
        .map(function (s) {
          return '<a href="/services" class="rounded-chip bg-chip-blue px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-[#e5e5e5]">' + esc(s) + "</a>";
        })
        .join("");
      stage.innerHTML =
        '<div class="grid gap-[18px] kx-rc-enter">' +
        '<span class="w-fit rounded-chip bg-blue-500 px-3 py-1.5 font-mono text-xs tracking-[0.08em] text-white">YOUR RESULT</span>' +
        '<h3 class="font-display text-[clamp(24px,2.8vw,34px)] font-bold tracking-[-0.015em]">' + esc(allHealthy ? data.ALL_HEALTHY_TITLE : r.title) + "</h3>" +
        '<p class="text-[16px] leading-[1.6] text-slate">' + esc(r.body) + "</p>" +
        '<div class="grid gap-2.5"><span class="font-mono text-xs tracking-[0.1em] text-[#737373]">WHERE WE\'D START</span><div class="flex flex-wrap gap-2">' + chips + "</div></div>" +
        '<div class="mt-2 flex flex-wrap gap-3">' +
        '<a data-rc-cta href="' + esc(resultHref(r, w.area)) + '" class="rounded-pill bg-blue-500 px-6 py-[15px] text-base font-semibold text-white transition-colors hover:bg-blue-600">Fix my ' + esc(w.area.toLowerCase()) + " →</a>" +
        '<button type="button" data-rc-retake class="rounded-input border border-line-2 bg-transparent px-6 py-[15px] text-base font-semibold text-ink">Retake</button>' +
        "</div></div>";
      postResult(r, w);
    }

    // Posts each completed answer set once (Back + re-answer with different values posts
    // a new row; re-rendering the same set doesn't), then upgrades the CTA link with the
    // saved check's id so the enquiry gets linked to it.
    function postResult(r, w) {
      var signature = answers.join(",");
      if (postedFor === signature) return;
      postedFor = signature;
      checkId = null;
      fetch("/api/revenue-checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: answers[0], sales: answers[1], retention: answers[2], weakest: w.key, sessionId: sid }),
      })
        .then(function (res) {
          return res.ok ? res.json() : null;
        })
        .then(function (json) {
          if (!json || !json.id || postedFor !== signature) return;
          checkId = json.id;
          var cta = stage.querySelector("[data-rc-cta]");
          if (cta) cta.setAttribute("href", resultHref(r, w.area));
        })
        .catch(function () {});
    }

    function render() {
      if (step >= Q.length) renderResult();
      else renderQuestion();
      renderMeters();
    }

    stage.addEventListener("click", function (e) {
      var answer = e.target.closest("[data-rc-answer]");
      if (answer) {
        answers[step] = Number(answer.getAttribute("data-rc-answer"));
        step += 1;
        return render();
      }
      if (e.target.closest("[data-rc-back]")) {
        step -= 1;
        return render();
      }
      if (e.target.closest("[data-rc-retake]")) {
        answers = [null, null, null];
        step = 0;
        checkId = null;
        postedFor = null;
        render();
      }
    });
  });
})();
