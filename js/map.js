/*
 * The island map: a satellite image of Gran Canaria with the groves, the
 * delivery road, the shops and the truck drawn on top. Moves the camera
 * between places and drives the truck along the real road.
 */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var WIDTH = 4000; // map units across the satellite image
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, attrs, parent) {
    var node = document.createElementNS(NS, tag);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function onActivate(node, fn) {
    node.addEventListener("click", fn);
    node.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); }
    });
  }

  function IslandMap(svg, data, route) {
    var m = data.map;
    this.svg = svg;
    this.data = data;
    this.route = route;
    this.extent = m;
    this.height = WIDTH * m.pixelHeight / m.pixelWidth;
    var midLat = (m.north + m.south) / 2;
    this.metersPerUnit = (m.east - m.west) * 111320 * Math.cos(midLat * Math.PI / 180) / WIDTH;
    // The whole island, with a little sea around it.
    this.islandView = this.viewAt(-15.597, 27.957, 56000);
    this.cam = { cx: this.islandView.cx, cy: this.islandView.cy, span: this.islandView.span };
    this.u = 1;
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

  // Longitude/latitude to map units. The image is a plain lon/lat grid, which
  // is accurate enough at the size of one island.
  IslandMap.prototype.project = function (lon, lat) {
    var m = this.extent;
    return [
      (lon - m.west) / (m.east - m.west) * WIDTH,
      (m.north - lat) / (m.north - m.south) * this.height
    ];
  };

  IslandMap.prototype.units = function (meters) {
    return meters / this.metersPerUnit;
  };

  // A camera view centred on a place, showing about `meters` across.
  IslandMap.prototype.viewAt = function (lon, lat, meters) {
    var p = this.project(lon, lat);
    return { cx: p[0], cy: p[1], span: this.units(meters) };
  };

  IslandMap.prototype.groveRadius = function (p) {
    return this.units(Math.sqrt(p.hectares * 10000 / Math.PI));
  };

  IslandMap.prototype.build = function () {
    var svg = this.svg, d = this.data, self = this;
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    el("rect", { x: -20000, y: -20000, width: 44000, height: 44000, class: "sea" }, svg);
    // A small image first so the island shows straight away, then the sharp one on top.
    el("image", { href: d.map.preview, x: 0, y: 0, width: WIDTH, height: this.height, preserveAspectRatio: "none" }, svg);
    el("image", { href: d.map.image, x: 0, y: 0, width: WIDTH, height: this.height, preserveAspectRatio: "none" }, svg);

    var marks = el("g", { class: "landmarks" }, svg);
    (d.landmarks || []).forEach(function (l) {
      var p = self.project(l.lon, l.lat);
      el("circle", { cx: p[0], cy: p[1], class: "landmark-dot" }, marks);
      self.label(marks, l.name, p[0], p[1], "lbl lbl-land", "middle", "-0.9em");
    });

    // Road
    var pts = this.route.map(function (ll) { return self.project(ll[0], ll[1]); });
    var routeD = "M" + pts.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" L");
    var roads = el("g", { class: "roads" }, svg);
    el("path", { d: routeD, class: "road-edge" }, roads);
    el("path", { d: routeD, class: "road" }, roads);
    this.driven = el("path", { d: routeD, class: "road-driven" }, roads);
    this.routePath = this.driven;
    this.routeLen = this.routePath.getTotalLength();
    this.driven.style.strokeDasharray = this.routeLen + " " + this.routeLen;
    this.driven.style.strokeDashoffset = this.routeLen;

    // Distance along the road to every route point, so shops know where they sit.
    var along = [0];
    for (var i = 1; i < pts.length; i++) {
      along.push(along[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    }
    var scale = this.routeLen / along[along.length - 1];

    // Groves, drawn at their real size.
    this.groveEls = {};
    var groves = el("g", { class: "groves" }, svg);
    d.plantations.forEach(function (p) {
      var c = self.project(p.lon, p.lat), r = self.groveRadius(p);
      var g = el("g", { class: "grove", "data-id": p.id, tabindex: 0, role: "button", "aria-label": p.name + ", " + p.region }, groves);
      el("circle", { cx: c[0], cy: c[1], r: r * 1.9, class: "grove-glow" }, g);
      el("circle", { cx: c[0], cy: c[1], r: r, class: "grove-area" }, g);
      var at = el("g", { transform: "translate(" + c[0] + " " + (c[1] - r) + ")" }, g);
      var pin = el("g", { class: "pin" }, at);
      el("circle", { r: 14, class: "pin-pulse" }, pin);
      el("path", { d: "M0 0 C -9 -10 -11 -14 -11 -19 A 11 11 0 1 1 11 -19 C 11 -14 9 -10 0 0 Z", class: "pin-body" }, pin);
      el("use", { href: "#mango-icon", x: -8, y: -27, width: 16, height: 16 }, pin);
      if (p.label === "left") self.label(g, p.name, c[0] - r, c[1], "lbl grove-lbl", "end", "0.35em", "-0.6em");
      else if (p.label === "right") self.label(g, p.name, c[0] + r, c[1], "lbl grove-lbl", "start", "0.35em", "0.6em");
      else self.label(g, p.name, c[0], c[1] + r, "lbl grove-lbl", "middle", "1.5em");
      onActivate(g, function () { self.emit("select", { type: "plantation", id: p.id }); });
      self.groveEls[p.id] = g;
    });

    // Packing house
    var ph = d.packingHouse, hp = this.project(ph.lon, ph.lat);
    var house = el("g", { class: "packing", transform: "translate(" + hp[0] + " " + hp[1] + ")" }, svg);
    var hi = el("g", { class: "icon" }, house);
    el("circle", { r: 26, class: "packing-glow" }, hi);
    el("rect", { x: -16, y: -10, width: 32, height: 18, rx: 2, class: "packing-wall" }, hi);
    el("path", { d: "M-19 -9 L0 -22 L19 -9 Z", class: "packing-roof" }, hi);
    el("rect", { x: -5, y: -1, width: 10, height: 9, class: "packing-door" }, hi);
    this.label(house, ph.name, 0, 0, "lbl lbl-sm", "end", "0.35em", "-2.4em");

    // Shops
    this.shopEls = [];
    var shops = el("g", { class: "shops" }, svg);
    d.shops.forEach(function (s, idx) {
      var ll = self.route[s.routeIndex], sp = self.project(ll[0], ll[1]);
      var g = el("g", { class: "shop", transform: "translate(" + sp[0] + " " + sp[1] + ")", tabindex: 0, role: "button", "aria-label": s.name + " in " + s.town }, shops);
      var ic = el("g", { class: "icon" }, g);
      el("circle", { r: 22, class: "shop-glow" }, ic);
      el("rect", { x: -12, y: -14, width: 24, height: 18, rx: 2, class: "shop-wall" }, ic);
      var awning = el("g", {}, ic);
      for (var a = 0; a < 4; a++) {
        el("path", { d: "M" + (-14 + a * 7) + " -14 h7 v4 a3.5 3.5 0 0 1 -7 0 Z", class: a % 2 ? "aw-b" : "aw-a" }, awning);
      }
      el("rect", { x: -4, y: -5, width: 8, height: 9, class: "shop-door" }, ic);
      var crate = el("g", { class: "crate" }, ic);
      el("rect", { x: -6, y: -6, width: 12, height: 9, rx: 1.5, class: "crate-box" }, crate);
      el("use", { href: "#mango-icon", x: -5, y: -12, width: 8, height: 8 }, crate);
      el("use", { href: "#mango-icon", x: -1, y: -11, width: 8, height: 8 }, crate);
      [[-20, 8, "#d4574a"], [-27, 4, "#3d7cc9"], [20, 9, "#7a4fb5"]].forEach(function (pp, k) {
        var pg = el("g", { class: "person", style: "--d:" + (k * 120) + "ms", transform: "translate(" + pp[0] + " " + pp[1] + ")" }, ic);
        el("circle", { cx: 0, cy: -9, r: 2.6, class: "person-head" }, pg);
        el("path", { d: "M-3 -5 h6 l1 7 h-8 Z", fill: pp[2] }, pg);
      });
      var pos = { right: ["start", "0.35em", "2.4em"], left: ["end", "0.35em", "-2.4em"], above: ["middle", "-2.6em"], below: ["middle", "3em"] }[s.label || "right"];
      self.label(g, s.name, 0, 0, "lbl shop-lbl", pos[0], pos[1], pos[2]);
      onActivate(g, function () { self.emit("select", { type: "shop", index: idx }); });
      self.shopEls.push(g);
      self.shopLens.push(along[s.routeIndex] * scale);
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
  };

  IslandMap.prototype.label = function (parent, text, x, y, cls, anchor, dy, dx) {
    var t = el("text", { x: x, y: y, class: cls, "text-anchor": anchor || "middle" }, parent);
    if (dy) t.setAttribute("dy", dy);
    if (dx) t.setAttribute("dx", dx);
    t.textContent = text;
    return t;
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
    // Map units per screen pixel, so labels and icons keep a steady on-screen size.
    this.u = 1 / scale;
    this.svg.style.setProperty("--u", this.u.toFixed(4));
    if (this.truckPos) this.placeTruck(this.truckLen);
  };

  IslandMap.prototype.flyTo = function (view, duration) {
    this.follow = null;
    var from = { cx: this.cam.cx, cy: this.cam.cy, span: this.cam.span };
    if (reduceMotion) duration = 0;
    if (duration == null) duration = 1800;
    if (!duration) {
      this.flight = null;
      this.cam = { cx: view.cx, cy: view.cy, span: view.span };
      this.applyCamera();
      return;
    }
    // On long hops pull the camera up mid-flight, like a plane leaving one grove for the next.
    var dist = Math.hypot(view.cx - from.cx, view.cy - from.cy);
    var peak = Math.max(from.span, view.span, Math.min(dist * 1.5, this.islandView.span));
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
    var look = 4 * this.u;
    var p = this.routePath.getPointAtLength(L);
    var a = this.routePath.getPointAtLength(Math.max(0, L - look));
    var b = this.routePath.getPointAtLength(Math.min(this.routeLen, L + look));
    var ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    if (this.truckDrive && this.truckDrive.to < this.truckDrive.from) ang += 180; // heading back
    // Keep the truck the right way up: flip it vertically when it points left.
    var sy = Math.cos(ang * Math.PI / 180) < 0 ? -1 : 1;
    var k = this.u * 1.3;
    this.truck.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ") rotate(" + ang.toFixed(1) + ") scale(" + k.toFixed(3) + " " + (k * sy).toFixed(3) + ")");
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
    var duration = Math.max(1200, Math.min(5000, dist * 2.4));
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
   *   plantation: id, shop: index, view: {cx, cy, span}, truck: road length, follow: span
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
