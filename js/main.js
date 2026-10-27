/*
 * Page wiring: builds the story steps, the stats, the season chart, the
 * variety cards and the bite-the-mango finale from js/data.js.
 */
(function () {
  "use strict";

  var D = window.MOGANGO;
  var fmt = new Intl.NumberFormat("en");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
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
  function sum(list, key) { return list.reduce(function (a, b) { return a + b[key]; }, 0); }

  document.querySelectorAll("[data-bind]").forEach(function (n) {
    var v = D[n.getAttribute("data-bind")];
    if (v != null) n.textContent = v;
  });
  $("#year").textContent = new Date().getFullYear();

  var totals = {
    hectares: sum(D.plantations, "hectares"),
    trees: sum(D.plantations, "trees"),
    tonnes: sum(D.harvest, "tonnes"),
    shops: D.shops.length,
    since: Math.min.apply(null, D.plantations.map(function (p) { return p.since; }))
  };

  // ---- Story -------------------------------------------------------------

  $("#map-credit").textContent = D.map.credit;
  $("#footer-credit").textContent = "Map: " + D.map.credit;
  var map = new window.IslandMap($("#map"), D, window.MOGANGO_ROUTE);
  var island = map.islandView;
  var road = map.routeLen;
  var followSpan = map.units(13000);

  var steps = [];
  steps.push({
    label: "The island",
    scene: { mode: "overview", view: island },
    html: "<p class='kicker'>Welcome</p><h2>This is " + esc(D.islandName) + ".</h2>" +
      "<p>Our family has grown mangoes here for more than " + (new Date().getFullYear() - totals.since) +
      " years, in the warm valleys of the island's south and west. Scroll down and we'll fly you over every one of our groves, then ride along with the truck that takes the fruit to market.</p>"
  });

  D.plantations.forEach(function (p, i) {
    var chips = "<ul class='chips'>" +
      "<li><b>" + fmt.format(p.hectares) + "</b> hectares</li>" +
      "<li><b>" + fmt.format(p.trees) + "</b> trees</li>" +
      "<li>Since <b>" + p.since + "</b></li></ul>";
    steps.push({
      label: p.name,
      plantation: p.id,
      scene: { mode: "plantation", plantation: p.id, view: map.viewAt(p.lon, p.lat, 7000) },
      html: "<p class='kicker'>Grove " + (i + 1) + " of " + D.plantations.length + " · " + esc(p.region) + "</p>" +
        "<h2>" + esc(p.name) + "</h2><p>" + esc(p.blurb) + "</p>" + chips +
        "<p class='varieties-line'>Grows: " + p.varieties.map(function (v) { return "<span class='tag'>" + esc(v) + "</span>"; }).join(" ") + "</p>"
    });
  });

  steps.push({
    label: "All five groves",
    scene: { mode: "all", view: island },
    html: "<p class='kicker'>Together</p><h2>" + D.plantations.length + " groves, one family.</h2>" +
      "<p>That's <b>" + fmt.format(totals.hectares) + " hectares</b> and <b>" + fmt.format(totals.trees) +
      " trees</b> spread across the island. Different soils and different winds give each grove its own flavour.</p>"
  });

  var ph = D.packingHouse;
  steps.push({
    label: ph.name,
    scene: { mode: "packing", view: map.viewAt(ph.lon, ph.lat, 6000) },
    html: "<p class='kicker'>Harvest day</p><h2>" + esc(ph.name) + "</h2><p>" + esc(ph.blurb) + "</p>"
  });

  steps.push({
    label: "On the road",
    scene: { mode: "delivery", truck: 0, follow: followSpan },
    html: "<p class='kicker'>Loaded up</p><h2>The truck heads out.</h2>" +
      "<p>Crates in the back, still cool from the morning. Keep scrolling to ride along.</p>"
  });

  D.shops.forEach(function (s, i) {
    steps.push({
      label: s.name,
      shop: i,
      scene: { mode: "delivery", shop: i, truck: map.shopLens[i], follow: followSpan },
      html: "<p class='kicker'>Stop " + (i + 1) + " of " + D.shops.length + " · " + esc(s.town) + "</p>" +
        "<h2>" + esc(s.name) + "</h2>" +
        "<p>" + (i === D.shops.length - 1
          ? "Last stop. The truck is empty and the shelves are full."
          : "Crates unloaded, and the first customers are already picking their mango.") + "</p>"
    });
  });

  steps.push({
    label: "Delivered",
    scene: { mode: "finale", truck: road, view: island },
    html: "<p class='kicker'>Delivered</p><h2>From our trees to your table.</h2>" +
      "<p>Every week of the season the truck makes this " + Math.round(map.routeLen * map.metersPerUnit / 1000) + " km loop around the island, so the mangoes you buy were usually on the tree two days before.</p>" +
      "<a class='btn' href='#numbers'>See the numbers</a>"
  });

  var stepsRoot = $("#steps"), rail = $("#rail");
  steps.forEach(function (s, i) {
    var sec = h("section", "step");
    sec.id = "step-" + i;
    sec.dataset.index = i;
    var card = h("div", "card", s.html);
    sec.appendChild(card);
    stepsRoot.appendChild(sec);
    s.el = sec;

    var dot = h("a", "rail-dot");
    dot.href = "#step-" + i;
    dot.title = s.label;
    dot.setAttribute("aria-label", "Go to: " + s.label);
    dot.addEventListener("click", function (e) { e.preventDefault(); goToStep(i); });
    rail.appendChild(dot);
    s.dot = dot;
  });

  var active = -1;
  function activate(i) {
    if (i === active) return;
    active = i;
    var s = steps[i];
    map.setScene(s.scene);
    steps.forEach(function (o, k) {
      o.el.classList.toggle("is-active", k === i);
      o.dot.classList.toggle("is-active", k === i);
      if (k === i) o.dot.setAttribute("aria-current", "step"); else o.dot.removeAttribute("aria-current");
    });
    $("#hud-label").textContent = s.label;
    $("#hud-bar").style.width = ((i + 1) / steps.length * 100) + "%";
  }

  function goToStep(i) {
    steps[i].el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }

  // A step becomes active when its card crosses the middle of the screen.
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

  // ---- Numbers -----------------------------------------------------------

  var stats = [
    { value: totals.hectares, label: "hectares of orchard" },
    { value: totals.trees, label: "mango trees" },
    { value: totals.tonnes, label: "tonnes a season" },
    { value: totals.shops, label: "shops on our route" }
  ];
  var statsRoot = $("#stats");
  stats.forEach(function (s) {
    var tile = h("div", "stat", "<span class='stat-value' data-to='" + s.value + "'>0</span><span class='stat-label'>" + esc(s.label) + "</span>");
    statsRoot.appendChild(tile);
  });
  function countUp(node) {
    var to = +node.dataset.to;
    if (reduceMotion) { node.textContent = fmt.format(to); return; }
    var start = performance.now(), dur = 1600;
    (function frame(now) {
      var t = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - t, 3);
      node.textContent = fmt.format(Math.round(to * e));
      if (t < 1) requestAnimationFrame(frame);
    })(start);
  }
  var statsIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      statsRoot.querySelectorAll(".stat-value").forEach(countUp);
      statsIo.disconnect();
    });
  }, { threshold: 0.4 });
  statsIo.observe(statsRoot);

  // ---- Season chart ------------------------------------------------------

  var chartRoot = $("#chart");
  var tip = h("div", "tip");
  tip.setAttribute("role", "status");
  chartRoot.appendChild(tip);
  var peak = D.harvest.reduce(function (a, b) { return b.tonnes > a.tonnes ? b : a; });
  $("#chart-note").textContent = "Peak season is " + peak.month + ", with " + fmt.format(peak.tonnes) + " tonnes picked.";

  var table = $("#chart-table");
  table.innerHTML = "<thead><tr><th scope='col'>Month</th><th scope='col'>Tonnes</th></tr></thead><tbody>" +
    D.harvest.map(function (m) { return "<tr><td>" + m.month + "</td><td>" + fmt.format(m.tonnes) + "</td></tr>"; }).join("") + "</tbody>";

  // A round tick step (1, 2 or 5 × 10ⁿ) giving about four gridlines.
  function niceStep(v) {
    var raw = v / 4, p = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
  }

  function drawChart() {
    var old = chartRoot.querySelector("svg");
    if (old) old.remove();
    var W = chartRoot.clientWidth, H = Math.max(240, Math.min(340, W * 0.5));
    var m = { t: 24, r: 8, b: 28, l: 40 };
    var iw = W - m.l - m.r, ih = H - m.t - m.b;
    var step = niceStep(peak.tonnes), ticks = Math.ceil(peak.tonnes / step), max = step * ticks;
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("width", W);
    svg.setAttribute("height", H);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Bar chart of tonnes harvested per month. " + $("#chart-note").textContent);
    var out = "";
    for (var t = 0; t <= ticks; t++) {
      var v = step * t, y = m.t + ih - ih * t / ticks;
      out += "<line class='grid" + (t === 0 ? " base" : "") + "' x1='" + m.l + "' x2='" + (W - m.r) + "' y1='" + y + "' y2='" + y + "'/>";
      out += "<text class='axis' x='" + (m.l - 8) + "' y='" + (y + 4) + "' text-anchor='end'>" + fmt.format(v) + "</text>";
    }
    var band = iw / D.harvest.length, bw = Math.min(36, band * 0.62);
    D.harvest.forEach(function (d, i) {
      var x = m.l + band * i + (band - bw) / 2, bh = ih * d.tonnes / max, y = m.t + ih - bh, r = Math.min(4, bh, bw / 2);
      var path = bh > 0
        ? "M" + x + " " + (m.t + ih) + " V" + (y + r) + " Q" + x + " " + y + " " + (x + r) + " " + y + " H" + (x + bw - r) + " Q" + (x + bw) + " " + y + " " + (x + bw) + " " + (y + r) + " V" + (m.t + ih) + " Z"
        : "";
      out += "<g class='bar-g' data-i='" + i + "'>" +
        "<rect class='hit' x='" + (m.l + band * i) + "' y='" + m.t + "' width='" + band + "' height='" + ih + "'/>" +
        (path ? "<path class='bar' style='--i:" + i + "' d='" + path + "'/>" : "") +
        "<text class='axis' x='" + (x + bw / 2) + "' y='" + (H - 8) + "' text-anchor='middle'>" + d.month + "</text></g>";
      if (d === peak) {
        out += "<text class='peak-lbl' x='" + (x + bw / 2) + "' y='" + (y - 8) + "' text-anchor='middle'>" + fmt.format(d.tonnes) + " t</text>";
      }
    });
    svg.innerHTML = out;
    chartRoot.insertBefore(svg, tip);

    function show(g) {
      var d = D.harvest[+g.dataset.i];
      svg.querySelectorAll(".bar-g").forEach(function (o) { o.classList.toggle("is-dim", o !== g); });
      tip.innerHTML = "<b>" + d.month + "</b><span>" + fmt.format(d.tonnes) + " tonnes</span>";
      var box = g.querySelector(".hit").getBBox();
      tip.style.left = Math.max(60, Math.min(W - 60, box.x + box.width / 2)) + "px";
      tip.style.top = (m.t + ih * (1 - d.tonnes / max) - (d === peak ? 22 : 0)) + "px";
      tip.classList.add("is-on");
    }
    function hide() {
      svg.querySelectorAll(".bar-g").forEach(function (o) { o.classList.remove("is-dim"); });
      tip.classList.remove("is-on");
    }
    svg.querySelectorAll(".bar-g").forEach(function (g) {
      g.addEventListener("pointerenter", function () { show(g); });
      g.addEventListener("click", function () { show(g); });
    });
    svg.addEventListener("pointerleave", hide);
  }
  drawChart();
  var chartIo = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) { chartRoot.classList.add("is-in"); chartIo.disconnect(); }
  }, { threshold: 0.3 });
  chartIo.observe(chartRoot);
  var resizeT;
  window.addEventListener("resize", function () { clearTimeout(resizeT); resizeT = setTimeout(drawChart, 150); });

  // ---- Varieties ---------------------------------------------------------

  var grid = $("#variety-grid");
  D.varieties.forEach(function (v) {
    var groves = D.plantations.filter(function (p) { return p.varieties.indexOf(v.name) >= 0; });
    var card = h("button", "variety");
    card.type = "button";
    card.setAttribute("aria-pressed", "false");
    card.innerHTML =
      "<span class='variety-inner'>" +
      "<span class='variety-face front'>" +
      "<svg viewBox='0 0 120 130' aria-hidden='true'>" +
      "<path d='M70 12 C 100 16 116 50 112 82 C 107 114 80 127 52 125 C 24 123 6 100 11 74 C 16 50 32 42 44 28 C 52 18 58 10 70 12 Z' fill='" + v.color + "'/>" +
      "<path d='M70 12 C 100 16 116 50 112 82 C 100 70 92 40 70 12 Z' fill='" + v.blush + "' opacity='.75'/>" +
      "<path d='M69 13 C 70 7 74 3 79 1' stroke='#6b4423' stroke-width='4' fill='none' stroke-linecap='round'/>" +
      "<path d='M74 6 C 90 -4 104 2 108 6 C 98 16 84 14 74 6 Z' fill='#3f8f3a'/></svg>" +
      "<span class='variety-name'>" + esc(v.name) + "</span>" +
      "<span class='variety-taste'>" + esc(v.taste) + "</span></span>" +
      "<span class='variety-face back'><span class='variety-name'>" + esc(v.name) + "</span>" +
      "<span class='variety-taste'>Grows at:</span><span class='variety-groves'>" +
      groves.map(function (p) { return "<a href='#' data-grove='" + p.id + "'>" + esc(p.name) + "</a>"; }).join("") +
      "</span></span></span>";
    card.addEventListener("click", function (e) {
      var link = e.target.closest("[data-grove]");
      if (link) {
        e.preventDefault();
        var idx = steps.findIndex(function (s) { return s.plantation === link.dataset.grove; });
        if (idx >= 0) goToStep(idx);
        return;
      }
      var on = card.classList.toggle("is-flipped");
      card.setAttribute("aria-pressed", String(on));
    });
    grid.appendChild(card);
  });

  // ---- Bite the mango ----------------------------------------------------

  var BITES = [
    [262, 150, 42], [236, 252, 48], [128, 292, 50], [36, 210, 50],
    [70, 96, 50], [190, 46, 52], [150, 170, 120]
  ];
  var bitesG = $("#bites"), mango = $("#bite-mango"), bitesNo = 0;
  var messages = ["Mmm.", "So juicy.", "It's running down your chin.", "Don't stop now.", "Almost there.", "One more..."];
  var svgNS = "http://www.w3.org/2000/svg";

  // The seed sits under the fruit and shows up as the bites uncover it.
  var seed = document.createElementNS(svgNS, "g");
  seed.innerHTML = "<ellipse cx='150' cy='170' rx='40' ry='68' fill='#f6e7b0'/>" +
    "<path d='M150 108 V232 M128 130 Q150 150 172 130 M124 165 Q150 185 176 165 M128 200 Q150 218 172 200' stroke='#e2c77a' stroke-width='3' fill='none'/>";
  var mangoSvg = mango.querySelector("svg");
  mangoSvg.insertBefore(seed, mangoSvg.querySelector("g[mask]"));

  function bite() {
    if (bitesNo >= BITES.length) return;
    var b = BITES[bitesNo++], cx = b[0], cy = b[1], r = b[2];
    var g = document.createElementNS(svgNS, "g");
    // A bite is a big circle with smaller tooth marks along its edge.
    var shapes = "<circle cx='" + cx + "' cy='" + cy + "' r='" + r + "'/>";
    for (var k = 0; k < 5; k++) {
      var a = Math.atan2(150 - cy, 160 - cx) + (k - 2) * 0.32;
      shapes += "<circle cx='" + (cx + Math.cos(a) * r * 0.92) + "' cy='" + (cy + Math.sin(a) * r * 0.92) + "' r='" + (r * 0.22) + "'/>";
    }
    g.innerHTML = shapes;
    g.setAttribute("fill", "#000");
    g.setAttribute("class", "bite");
    bitesG.appendChild(g);
    mango.classList.remove("is-crunch");
    void mango.getBoundingClientRect();
    mango.classList.add("is-crunch");
    var done = bitesNo >= BITES.length;
    $("#bite-count").textContent = done
      ? "Only the seed is left. That's the sign of a good mango."
      : messages[Math.min(bitesNo - 1, messages.length - 1)];
    $("#new-mango").hidden = !done;
    mango.setAttribute("aria-label", done ? "Mango finished" : "Take another bite");
  }
  mango.addEventListener("click", bite);
  $("#new-mango").addEventListener("click", function () {
    bitesG.innerHTML = "";
    bitesNo = 0;
    $("#bite-count").textContent = "";
    this.hidden = true;
    mango.setAttribute("aria-label", "Take a bite of the mango");
    mango.focus();
  });

  // ---- Footer ------------------------------------------------------------

  var c = D.contact;
  $("#contact-lines").innerHTML = esc(c.address) + "<br><a href='mailto:" + esc(c.email) + "'>" + esc(c.email) + "</a><br>" + esc(c.phone);
  $("#shop-list").innerHTML = D.shops.map(function (s) {
    return "<li><b>" + esc(s.name) + "</b><span>" + esc(s.town) + "</span></li>";
  }).join("");
})();
