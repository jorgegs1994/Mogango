/*
 * Page wiring: fills the page from js/data.js and builds the tour steps,
 * the numbers, the season strip, the variety panels and the footer.
 * Scroll effects live in js/motion.js; this file works without them.
 */
(function () {
  "use strict";

  var D = window.MOGANGO;
  var fmt = new Intl.NumberFormat("en");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function h(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  // *word* sets italics, _word_ sets the orange accent, \n breaks the line.
  function rich(s) {
    return esc(s)
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/_([^_]+)_/g, "<em class='accent'>$1</em>")
      .replace(/\n/g, "<br>");
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function sum(list, key) { return list.reduce(function (a, b) { return a + b[key]; }, 0); }

  // Smooth scrolling comes from js/motion.js when it runs.
  function scrollToEl(el) {
    if (window.mogangoScrollTo) window.mogangoScrollTo(el);
    else el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  $$("[data-bind]").forEach(function (n) {
    var v = D[n.getAttribute("data-bind")];
    if (v != null) n.textContent = v;
  });
  $$("[data-copy]").forEach(function (n) {
    var v = D.copy[n.getAttribute("data-copy")];
    if (v != null) n.innerHTML = rich(v);
  });
  $("#year").textContent = new Date().getFullYear();

  // ---- Photos --------------------------------------------------------------
  // A photo shows a quiet dark block with its intended shot until the file
  // exists in /images.

  function photo(box, p, eager) {
    box.classList.add("photo");
    var img = new Image();
    img.alt = p.alt;
    img.decoding = "async";
    if (eager) img.fetchPriority = "high"; else img.loading = "lazy";
    img.addEventListener("load", function () { box.classList.add("is-loaded"); });
    img.addEventListener("error", function () { box.classList.add("is-missing"); img.remove(); });
    img.src = p.src;
    box.appendChild(img);
    box.appendChild(h("span", "photo-note label", "Photo · " + esc(p.note)));
  }
  $$("[data-photo]").forEach(function (box) {
    photo(box, D.photos[box.getAttribute("data-photo")], box.hasAttribute("data-eager"));
  });

  var totals = {
    hectares: sum(D.plantations, "hectares"),
    trees: sum(D.plantations, "trees"),
    tonnes: sum(D.harvest, "tonnes"),
    shops: D.shops.length,
    since: Math.min.apply(null, D.plantations.map(function (p) { return p.since; }))
  };

  // ---- Island tour ---------------------------------------------------------

  var map = new window.FarmMap($("#map"), D);

  function caption(kicker, title, meta, text, foot) {
    return "<p class='label cap-kicker'>" + kicker + "</p>" +
      "<h3 class='cap-title'><span>" + title + "</span></h3>" +
      (meta ? "<p class='cap-meta'>" + meta + "</p>" : "") +
      (text ? "<p class='cap-text'>" + text + "</p>" : "") +
      (foot ? "<p class='label cap-foot'>" + foot + "</p>" : "");
  }

  var steps = [];
  steps.push({
    label: D.islandName,
    scene: { mode: "overview", view: "island" },
    html: caption(esc(D.copy.tourLabel), esc(D.islandName) + ".", "",
      "For more than " + (new Date().getFullYear() - totals.since) + " years our family has grown mangoes in the warm valleys of the island's south-west. Scroll to fly over every finca, then follow the truck to market.")
  });

  var n = D.plantations.length;
  var WORDS = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
  D.plantations.forEach(function (p, i) {
    steps.push({
      label: p.name,
      plantation: p.id,
      // Each grove gets a slightly different angle, so the flights feel like a tour.
      scene: { mode: "plantation", plantation: p.id, view: { center: [p.lon, p.lat], zoom: 13.6, pitch: 64, bearing: -30 + i * 18 } },
      html: caption("Finca " + pad(i + 1) + " / " + pad(n) + " · " + esc(p.region), esc(p.name),
        fmt.format(p.hectares) + " ha <i>·</i> " + fmt.format(p.trees) + " trees <i>·</i> since " + p.since,
        esc(p.blurb), "Grows " + p.varieties.map(esc).join(", "))
    });
  });

  steps.push({
    label: "All " + n + " fincas",
    scene: { mode: "all", view: "groves" },
    html: caption("Together", (WORDS[n] || n) + " fincas, one family.",
      fmt.format(totals.hectares) + " ha <i>·</i> " + fmt.format(totals.trees) + " trees",
      "Different soils and different winds give each finca its own flavour.")
  });

  var ph = D.packingHouse;
  steps.push({
    label: ph.name,
    scene: { mode: "packing", view: { center: [ph.lon, ph.lat], zoom: 14.2, pitch: 55, bearing: 20 } },
    html: caption("Harvest day", esc(ph.name), "", esc(ph.blurb))
  });

  steps.push({
    label: "On the road",
    scene: { mode: "delivery", truck: "start", follow: true },
    html: caption("Loaded up", "The truck heads out.", "", "Crates in the back, still cool from the morning.")
  });

  D.shops.forEach(function (s, i) {
    steps.push({
      label: s.name,
      shop: i,
      scene: { mode: "delivery", shop: i, truck: i, follow: true },
      html: caption("Stop " + pad(i + 1) + " / " + pad(D.shops.length) + " · " + esc(s.town), esc(s.name), "",
        i === D.shops.length - 1
          ? "Last stop. The truck is empty and the shelves are full."
          : "Crates unloaded, and the first customers are already choosing.")
    });
  });

  steps.push({
    label: "Delivered",
    scene: { mode: "finale", truck: "end", view: "island" },
    html: caption("Delivered", "Two days from branch to shelf.", "",
      "Every week of the season the truck makes this loop around the island.")
  });

  var stepsRoot = $("#steps"), rail = $("#rail");
  $("#hud-total").textContent = pad(steps.length);
  steps.forEach(function (s, i) {
    var sec = h("div", "step");
    sec.id = "step-" + i;
    sec.dataset.index = i;
    sec.appendChild(h("div", "cap", s.html));
    stepsRoot.appendChild(sec);
    s.el = sec;

    var tick = h("a", "rail-tick");
    tick.href = "#step-" + i;
    tick.title = s.label;
    tick.setAttribute("aria-label", "Go to " + s.label);
    tick.addEventListener("click", function (e) { e.preventDefault(); goToStep(i); });
    rail.appendChild(tick);
    s.tick = tick;
  });

  var active = -1;
  function activate(i) {
    if (i === active) return;
    active = i;
    map.setScene(steps[i].scene);
    steps.forEach(function (o, k) {
      o.el.classList.toggle("is-active", k === i);
      o.tick.classList.toggle("is-active", k === i);
      if (k === i) o.tick.setAttribute("aria-current", "step"); else o.tick.removeAttribute("aria-current");
    });
    $("#hud-index").textContent = pad(i + 1);
  }

  function goToStep(i) { scrollToEl(steps[i].el); }

  // A step becomes active when it crosses the middle of the screen.
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) activate(+e.target.dataset.index); });
  }, { rootMargin: "-50% 0px -50% 0px" });
  steps.forEach(function (s) { io.observe(s.el); });
  activate(0);

  map.on("select", function (sel) {
    var idx = steps.findIndex(function (s) {
      return sel.type === "plantation" ? s.plantation === sel.id : s.shop === sel.index;
    });
    if (idx >= 0) goToStep(idx);
  });

  // ---- Numbers -------------------------------------------------------------

  var stats = [
    { value: totals.hectares, label: "Hectares of orchard" },
    { value: totals.trees, label: "Mango trees" },
    { value: totals.tonnes, label: "Tonnes a season" },
    { value: totals.shops, label: "Shops on our route" }
  ];
  var statsRoot = $("#stats");
  stats.forEach(function (s) {
    statsRoot.appendChild(h("div", "stat",
      "<dt class='label'>" + esc(s.label) + "</dt>" +
      "<dd class='stat-value' data-to='" + s.value + "'>" + fmt.format(reduceMotion ? s.value : 0) + "</dd>"));
  });
  function countUp(node) {
    var to = +node.dataset.to, start = performance.now(), dur = 2200;
    (function frame(now) {
      var t = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - t, 4);
      node.textContent = fmt.format(Math.round(to * e));
      if (t < 1) requestAnimationFrame(frame);
    })(start);
  }
  if (!reduceMotion) {
    var statsIo = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      $$(".stat-value", statsRoot).forEach(countUp);
      statsIo.disconnect();
    }, { threshold: 0.35 });
    statsIo.observe(statsRoot);
  }

  // ---- Season strip --------------------------------------------------------
  // Twelve equal columns; the depth of each fill is that month's share of the
  // peak harvest.

  var peak = D.harvest.reduce(function (a, b) { return b.tonnes > a.tonnes ? b : a; });
  var note = "Peak season is " + peak.name + ", with " + fmt.format(peak.tonnes) + " tonnes picked.";
  $("#strip-note").textContent = note;
  var strip = $("#strip");
  strip.setAttribute("aria-label", "Tonnes harvested per month, January to December. " + note);
  strip.innerHTML = D.harvest.map(function (m) {
    var isPeak = m === peak;
    return "<div class='m" + (isPeak ? " is-peak" : "") + (m.tonnes ? "" : " is-zero") + "' style='--v:" + (m.tonnes / peak.tonnes).toFixed(3) + "'>" +
      (isPeak ? "<span class='m-peak label'>Peak · " + fmt.format(m.tonnes) + " t</span>" : "") +
      "<span class='m-fill'></span>" +
      "<span class='m-name label'><b>" + m.month.charAt(0) + "</b><span>" + m.month.slice(1) + "</span></span>" +
      "<span class='m-t'>" + (m.tonnes ? fmt.format(m.tonnes) : "–") + "</span></div>";
  }).join("");
  $("#strip-table").innerHTML = "<caption class='visually-hidden'>Tonnes harvested per month</caption>" +
    "<thead><tr><th scope='col'>Month</th><th scope='col'>Tonnes</th></tr></thead><tbody>" +
    D.harvest.map(function (m) { return "<tr><th scope='row'>" + m.name + "</th><td>" + fmt.format(m.tonnes) + "</td></tr>"; }).join("") + "</tbody>";

  // ---- Varieties -----------------------------------------------------------

  var track = $("#v-track");
  D.varieties.forEach(function (v, i) {
    var groves = D.plantations.filter(function (p) { return p.varieties.indexOf(v.name) >= 0; });
    var panel = h("article", "v-panel v-variety");
    panel.setAttribute("aria-labelledby", "variety-" + i);
    panel.innerHTML =
      "<div class='v-media'></div>" +
      "<div class='v-text'>" +
      "<p class='label'>" + pad(i + 1) + " / " + pad(D.varieties.length) + " <i>·</i> " + esc(v.season) + "</p>" +
      "<h3 class='v-name reveal' id='variety-" + i + "'>" + esc(v.name) + "</h3>" +
      "<p class='v-taste'>" + esc(v.taste) + "</p>" +
      "<p class='label v-grows'>Grows at " + groves.map(function (p) {
        return "<a href='#' data-grove='" + p.id + "'>" + esc(p.name) + "</a>";
      }).join(", ") + "</p></div>";
    photo($(".v-media", panel), v.photo);
    track.appendChild(panel);
  });
  track.addEventListener("click", function (e) {
    var link = e.target.closest("[data-grove]");
    if (!link) return;
    e.preventDefault();
    var idx = steps.findIndex(function (s) { return s.plantation === link.dataset.grove; });
    if (idx >= 0) goToStep(idx);
  });

  // ---- Light and dark ------------------------------------------------------
  // The page takes the colour of whichever section crosses the middle of the
  // screen; css/styles.css fades between them.

  var themeIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) document.documentElement.setAttribute("data-theme", e.target.getAttribute("data-theme"));
    });
  }, { rootMargin: "-50% 0px -50% 0px" });
  $$("[data-theme]", document.body).forEach(function (s) { themeIo.observe(s); });

  // ---- Top bar -------------------------------------------------------------

  var bar = $(".topbar"), lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY, past = y > window.innerHeight * 0.85;
    bar.classList.toggle("is-solid", past);
    if (Math.abs(y - lastY) > 6) {
      bar.classList.toggle("is-hidden", past && y > lastY && !bar.contains(document.activeElement));
      lastY = y;
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---- Footer --------------------------------------------------------------

  var c = D.contact;
  $("#contact-lines").innerHTML = esc(c.address) + "<br><a href='mailto:" + esc(c.email) + "'>" + esc(c.email) + "</a><br>" +
    "<a href='tel:" + esc(c.phone.replace(/\s/g, "")) + "'>" + esc(c.phone) + "</a>";
  $("#shop-list").innerHTML = D.shops.map(function (s) {
    return "<li><span>" + esc(s.name) + "</span><span>" + esc(s.town) + "</span></li>";
  }).join("");
})();
