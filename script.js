(function () {
  "use strict";

  /* -------------------------------------------------------
     Theme toggle (persisted, respects prefers-color-scheme)
  ------------------------------------------------------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById("theme-toggle");
  var STORAGE_KEY = "portfolio-theme";

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredTheme(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      /* localStorage unavailable (private mode, etc.) — theme just won't persist */
    }
  }

  function applyTheme(theme) {
    if (theme === "dark" || theme === "light") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
    var isDark =
      theme === "dark" ||
      (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme"
      );
    }
  }

  applyTheme(getStoredTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current =
        root.getAttribute("data-theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light");
      var next = current === "dark" ? "light" : "dark";
      setStoredTheme(next);
      applyTheme(next);
    });
  }

  /* -------------------------------------------------------
     Mobile navigation
  ------------------------------------------------------- */
  var navToggle = document.getElementById("nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");

  function closeMobileNav() {
    if (!mobileNav || !navToggle) return;
    mobileNav.hidden = true;
    mobileNav.removeAttribute("data-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }

  function openMobileNav() {
    if (!mobileNav || !navToggle) return;
    mobileNav.hidden = false;
    mobileNav.setAttribute("data-open", "true");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
  }

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMobileNav);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMobileNav();
        navToggle.focus();
      }
    });
  }

  /* -------------------------------------------------------
     Active nav link highlighting
  ------------------------------------------------------- */
  var sections = document.querySelectorAll("main section[id]");
  var navLinks = document.querySelectorAll(".site-nav a, .mobile-nav a");

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      var match = link.getAttribute("href") === "#" + id;
      link.classList.toggle("active", match);
      if (match) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActiveLink(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach(function (section) {
      navObserver.observe(section);
    });
  }

  /* -------------------------------------------------------
     Scroll reveal (progressive enhancement only — content is
     fully visible without JS; classes are added here so a
     no-JS visitor never gets opacity:0 elements)
  ------------------------------------------------------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var revealTargets = Array.prototype.slice.call(
    document.querySelectorAll(
      ".project-card, .skill-card, .timeline-item, .competency-list li, .orgs li"
    )
  );

  if (!reduceMotion && "IntersectionObserver" in window && revealTargets.length) {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var target = entry.target;
          observer.unobserve(target);
          target.classList.add("is-visible");
          // Once the fade finishes, drop the helper classes so the element's
          // own hover transitions are not slowed down by the reveal timing.
          target.addEventListener("transitionend", function done(event) {
            if (event.propertyName !== "opacity") return;
            target.removeEventListener("transitionend", done);
            target.classList.remove("reveal", "is-visible");
            target.style.removeProperty("--d");
          });
        });
      },
      { threshold: 0.15 }
    );

    var revealCounts = new Map();
    revealTargets.forEach(function (el) {
      var parent = el.parentElement;
      var index = revealCounts.get(parent) || 0;
      revealCounts.set(parent, index + 1);
      el.style.setProperty("--d", (index % 4) * 0.07 + "s");
      el.classList.add("reveal");
      revealObserver.observe(el);
    });
  }

  /* -------------------------------------------------------
     Device mockup tilt (mouse and trackpad only)
  ------------------------------------------------------- */
  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-tilt]"), function (stage) {
      var rig = stage.querySelector(".device-rig");
      if (!rig) return;
      stage.addEventListener("pointermove", function (event) {
        var box = stage.getBoundingClientRect();
        var x = (event.clientX - box.left) / box.width - 0.5;
        var y = (event.clientY - box.top) / box.height - 0.5;
        rig.classList.add("is-tilting");
        rig.style.setProperty("--ry", (x * 12).toFixed(2) + "deg");
        rig.style.setProperty("--rx", (-y * 9).toFixed(2) + "deg");
      });
      stage.addEventListener("pointerleave", function () {
        rig.classList.remove("is-tilting");
        rig.style.setProperty("--ry", "0deg");
        rig.style.setProperty("--rx", "0deg");
      });
    });
  }

  /* -------------------------------------------------------
     Scroll progress bar and header shadow
  ------------------------------------------------------- */
  var progressBar = document.createElement("div");
  progressBar.className = "scroll-progress";
  progressBar.setAttribute("aria-hidden", "true");
  document.body.appendChild(progressBar);

  var siteHeader = document.querySelector(".site-header");
  var scrollTicking = false;

  function onScrollFrame() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    progressBar.style.setProperty("--p", max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0);
    if (siteHeader) siteHeader.classList.toggle("is-scrolled", window.scrollY > 8);
    scrollTicking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!scrollTicking) {
        scrollTicking = true;
        window.requestAnimationFrame(onScrollFrame);
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", onScrollFrame);
  onScrollFrame();

  /* -------------------------------------------------------
     Skills-across-projects matrix. Built entirely from the
     data-skills / data-short attributes on the project cards
     (single source of truth), and doubles as a project filter.
     Without JS the cards simply show in full.
  ------------------------------------------------------- */
  var SKILLS = [
    ["html", "HTML"],
    ["css", "CSS"],
    ["javascript", "JavaScript"],
    ["responsive", "Responsive design"],
    ["accessibility", "Accessibility"],
    ["pwa", "Offline apps (PWA)"],
    ["storage", "Browser storage and IndexedDB"],
    ["data", "Data modeling and analysis"],
    ["python", "Python"],
    ["security", "Privacy and security"],
    ["deployment", "Deployment (GitHub Pages)"]
  ];

  var projectGrid = document.querySelector(".project-grid");
  var projectCards = projectGrid
    ? Array.prototype.slice.call(projectGrid.querySelectorAll(".project-card[data-skills]"))
    : [];

  if (projectGrid && projectCards.length) {
    var cardSkills = projectCards.map(function (card) {
      return card.getAttribute("data-skills").split(/\s+/);
    });
    var activeSkill = null;

    var el = function (tag, className, text) {
      var node = document.createElement(tag);
      if (className) node.className = className;
      if (text) node.textContent = text;
      return node;
    };

    var wrap = el("div", "skill-matrix");
    wrap.appendChild(el("h3", null, "Skills across projects"));
    wrap.appendChild(
      el("p", "section-note", "Select a skill to see which projects use it and filter the projects above.")
    );

    var scroller = el("div", "matrix-scroll");
    scroller.setAttribute("role", "region");
    scroller.setAttribute("aria-label", "Skills used in each project");
    scroller.tabIndex = 0;

    var table = el("table", "matrix");
    table.appendChild(el("caption", "sr-only", "Which skills each project uses"));

    var headRow = el("tr");
    headRow.appendChild(el("th", null, "Skill")).setAttribute("scope", "col");
    projectCards.forEach(function (card) {
      var th = el("th", "matrix-col", card.getAttribute("data-short"));
      th.setAttribute("scope", "col");
      headRow.appendChild(th);
    });
    var usedTh = el("th", null, "Used in");
    usedTh.setAttribute("scope", "col");
    headRow.appendChild(usedTh);
    table.appendChild(el("thead")).appendChild(headRow);

    var tbody = el("tbody");
    var rows = [];
    SKILLS.forEach(function (pair) {
      var key = pair[0];
      var count = cardSkills.filter(function (list) {
        return list.indexOf(key) !== -1;
      }).length;
      if (!count) return;

      var tr = el("tr");
      var rowHead = el("th");
      rowHead.setAttribute("scope", "row");
      var btn = el("button", "matrix-skill", pair[1]);
      btn.type = "button";
      btn.setAttribute("aria-pressed", "false");
      rowHead.appendChild(btn);
      tr.appendChild(rowHead);

      cardSkills.forEach(function (list) {
        var used = list.indexOf(key) !== -1;
        var td = el("td", "matrix-cell" + (used ? " is-on" : ""));
        td.appendChild(el("span", "matrix-dot")).setAttribute("aria-hidden", "true");
        td.appendChild(el("span", "sr-only", used ? "Used" : "Not used"));
        tr.appendChild(td);
      });

      var total = el("td", "matrix-total");
      var bar = el("span", "matrix-bar");
      var fill = el("span", "matrix-fill");
      fill.style.width = Math.round((count / projectCards.length) * 100) + "%";
      bar.appendChild(fill);
      bar.setAttribute("aria-hidden", "true");
      total.appendChild(bar);
      total.appendChild(el("span", "matrix-count", count + " of " + projectCards.length));
      tr.appendChild(total);

      tbody.appendChild(tr);
      rows.push({ key: key, tr: tr, btn: btn });
    });
    table.appendChild(tbody);
    scroller.appendChild(table);
    wrap.appendChild(scroller);

    var status = el("p", "matrix-status");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    var reset = el("button", "btn btn-ghost matrix-reset", "Show all projects");
    reset.type = "button";
    reset.hidden = true;
    var footer = el("div", "matrix-footer");
    footer.appendChild(status);
    footer.appendChild(reset);
    wrap.appendChild(footer);

    var applyFilter = function (skill) {
      activeSkill = skill;
      var shown = 0;
      projectCards.forEach(function (card, i) {
        var match = !skill || cardSkills[i].indexOf(skill) !== -1;
        card.hidden = !match;
        if (match) shown += 1;
      });
      rows.forEach(function (row) {
        var on = row.key === skill;
        row.btn.setAttribute("aria-pressed", String(on));
        row.tr.classList.toggle("is-active", on);
      });
      var cols = table.querySelectorAll("tbody tr");
      Array.prototype.forEach.call(cols, function (tr) {
        Array.prototype.forEach.call(tr.querySelectorAll(".matrix-cell"), function (td, i) {
          td.classList.toggle("is-dim", !!skill && cardSkills[i].indexOf(skill) === -1);
        });
      });
      var label = "";
      SKILLS.forEach(function (pair) {
        if (pair[0] === skill) label = pair[1];
      });
      status.textContent = skill
        ? "Showing " + shown + " of " + projectCards.length + " projects that use " + label + "."
        : "Showing all " + projectCards.length + " projects.";
      reset.hidden = !skill;
    };

    rows.forEach(function (row) {
      row.btn.addEventListener("click", function () {
        applyFilter(activeSkill === row.key ? null : row.key);
      });
    });
    reset.addEventListener("click", function () {
      applyFilter(null);
    });

    projectGrid.insertAdjacentElement("afterend", wrap);
    applyFilter(null);
  }

  /* -------------------------------------------------------
     Contact form. No server: it builds a mailto: link, so the
     message goes through the visitor's own email app. The form
     is hidden in the HTML and shown here, so it never appears
     as a dead control when JavaScript is off.
  ------------------------------------------------------- */
  var contactForm = document.getElementById("contact-form");
  var mailLink = document.querySelector('a[href^="mailto:"]');

  if (contactForm && mailLink) {
    var toAddress = mailLink.getAttribute("href").replace(/^mailto:/i, "");
    var nameField = document.getElementById("cf-name");
    var emailField = document.getElementById("cf-email");
    var messageField = document.getElementById("cf-message");
    var errorBox = document.getElementById("cf-error");
    var statusBox = document.getElementById("cf-status");
    var copyBtn = document.getElementById("copy-email");

    contactForm.hidden = false;

    var singleLine = function (value) {
      return value.replace(/[\r\n]+/g, " ").trim();
    };

    var showError = function (field, message) {
      [nameField, emailField, messageField].forEach(function (f) {
        f.removeAttribute("aria-invalid");
        f.removeAttribute("aria-describedby");
      });
      if (!field) {
        errorBox.hidden = true;
        errorBox.textContent = "";
        return;
      }
      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", "cf-error");
      errorBox.textContent = message;
      errorBox.hidden = false;
      field.focus();
    };

    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      statusBox.textContent = "";
      var name = singleLine(nameField.value);
      var email = singleLine(emailField.value);
      var message = messageField.value.trim();

      if (!name) return showError(nameField, "Please enter your name.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return showError(emailField, "Please enter a valid email address so I can reply.");
      }
      if (message.length < 10) {
        return showError(messageField, "Please write a short message (at least 10 characters).");
      }
      showError(null);

      var subject = "Portfolio message from " + name;
      var body = message + "\n\n" + name + "\n" + email;
      window.location.href =
        "mailto:" + toAddress +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      statusBox.textContent =
        "Your email app should open with the message ready. If nothing happens, use \"Copy email address\" and send it from any email program.";
    });

    copyBtn.addEventListener("click", function () {
      var done = function () {
        statusBox.textContent = "Email address copied: " + toAddress;
      };
      var fallback = function () {
        var temp = document.createElement("input");
        temp.value = toAddress;
        temp.setAttribute("readonly", "");
        temp.style.position = "absolute";
        temp.style.left = "-9999px";
        document.body.appendChild(temp);
        temp.select();
        var ok = false;
        try {
          ok = document.execCommand("copy");
        } catch (e) {
          ok = false;
        }
        document.body.removeChild(temp);
        if (ok) {
          done();
        } else {
          statusBox.textContent = "Couldn't copy automatically. My email address is " + toAddress;
        }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(toAddress).then(done, fallback);
      } else {
        fallback();
      }
    });
  }

  /* -------------------------------------------------------
     Footer year
  ------------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
