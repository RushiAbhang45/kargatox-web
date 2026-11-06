// Admin-only interactivity — separate from public/js/site.js (Phase 10) since none of
// this runs on public pages. No build step, same plain <script defer> pattern.
(function () {
  function reindexRepeater(container, namePrefix) {
    Array.from(container.children).forEach(function (row, i) {
      row.querySelectorAll("[data-field]").forEach(function (el) {
        el.name = namePrefix + "[" + i + "][" + el.getAttribute("data-field") + "]";
      });
    });
  }

  function initRepeater(root) {
    var container = root.querySelector("[data-repeater-rows]");
    var template = root.querySelector("template[data-repeater-template]");
    var namePrefix = root.getAttribute("data-repeater-name");
    if (!container || !template || !namePrefix) return;

    function bindRow(row) {
      var upBtn = row.querySelector("[data-row-up]");
      var downBtn = row.querySelector("[data-row-down]");
      var removeBtn = row.querySelector("[data-row-remove]");
      if (upBtn) {
        upBtn.addEventListener("click", function () {
          var prev = row.previousElementSibling;
          if (prev) {
            container.insertBefore(row, prev);
            reindexRepeater(container, namePrefix);
          }
        });
      }
      if (downBtn) {
        downBtn.addEventListener("click", function () {
          var next = row.nextElementSibling;
          if (next) {
            container.insertBefore(next, row);
            reindexRepeater(container, namePrefix);
          }
        });
      }
      if (removeBtn) {
        removeBtn.addEventListener("click", function () {
          row.remove();
          reindexRepeater(container, namePrefix);
        });
      }
    }

    Array.from(container.children).forEach(bindRow);

    var addBtn = root.querySelector("[data-repeater-add]");
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        var clone = template.content.firstElementChild.cloneNode(true);
        container.appendChild(clone);
        bindRow(clone);
        reindexRepeater(container, namePrefix);
      });
    }
  }

  function initTabs(root) {
    var buttons = root.querySelectorAll("[data-tab-button]");
    var panels = root.querySelectorAll("[data-tab-panel]");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-tab-button");
        buttons.forEach(function (b) {
          if (b === btn) b.setAttribute("data-active", "");
          else b.removeAttribute("data-active");
        });
        panels.forEach(function (p) {
          p.classList.toggle("hidden", p.getAttribute("data-tab-panel") !== target);
        });
        var activeTabInput = root.querySelector("[data-active-tab-input]");
        if (activeTabInput) activeTabInput.value = target;
      });
    });
  }

  function initFillTemplates() {
    document.querySelectorAll("[data-fill-template]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var targetId = btn.getAttribute("data-fill-target");
        var target = targetId && document.getElementById(targetId);
        if (target) target.value = btn.getAttribute("data-fill-template");
      });
    });
  }

  function slugify(value) {
    return (
      String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "post"
    );
  }

  function initPostEditor(root) {
    var titleInput = root.querySelector("[data-post-title]");
    var slugInput = root.querySelector("[data-post-slug]");
    var seoTitleInput = root.querySelector("[data-post-seo-title]");
    var seoDescInput = root.querySelector("[data-post-seo-description]");
    var previewTitle = root.querySelector("[data-preview-title]");
    var previewUrl = root.querySelector("[data-preview-url]");
    var previewDesc = root.querySelector("[data-preview-description]");
    var siteUrl = root.getAttribute("data-site-url") || "";
    var slugTouched = Boolean(slugInput && slugInput.value);

    function updatePreview() {
      if (previewTitle) {
        previewTitle.textContent = (seoTitleInput && seoTitleInput.value) || (titleInput && titleInput.value) || "Untitled post";
      }
      if (previewUrl) previewUrl.textContent = siteUrl + "/blog/" + ((slugInput && slugInput.value) || "");
      if (previewDesc) previewDesc.textContent = (seoDescInput && seoDescInput.value) || "";
    }

    if (titleInput) {
      titleInput.addEventListener("input", function () {
        if (!slugTouched && slugInput) slugInput.value = slugify(titleInput.value);
        updatePreview();
      });
    }
    if (slugInput) {
      slugInput.addEventListener("input", function () {
        slugTouched = true;
        updatePreview();
      });
    }
    if (seoTitleInput) seoTitleInput.addEventListener("input", updatePreview);
    if (seoDescInput) seoDescInput.addEventListener("input", updatePreview);

    updatePreview();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-repeater]").forEach(initRepeater);
    document.querySelectorAll("[data-tabs]").forEach(initTabs);
    document.querySelectorAll("[data-post-editor]").forEach(initPostEditor);
    initFillTemplates();
  });
})();
