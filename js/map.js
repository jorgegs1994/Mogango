/*
 * The island map: draws the SVG, moves the camera between places and drives
 * the delivery truck along the road.
 */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var WORLD = { w: 1000, h: 700 };
  var ISLAND_VIEW = { cx: 520, cy: 350, span: 820 };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var ISLAND_OUTLINE = [
    [150, 350], [175, 265], [250, 205], [340, 160], [430, 120], [520, 105],
    [610, 105], [690, 125], [770, 170], [845, 230], [890, 310], [885, 400],
    [850, 470], [780, 535], [690, 580], [580, 598], [470, 595], [360, 585],
    [270, 560], [195, 515], [155, 440]
  ];

  function el(tag, attrs, parent) {
    var node = document.createElementNS(NS, tag);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  // Deterministic random numbers so the trees land in the same place on every visit.
  function seeded(seed) {
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function hashString(str) {
    var h = 7;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 2147483647;
    return h;
  }

  // Catmull-Rom spline through the points, written as cubic Béziers.
  function smoothPath(pts, closed) {
    var n = pts.length;
    var get = function (i) {
      if (closed) return pts[(i + n) % n];
      return pts[Math.max(0, Math.min(n - 1, i))];
    };
    var d = "M" + pts[0][0] + " " + pts[0][1];
    var last = closed ? n : n - 1;
    for (var i = 0; i < last; i++) {
      var p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += "C" + c1x.toFixed(1) + " " + c1y.toFixed(1) + " " + c2x.toFixed(1) + " " +
        c2y.toFixed(1) + " " + p2[0] + " " + p2[1];
    }
    return closed ? d + "Z" : d;
  }

  function blob(cx, cy, r, rand, points) {
    var pts = [];
    points = points || 9;
    for (var i = 0; i < points; i++) {
      var a = (i / points) * Math.PI * 2;
      var rr = r * (0.82 + rand() * 0.3);
      pts.push([+(cx + Math.cos(a) * rr).toFixed(1), +(cy + Math.sin(a) * rr * 0.85).toFixed(1)]);
    }
    return smoothPath(pts, true);
  }

  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function IslandMap(svg, data, opts) {
    this.svg = svg;
    this.data = data;
    this.opts = opts || {};
    this.cam = { cx: ISLAND_VIEW.cx, cy: ISLAND_VIEW.cy, span: ISLAND_VIEW.span };
    this.flight = null;
    this.follow = null;
    this.truckLen = 0;
    this.truckDrive = null;
    this.shopLens = [];
    this.build();
    this.measure();
    this.applyCamera();
    var self = this;
    window.addEventListener("resize", function () { self.measure(); self.applyCamera(); });
    this.tick = this.tick.bind(this);
    requestAnimationFrame(this.tick);
  }

  IslandMap.ISLAND_VIEW = ISLAND_VIEW;

  IslandMap.prototype.build = function () {
    var svg = this.svg, d = this.data, self = this;
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    var defs = el("defs", {}, svg);
    var waves = el("pattern", { id: "waves", width: 60, height: 30, patternUnits: "userSpaceOnUse" }, defs);
    el("path", { d: "M0 15 Q 7.5 9 15 15 T 30 15", class: "wave" }, waves);
    el("path", { d: "M30 30 Q 37.5 24 45 30 T 60 30", class: "wave" }, waves);
    var land = el("radialGradient", { id: "land-grad", cx: ".5", cy: ".45", r: ".6" }, defs);
    el("stop", { offset: "0", "stop-color": "#b9d98a" }, land);
    el("stop", { offset: "1", "stop-color": "#8fc26a" }, land);
    var grove = el("radialGradient", { id: "grove-grad" }, defs);
    el("stop", { offset: "0", "stop-color": "#4c9a3c" }, grove);
    el("stop", { offset: "1", "stop-color": "#3a8231" }, grove);

    // Sea
    el("rect", { x: -3000, y: -3000, width: 7000, height: 7000, class: "sea" }, svg);
    el("rect", { x: -3000, y: -3000, width: 7000, height: 7000, fill: "url(#waves)", class: "sea-waves" }, svg);

    // Island
    var outline = smoothPath(ISLAND_OUTLINE, true);
    el("path", { d: outline, class: "shallows" }, svg);
    el("path", { d: outline, class: "shore" }, svg);
    el("path", { d: outline, class: "land" }, svg);

    var scenery = el("g", { class: "scenery" }, svg);
    el("path", { d: "M560 300 C 520 330 470 300 440 330 C 410 360 430 400 395 430 C 370 455 300 470 280 530 C 275 545 272 552 270 560", class: "river" }, scenery);

    // Wild trees scattered over the land, avoiding the groves.
    var rand = seeded(1978);
    var wild = el("g", { class: "wild-trees" }, scenery);
    for (var i = 0; i < 160; i++) {
      var x = 170 + rand() * 700, y = 120 + rand() * 470;
      if (!this.insideIsland(x, y, 24)) continue;
      if (d.plantations.some(function (p) { return Math.hypot(p.x - x, p.y - y) < p.radius + 14; })) continue;
      if (Math.hypot(d.packingHouse.x - x, d.packingHouse.y - y) < 30) continue;
      if (Math.hypot(d.mountain.x - x, d.mountain.y - y) < 60) continue;
      el("circle", { cx: x.toFixed(1), cy: y.toFixed(1), r: (2.5 + rand() * 2.5).toFixed(1) }, wild);
    }

    // Mountain
    var m = d.mountain, mg = el("g", { class: "mountain" }, scenery);
    el("path", { d: "M" + (m.x - 70) + " " + (m.y + 30) + " L" + (m.x - 25) + " " + (m.y - 35) + " L" + (m.x) + " " + (m.y - 10) + " L" + (m.x + 28) + " " + (m.y - 50) + " L" + (m.x + 75) + " " + (m.y + 30) + " Z", class: "rock" }, mg);
    el("path", { d: "M" + (m.x + 14) + " " + (m.y - 30) + " L" + (m.x + 28) + " " + (m.y - 50) + " L" + (m.x + 42) + " " + (m.y - 30) + " L" + (m.x + 34) + " " + (m.y - 34) + " L" + (m.x + 28) + " " + (m.y - 27) + " L" + (m.x + 22) + " " + (m.y - 34) + " Z", class: "peak" }, mg);
    this.label(mg, m.name, m.x + 4, m.y + 48, "lbl lbl-sm");

    // Road
    var routeD = smoothPath(d.route, false);
    var roads = el("g", { class: "roads" }, svg);
    el("path", { d: routeD, class: "road-edge" }, roads);
    el("path", { d: routeD, class: "road" }, roads);
    this.driven = el("path", { d: routeD, class: "road-driven" }, roads);
    this.routePath = this.driven;
    this.routeLen = this.routePath.getTotalLength();
    this.driven.style.strokeDasharray = this.routeLen + " " + this.routeLen;
    this.driven.style.strokeDashoffset = this.routeLen;

    // Groves
    this.groveEls = {};
    var groves = el("g", { class: "groves" }, svg);
    d.plantations.forEach(function (p) {
      var r = seeded(hashString(p.id));
      var g = el("g", { class: "grove", "data-id": p.id, tabindex: 0, role: "button", "aria-label": p.name + ", " + p.region }, groves);
      el("path", { d: blob(p.x, p.y, p.radius + 8, r, 10), class: "grove-glow" }, g);
      el("path", { d: blob(p.x, p.y, p.radius, r, 10), class: "grove-area" }, g);
      // Trees on a jittered grid, in neat orchard rows.
      var trees = el("g", { class: "grove-trees" }, g);
      var step = 9;
      for (var gy = p.y - p.radius; gy <= p.y + p.radius; gy += step) {
        for (var gx = p.x - p.radius; gx <= p.x + p.radius; gx += step) {
          var dx = (gx - p.x) / p.radius, dy = (gy - p.y) / (p.radius * 0.85);
          if (dx * dx + dy * dy > 0.62) continue;
          var tx = gx + (r() - 0.5) * 2.5, ty = gy + (r() - 0.5) * 2.5;
          el("circle", { cx: tx.toFixed(1), cy: ty.toFixed(1), r: 3.4, class: "tree" }, trees);
          if (r() > 0.72) el("circle", { cx: (tx + 1.4).toFixed(1), cy: (ty + 1).toFixed(1), r: 1.1, class: "fruit" }, trees);
        }
      }
      var pinAt = el("g", { transform: "translate(" + p.x + " " + (p.y - p.radius * 0.85 - 6) + ")" }, g);
      var pin = el("g", { class: "pin" }, pinAt);
      el("circle", { r: 14, class: "pin-pulse" }, pin);
      el("path", { d: "M0 0 C -9 -10 -11 -14 -11 -19 A 11 11 0 1 1 11 -19 C 11 -14 9 -10 0 0 Z", class: "pin-body" }, pin);
      el("use", { href: "#mango-icon", x: -8, y: -27, width: 16, height: 16 }, pin);
      self.label(g, p.name, p.x, p.y + p.radius * 0.85 + 18, "lbl grove-lbl");
      g.addEventListener("click", function () { self.emit("select", { type: "plantation", id: p.id }); });
      g.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); self.emit("select", { type: "plantation", id: p.id }); }
      });
      self.groveEls[p.id] = g;
    });

    // Packing house
    var ph = d.packingHouse;
    var house = el("g", { class: "packing", transform: "translate(" + ph.x + " " + ph.y + ")" }, svg);
    el("circle", { r: 26, class: "packing-glow" }, house);
    el("rect", { x: -16, y: -10, width: 32, height: 18, rx: 2, class: "packing-wall" }, house);
    el("path", { d: "M-19 -9 L0 -22 L19 -9 Z", class: "packing-roof" }, house);
    el("rect", { x: -5, y: -1, width: 10, height: 9, class: "packing-door" }, house);
    this.label(house, ph.name, 0, 24, "lbl lbl-sm");

    // Shops
    this.shopEls = [];
    var shops = el("g", { class: "shops" }, svg);
    d.shops.forEach(function (s, idx) {
      var g = el("g", { class: "shop", transform: "translate(" + s.x + " " + s.y + ")", tabindex: 0, role: "button", "aria-label": s.name + " in " + s.town }, shops);
      el("circle", { r: 20, class: "shop-glow" }, g);
      el("rect", { x: -12, y: -14, width: 24, height: 18, rx: 2, class: "shop-wall" }, g);
      var awning = el("g", { class: "shop-awning" }, g);
      for (var a = 0; a < 4; a++) {
        el("path", { d: "M" + (-14 + a * 7) + " -14 h7 v4 a3.5 3.5 0 0 1 -7 0 Z", class: a % 2 ? "aw-b" : "aw-a" }, awning);
      }
      el("rect", { x: -4, y: -5, width: 8, height: 9, class: "shop-door" }, g);
      var crate = el("g", { class: "crate", transform: "translate(14 0)" }, g);
      el("rect", { x: -6, y: -6, width: 12, height: 9, rx: 1.5, class: "crate-box" }, crate);
      el("use", { href: "#mango-icon", x: -5, y: -12, width: 8, height: 8 }, crate);
      el("use", { href: "#mango-icon", x: -1, y: -11, width: 8, height: 8 }, crate);
      var people = el("g", { class: "people" }, g);
      [[-20, 8, "#d4574a"], [-27, 4, "#3d7cc9"], [20, 9, "#7a4fb5"]].forEach(function (pp, k) {
        var pg = el("g", { class: "person", style: "--d:" + (k * 120) + "ms", transform: "translate(" + pp[0] + " " + pp[1] + ")" }, people);
        el("circle", { cx: 0, cy: -9, r: 2.6, class: "person-head" }, pg);
        el("path", { d: "M-3 -5 h6 l1 7 h-8 Z", fill: pp[2] }, pg);
      });
      var lx = 0, ly = 32, anchor = "middle";
      if (s.label === "above") ly = -26;
      if (s.label === "right") { lx = 24; ly = 4; anchor = "start"; }
      self.label(g, s.name, lx, ly, "lbl shop-lbl", anchor);
      var pick = function () { self.emit("select", { type: "shop", index: idx }); };
      g.addEventListener("click", pick);
      g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
      self.shopEls.push(g);
    });

    // Where along the road each shop sits, found by walking the path.
    var from = 0;
    d.shops.forEach(function (s) {
      var best = from, bestD = Infinity;
      for (var L = from; L <= self.routeLen; L += 1.5) {
        var pt = self.routePath.getPointAtLength(L);
        var dist = Math.hypot(pt.x - s.x, pt.y - s.y);
        if (dist < bestD) { bestD = dist; best = L; }
      }
      self.shopLens.push(best);
      from = best;
    });

    // Truck
    this.truck = el("g", { class: "truck" }, svg);
    var body = el("g", { class: "truck-body" }, this.truck);
    el("ellipse", { cx: 0, cy: 9, rx: 22, ry: 4, class: "truck-shadow" }, body);
    el("rect", { x: -22, y: -12, width: 30, height: 18, rx: 2.5, class: "truck-box" }, body);
    el("use", { href: "#mango-icon", x: -14, y: -11, width: 14, height: 14 }, body);
    el("path", { d: "M8 -6 h8 l6 6 v6 h-14 Z", class: "truck-cab" }, body);
    el("path", { d: "M10 -4 h5 l4 4 h-9 Z", class: "truck-window" }, body);
    el("circle", { cx: -13, cy: 7, r: 4, class: "wheel" }, body);
    el("circle", { cx: 13, cy: 7, r: 4, class: "wheel" }, body);
    this.placeTruck(0);

    // Compass
    var comp = el("g", { class: "compass", transform: "translate(905 150)" }, svg);
    el("circle", { r: 24, class: "compass-ring" }, comp);
    el("path", { d: "M0 -20 L6 0 L0 20 L-6 0 Z", class: "compass-needle" }, comp);
    el("path", { d: "M0 -20 L6 0 L-6 0 Z", class: "compass-north" }, comp);
    this.label(comp, "N", 0, -28, "lbl lbl-sm");
  };

  IslandMap.prototype.label = function (parent, text, x, y, cls, anchor) {
    var t = el("text", { x: x, y: y, class: cls, "text-anchor": anchor || "middle" }, parent);
    t.textContent = text;
    return t;
  };

  IslandMap.prototype.insideIsland = function (x, y, margin) {
    // Ray casting against the outline, then keep a margin from the coast.
    var pts = ISLAND_OUTLINE, inside = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      var xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    if (!inside) return false;
    for (var k = 0; k < pts.length; k++) {
      if (Math.hypot(pts[k][0] - x, pts[k][1] - y) < margin) return false;
    }
    return true;
  };

  IslandMap.prototype.on = function (name, fn) {
    (this.handlers = this.handlers || {})[name] = fn;
  };

  IslandMap.prototype.emit = function (name, payload) {
    if (this.handlers && this.handlers[name]) this.handlers[name](payload);
  };

  // ---- Camera ------------------------------------------------------------

  IslandMap.prototype.measure = function () {
    this.W = this.svg.clientWidth || window.innerWidth;
    this.H = this.svg.clientHeight || window.innerHeight;
  };

  // The part of the screen not covered by the story cards.
  IslandMap.prototype.freeArea = function () {
    var W = this.W, H = this.H;
    if (W >= 900) {
      var left = Math.min(460, W * 0.4);
      return { x: left, y: 64, w: W - left, h: H - 64 };
    }
    return { x: 0, y: 56, w: W, h: H * 0.56 - 56 };
  };

  IslandMap.prototype.applyCamera = function () {
    var c = this.cam, f = this.freeArea();
    var scale = Math.min(f.w, f.h) / c.span;
    var vw = this.W / scale, vh = this.H / scale;
    var fx = f.x + f.w / 2, fy = f.y + f.h / 2;
    var vx = c.cx - fx / scale, vy = c.cy - fy / scale;
    this.svg.setAttribute("viewBox", vx.toFixed(2) + " " + vy.toFixed(2) + " " + vw.toFixed(2) + " " + vh.toFixed(2));
    // Map units per screen pixel, so labels and pins can keep a steady on-screen size.
    this.svg.style.setProperty("--u", (1 / scale).toFixed(4));
  };

  IslandMap.prototype.flyTo = function (view, duration) {
    this.follow = null;
    var from = { cx: this.cam.cx, cy: this.cam.cy, span: this.cam.span };
    if (reduceMotion) duration = 0;
    if (duration == null) duration = 1600;
    if (!duration) {
      this.flight = null;
      this.cam = { cx: view.cx, cy: view.cy, span: view.span };
      this.applyCamera();
      return;
    }
    // On long hops pull the camera up mid-flight, like a plane leaving one grove for the next.
    var dist = Math.hypot(view.cx - from.cx, view.cy - from.cy);
    var peak = Math.max(from.span, view.span, Math.min(dist * 1.5, ISLAND_VIEW.span));
    var lift = Math.log(peak) - Math.max(Math.log(from.span), Math.log(view.span));
    this.flight = { from: from, to: view, start: performance.now(), duration: duration, lift: Math.max(0, lift) };
  };

  IslandMap.prototype.followTruck = function (span) {
    this.flight = null;
    this.follow = { span: span };
  };

  // ---- Truck -------------------------------------------------------------

  IslandMap.prototype.placeTruck = function (L) {
    L = Math.max(0, Math.min(this.routeLen, L));
    this.truckLen = L;
    var p = this.routePath.getPointAtLength(L);
    var a = this.routePath.getPointAtLength(Math.max(0, L - 2));
    var b = this.routePath.getPointAtLength(Math.min(this.routeLen, L + 2));
    var ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    if (this.truckDrive && this.truckDrive.to < this.truckDrive.from) ang += 180; // heading back
    // Keep the truck the right way up: flip it vertically when it points left.
    var sy = Math.cos(ang * Math.PI / 180) < 0 ? -1 : 1;
    this.truck.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ") rotate(" + ang.toFixed(1) + ") scale(1 " + sy + ")");
    this.truckPos = p;
    this.driven.style.strokeDashoffset = (this.routeLen - L).toFixed(1);
    var self = this;
    this.shopLens.forEach(function (sl, i) {
      self.shopEls[i].classList.toggle("is-delivered", L >= sl - 2);
    });
  };

  IslandMap.prototype.driveTo = function (targetLen) {
    if (reduceMotion) { this.truckDrive = null; this.placeTruck(targetLen); return; }
    var from = this.truckLen, dist = Math.abs(targetLen - from);
    if (dist < 0.5) return;
    var duration = Math.max(900, Math.min(4200, dist * 7));
    this.truckDrive = { from: from, to: targetLen, start: performance.now(), duration: duration };
    this.truck.classList.add("is-driving");
  };

  IslandMap.prototype.tick = function (now) {
    if (this.truckDrive) {
      var td = this.truckDrive, t = Math.min(1, (now - td.start) / td.duration);
      this.placeTruck(td.from + (td.to - td.from) * easeInOut(t));
      if (t >= 1) { this.truckDrive = null; this.truck.classList.remove("is-driving"); }
    }
    if (this.flight) {
      var f = this.flight, k = Math.min(1, (now - f.start) / f.duration), e = easeInOut(k);
      var logSpan = Math.log(f.from.span) + (Math.log(f.to.span) - Math.log(f.from.span)) * e + f.lift * Math.sin(Math.PI * e);
      this.cam.cx = f.from.cx + (f.to.cx - f.from.cx) * e;
      this.cam.cy = f.from.cy + (f.to.cy - f.from.cy) * e;
      this.cam.span = Math.exp(logSpan);
      this.applyCamera();
      if (k >= 1) this.flight = null;
    } else if (this.follow && this.truckPos) {
      var s = reduceMotion ? 1 : 0.08;
      this.cam.cx += (this.truckPos.x - this.cam.cx) * s;
      this.cam.cy += (this.truckPos.y - this.cam.cy) * s;
      this.cam.span += (this.follow.span - this.cam.span) * s;
      this.applyCamera();
    }
    requestAnimationFrame(this.tick);
  };

  // ---- Scenes ------------------------------------------------------------

  /*
   * scene = {
   *   mode: "overview" | "plantation" | "all" | "packing" | "delivery" | "finale",
   *   plantation: id, view: {cx, cy, span}, truck: road length, follow: span
   * }
   */
  IslandMap.prototype.setScene = function (scene) {
    var self = this;
    this.svg.setAttribute("data-mode", scene.mode);
    Object.keys(this.groveEls).forEach(function (id) {
      self.groveEls[id].classList.toggle("is-active", scene.mode === "all" || scene.plantation === id);
    });
    this.shopEls.forEach(function (g, i) { g.classList.toggle("is-target", scene.shop === i); });

    if (scene.truck != null) {
      this.truck.classList.add("is-visible");
      this.driveTo(scene.truck);
    } else {
      this.truck.classList.remove("is-visible");
      this.truckDrive = null;
      this.placeTruck(0);
    }

    if (scene.follow) this.followTruck(scene.follow);
    else if (scene.view) this.flyTo(scene.view);
  };

  window.IslandMap = IslandMap;
})();
