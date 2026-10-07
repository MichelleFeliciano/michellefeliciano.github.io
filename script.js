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
      if (event.key === "Escape" && !mobileNav.hidden) {
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
      ".project-card, .skill-card, .timeline-item, .competency-list li"
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
     Cursor spotlight: tell each hovered card where the pointer is
     (the glow itself is pure CSS)
  ------------------------------------------------------- */
  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var spotEvent = null;
    var spotFrame = false;

    document.addEventListener(
      "pointermove",
      function (event) {
        spotEvent = event;
        if (spotFrame) return;
        spotFrame = true;
        window.requestAnimationFrame(function () {
          spotFrame = false;
          var card = spotEvent.target.closest
            ? spotEvent.target.closest(".project-card, .skill-card, .glance li")
            : null;
          if (!card) return;
          var box = card.getBoundingClientRect();
          card.style.setProperty("--mx", Math.round(spotEvent.clientX - box.left) + "px");
          card.style.setProperty("--my", Math.round(spotEvent.clientY - box.top) + "px");
        });
      },
      { passive: true }
    );
  }

  /* -------------------------------------------------------
     Skills ticker. The HTML is a plain list; here it becomes a slow
     scrolling band with a pause button. Skipped for reduced motion.
  ------------------------------------------------------- */
  var ticker = document.querySelector(".marquee");
  var tickerList = ticker ? ticker.querySelector(".marquee-list") : null;
  if (ticker && tickerList && !reduceMotion) {
    var tickerInner = document.createElement("div");
    tickerInner.className = "marquee-inner";
    tickerList.parentNode.insertBefore(tickerInner, tickerList);
    tickerInner.appendChild(tickerList);
    var tickerCopy = tickerList.cloneNode(true);
    tickerCopy.setAttribute("aria-hidden", "true");
    tickerCopy.removeAttribute("aria-label");
    tickerInner.appendChild(tickerCopy);
    ticker.classList.add("is-ticker");

    var tickerToggle = document.createElement("button");
    tickerToggle.type = "button";
    tickerToggle.className = "marquee-toggle";
    tickerToggle.textContent = "Pause";
    tickerToggle.setAttribute("aria-pressed", "false");
    tickerToggle.addEventListener("click", function () {
      var paused = ticker.classList.toggle("is-paused");
      tickerToggle.textContent = paused ? "Play" : "Pause";
      tickerToggle.setAttribute("aria-pressed", String(paused));
    });
    ticker.appendChild(tickerToggle);
  }

  /* -------------------------------------------------------
     Count-up for the numbers in the at-a-glance strip
  ------------------------------------------------------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll(".glance strong[data-count]"));
  if (!reduceMotion && "IntersectionObserver" in window && counters.length) {
    var runCount = function (node) {
      var target = Number(node.getAttribute("data-count"));
      var startTime = null;
      var step = function (now) {
        if (startTime === null) startTime = now;
        var progress = Math.min(1, (now - startTime) / 1100);
        node.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          node.textContent = String(target);
        }
      };
      window.requestAnimationFrame(step);
    };

    var countObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          runCount(entry.target);
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach(function (node) {
      node.textContent = "0";
      countObserver.observe(node);
    });
  }

  /* -------------------------------------------------------
     Hero: leaves drift toward the pointer, and the focus line
     briefly cycles through target roles before settling.
  ------------------------------------------------------- */
  var heroSection = document.querySelector(".hero");
  if (heroSection && !reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var heroFrame = false;
    var heroEvent = null;
    heroSection.addEventListener(
      "pointermove",
      function (event) {
        heroEvent = event;
        if (heroFrame) return;
        heroFrame = true;
        window.requestAnimationFrame(function () {
          heroFrame = false;
          var box = heroSection.getBoundingClientRect();
          var x = ((heroEvent.clientX - box.left) / box.width - 0.5) * 2;
          var y = ((heroEvent.clientY - box.top) / box.height - 0.5) * 2;
          heroSection.style.setProperty("--hx", x.toFixed(3));
          heroSection.style.setProperty("--hy", y.toFixed(3));
        });
      },
      { passive: true }
    );
    heroSection.addEventListener("pointerleave", function () {
      heroSection.style.setProperty("--hx", "0");
      heroSection.style.setProperty("--hy", "0");
    });
  }

  var focusLine = document.querySelector(".hero-focus[data-rotate]");
  if (focusLine && !reduceMotion) {
    var finalText = focusLine.textContent;
    var phrases = focusLine.getAttribute("data-rotate").split("|");
    var clipNode = document.createElement("span");
    clipNode.className = "rotator-clip";
    var spanNode = document.createElement("span");
    spanNode.className = "rotator";
    spanNode.textContent = phrases[0];
    clipNode.appendChild(spanNode);
    focusLine.textContent = "Focused on ";
    focusLine.appendChild(clipNode);

    var phraseIndex = 0;
    var cycle = function () {
      spanNode.classList.add("is-out");
      window.setTimeout(function () {
        phraseIndex += 1;
        if (phraseIndex >= phrases.length) {
          focusLine.textContent = finalText;
          return;
        }
        spanNode.textContent = phrases[phraseIndex];
        spanNode.classList.remove("is-out");
        spanNode.classList.add("is-pre");
        void spanNode.offsetWidth; // apply the start position before animating in
        spanNode.classList.remove("is-pre");
        window.setTimeout(cycle, 900);
      }, 200);
    };
    window.setTimeout(cycle, 1500);
  }

  /* -------------------------------------------------------
     Accent color picker. The saved choice is applied by a tiny
     inline script in <head> (so there is no flash); this wires
     up the menu and saves new choices.
  ------------------------------------------------------- */
  var ACCENT_KEY = "portfolio-accent";
  var accentToggle = document.getElementById("accent-toggle");
  var accentMenu = document.getElementById("accent-menu");

  if (accentToggle && accentMenu) {
    var accentSwatches = Array.prototype.slice.call(accentMenu.querySelectorAll("[data-accent]"));

    var setAccent = function (name) {
      if (name === "green") {
        root.removeAttribute("data-accent");
      } else {
        root.setAttribute("data-accent", name);
      }
      accentSwatches.forEach(function (swatch) {
        swatch.setAttribute("aria-pressed", String(swatch.getAttribute("data-accent") === name));
      });
      try {
        localStorage.setItem(ACCENT_KEY, name);
      } catch (e) {
        /* storage unavailable: the choice just won't persist */
      }
    };

    var closeAccentMenu = function (returnFocus) {
      accentMenu.hidden = true;
      accentToggle.setAttribute("aria-expanded", "false");
      if (returnFocus) accentToggle.focus();
    };

    var current = root.getAttribute("data-accent") || "green";
    accentSwatches.forEach(function (swatch) {
      swatch.setAttribute("aria-pressed", String(swatch.getAttribute("data-accent") === current));
      swatch.addEventListener("click", function () {
        setAccent(swatch.getAttribute("data-accent"));
      });
    });

    accentToggle.addEventListener("click", function () {
      var open = accentMenu.hidden;
      accentMenu.hidden = !open;
      accentToggle.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", function (event) {
      if (!accentMenu.hidden && !accentMenu.contains(event.target) && !accentToggle.contains(event.target)) {
        closeAccentMenu(false);
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !accentMenu.hidden) closeAccentMenu(true);
    });
  }

  /* -------------------------------------------------------
     Ambient animations (leaf sway, ticker, glow, pulse) start only after
     the page has settled, so they never compete with loading.
  ------------------------------------------------------- */
  if (!reduceMotion) {
    var goLive = function () {
      window.setTimeout(function () {
        root.classList.add("is-live");
      }, 1800);
    };
    if (document.readyState === "complete") {
      goLive();
    } else {
      window.addEventListener("load", goLive);
    }
  }

  /* -------------------------------------------------------
     Project previews: each browser mockup is a short loop of real
     screenshots (the page's own image first, then the extras listed in
     data-frames) that cross-fade while the card is on screen. Extra
     frames load only after the page has settled. Skipped for reduced
     motion, and paused while the pointer is over the mockup.
  ------------------------------------------------------- */
  var storyboards = Array.prototype.slice.call(document.querySelectorAll(".browser[data-frames]"));
  if (storyboards.length && !reduceMotion && "IntersectionObserver" in window) {
    var FRAME_MS = 2800;

    var setupStoryboard = function (browser) {
      var base = browser.querySelector("img");
      if (!base) return;
      var screen = document.createElement("div");
      screen.className = "browser-screen";
      base.parentNode.insertBefore(screen, base);
      screen.appendChild(base);

      var overlays = browser
        .getAttribute("data-frames")
        .split(",")
        .map(function (src) {
          var img = document.createElement("img");
          img.className = "frame";
          img.alt = "";
          img.setAttribute("aria-hidden", "true");
          img.width = base.width || 799;
          img.height = base.height || 506;
          img.decoding = "async";
          img.src = src;
          screen.appendChild(img);
          return img;
        });

      var current = 0;
      var visible = false;
      var hovering = false;
      var timer = null;

      var show = function (index) {
        current = index;
        if (index === 0) {
          overlays.forEach(function (img) {
            img.classList.remove("is-on");
          });
          return;
        }
        overlays[index - 1].classList.add("is-on");
        window.setTimeout(function () {
          overlays.forEach(function (img, i) {
            if (i !== current - 1) img.classList.remove("is-on");
          });
        }, 900);
      };

      var tick = function () {
        if (!visible || hovering || document.hidden) return;
        show((current + 1) % (overlays.length + 1));
      };

      var stage = browser.closest(".device-stage") || browser;
      stage.addEventListener("pointerenter", function () {
        hovering = true;
      });
      stage.addEventListener("pointerleave", function () {
        hovering = false;
      });

      new IntersectionObserver(
        function (entries) {
          visible = entries[0].isIntersecting;
          if (visible && timer === null) {
            timer = window.setInterval(tick, FRAME_MS);
          } else if (!visible && timer !== null) {
            window.clearInterval(timer);
            timer = null;
          }
        },
        { threshold: 0.5 }
      ).observe(browser);
    };

    var startStoryboards = function () {
      storyboards.forEach(function (browser, i) {
        window.setTimeout(function () {
          setupStoryboard(browser);
        }, i * 700);
      });
    };

    if (root.classList.contains("is-live")) {
      startStoryboards();
    } else {
      var liveWatch = new MutationObserver(function () {
        if (root.classList.contains("is-live")) {
          liveWatch.disconnect();
          startStoryboards();
        }
      });
      liveWatch.observe(root, { attributes: true, attributeFilter: ["class"] });
    }
  }

  /* -------------------------------------------------------
     Scroll progress bar and header shadow
  ------------------------------------------------------- */
  var progressBar = document.createElement("div");
  progressBar.className = "scroll-progress";
  progressBar.setAttribute("aria-hidden", "true");
  document.body.appendChild(progressBar);

  var siteHeader = document.querySelector(".site-header");
  var timelines = document.querySelectorAll(".timeline");
  var scrollTicking = false;

  function onScrollFrame() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    progressBar.style.setProperty("--p", max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0);
    if (siteHeader) siteHeader.classList.toggle("is-scrolled", window.scrollY > 8);
    Array.prototype.forEach.call(timelines, function (line) {
      var box = line.getBoundingClientRect();
      var fill = (window.innerHeight * 0.6 - box.top) / Math.max(box.height, 1);
      line.style.setProperty("--tl", Math.max(0, Math.min(1, fill)).toFixed(3));
    });
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
     Experience filter. Each role carries data-tags in the HTML,
     so the roles stay the single source of truth. Without JS
     every role simply shows.
  ------------------------------------------------------- */
  var roleList = document.querySelector("#experience .timeline");
  var roleItems = roleList
    ? Array.prototype.slice.call(roleList.querySelectorAll(".timeline-item[data-tags]"))
    : [];

  if (roleList && roleItems.length) {
    var ROLE_FILTERS = [
      ["it", "IT and web", "IT and web"],
      ["records", "Records and systems", "records and systems"],
      ["leadership", "Leadership", "leadership"],
      ["customer", "Customer service", "customer service"]
    ];
    var activeRoleTag = null;

    var mk = function (tag, className, text) {
      var node = document.createElement(tag);
      if (className) node.className = className;
      if (text) node.textContent = text;
      return node;
    };
    var roleHasTag = function (item, tag) {
      return item.getAttribute("data-tags").split(/\s+/).indexOf(tag) !== -1;
    };

    var filterBar = mk("div", "role-filters");
    filterBar.setAttribute("role", "group");
    filterBar.setAttribute("aria-label", "Filter roles by type of experience");

    var roleChips = [];
    var addChip = function (tag, label, phrase) {
      var count = tag
        ? roleItems.filter(function (item) { return roleHasTag(item, tag); }).length
        : roleItems.length;
      if (!count) return;
      var chip = mk("button", "role-chip", label + " (" + count + ")");
      chip.type = "button";
      chip.setAttribute("aria-pressed", "false");
      chip.addEventListener("click", function () {
        applyRoleFilter(activeRoleTag === tag ? null : tag);
      });
      filterBar.appendChild(chip);
      roleChips.push({ tag: tag, label: label, phrase: phrase, chip: chip });
    };
    addChip(null, "All roles", "");
    ROLE_FILTERS.forEach(function (pair) { addChip(pair[0], pair[1], pair[2]); });

    var roleStatus = mk("p", "role-status");
    roleStatus.setAttribute("role", "status");
    roleStatus.setAttribute("aria-live", "polite");

    var applyRoleFilter = function (tag) {
      activeRoleTag = tag;
      var shown = 0;
      roleItems.forEach(function (item) {
        var match = !tag || roleHasTag(item, tag);
        item.hidden = !match;
        if (match) shown += 1;
      });
      var activeLabel = "";
      roleChips.forEach(function (entry) {
        var on = entry.tag === tag;
        entry.chip.setAttribute("aria-pressed", String(on));
        if (on && tag) activeLabel = entry.phrase;
      });
      roleStatus.textContent = tag
        ? "Showing " + shown + " of " + roleItems.length + " roles with " + activeLabel + " experience."
        : "Showing all " + roleItems.length + " roles.";
      onScrollFrame();
    };

    roleList.parentNode.insertBefore(filterBar, roleList);
    roleList.parentNode.insertBefore(roleStatus, roleList);
    applyRoleFilter(null);
  }

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
    ["sql", "SQL and relational databases"],
    ["testing", "Automated testing"],
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
      if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email)) {
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
