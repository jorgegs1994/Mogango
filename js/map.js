/*
 * The island map, built on Mapbox: satellite imagery with 3D terrain, the
 * groves, the shops, and a truck that drives the real road between them.
 * Mapbox handles the camera; this file only says where to look.
 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Distance in meters between two [lon, lat] points.
  function meters(a, b) {
    var R = 6371000, toRad = Math.PI / 180;
    var dLat = (b[1] - a[1]) * toRad, dLon = (b[0] - a[0]) * toRad;
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(a[1] * toRad) * Math.cos(b[1] * toRad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.sqrt(s));
  }

  // Compass bearing in degrees from a to b.
  function bearing(a, b) {
    var toRad = Math.PI / 180;
    var y = Math.sin((b[0] - a[0]) * toRad) * Math.cos(b[1] * toRad);
    var x = Math.cos(a[1] * toRad) * Math.sin(b[1] * toRad) -
      Math.sin(a[1] * toRad) * Math.cos(b[1] * toRad) * Math.cos((b[0] - a[0]) * toRad);
    return (Math.atan2(y, x) / toRad + 360) % 360;
  }

  // A polygon circle of the grove's real size, for the highlight on the map.
  function circle(lon, lat, radius) {
    var pts = [], dx = radius / (111320 * Math.cos(lat * Math.PI / 180)), dy = radius / 110574;
    for (var i = 0; i <= 48; i++) {
      var a = i / 48 * Math.PI * 2;
      pts.push([lon + Math.cos(a) * dx, lat + Math.sin(a) * dy]);
    }
    return pts;
  }

  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function marker(cls, html, label) {
    var node = document.createElement("button");
    node.type = "button";
    node.className = "marker " + cls;
    node.setAttribute("aria-label", label);
    node.innerHTML = html;
    return node;
  }

  var HOUSE = "<svg viewBox='-20 -24 40 34' aria-hidden='true'><path d='M-17 -8 L0 -21 L17 -8 V8 H-17 Z' fill='#fff3dc' stroke='#8a5a2b' stroke-width='2'/><path d='M-20 -8 L0 -23 L20 -8' fill='none' stroke='#c0532a' stroke-width='4' stroke-linejoin='round'/><rect x='-5' y='-2' width='10' height='10' fill='#8a5a2b'/></svg>";
  var SHOP = "<svg viewBox='-16 -16 32 24' aria-hidden='true'><rect x='-12' y='-12' width='24' height='18' rx='2' fill='#fffaf0' stroke='#6b4f35' stroke-width='1.5'/><path d='M-14 -14 h28 v5 a3.5 3.5 0 0 1 -7 0 a3.5 3.5 0 0 1 -7 0 a3.5 3.5 0 0 1 -7 0 a3.5 3.5 0 0 1 -7 0 Z' fill='#e2533b'/><rect x='-4' y='-3' width='8' height='9' fill='#6b4f35'/></svg>";
  var TRUCK = "<svg viewBox='-24 -14 48 28' aria-hidden='true'><rect x='-22' y='-11' width='30' height='18' rx='2.5' fill='#f39c12' stroke='#a75a06' stroke-width='1.5'/><use href='#mango-icon' x='-15' y='-10' width='14' height='14'/><path d='M8 -6 h8 l6 6 v7 h-14 Z' fill='#2f7d32' stroke='#1d561b' stroke-width='1.5' stroke-linejoin='round'/><path d='M10 -4 h5 l4 4 h-9 Z' fill='#cfeaf5'/><circle cx='-13' cy='8' r='4' fill='#2b2118'/><circle cx='13' cy='8' r='4' fill='#2b2118'/></svg>";

  function FarmMap(container, data) {
    this.data = data;
    this.container = container;
    this.handlers = {};
    this.scene = null;
    this.route = null;       // [lon, lat] points along the road
    this.along = null;       // meters along the road at each point
    this.shopAt = [];        // meters along the road at each shop
    this.truckAt = 0;
    this.drive = null;
    this.groveMarkers = {};
    this.shopMarkers = [];

    var cfg = data.mapbox || {};
    if (!window.mapboxgl || !cfg.token) {
      container.classList.add("map-missing");
      container.innerHTML = "<div class='map-missing-note'><b>The map needs a Mapbox key.</b>" +
        "<span>Add your public Mapbox token to <code>mapbox.token</code> in <code>js/data.js</code>.</span></div>";
      return;
    }

    mapboxgl.accessToken = cfg.token;
    this.map = new mapboxgl.Map({
      container: container,
      style: cfg.style,
      bounds: cfg.island,
      fitBoundsOptions: { padding: this.padding() },
      interactive: false,
      cooperativeGestures: false
    });
    var self = this;
    this.map.on("load", function () { self.onLoad(); });
    window.addEventListener("resize", function () {
      if (self.scene) self.setScene(self.scene);
    });
    this.tick = this.tick.bind(this);
  }

  FarmMap.prototype.on = function (name, fn) { this.handlers[name] = fn; };
  FarmMap.prototype.emit = function (name, payload) { if (this.handlers[name]) this.handlers[name](payload); };

  // Keep what the camera looks at clear of the story cards.
  FarmMap.prototype.padding = function () {
    var W = window.innerWidth, H = window.innerHeight;
    if (W >= 900) return { top: 90, bottom: 40, left: Math.min(460, W * 0.4) + 24, right: 48 };
    return { top: 70, bottom: Math.round(H * 0.44), left: 16, right: 16 };
  };

  FarmMap.prototype.onLoad = function () {
    var map = this.map, d = this.data, self = this;

    map.addSource("dem", { type: "raster-dem", url: "mapbox://mapbox.mapbox-terrain-dem-v1", tileSize: 512 });
    map.setTerrain({ source: "dem", exaggeration: 1.4 });

    // Grove outlines at their real size.
    map.addSource("groves", {
      type: "geojson",
      promoteId: "id",
      data: {
        type: "FeatureCollection",
        features: d.plantations.map(function (p) {
          var r = Math.sqrt(p.hectares * 10000 / Math.PI);
          return { type: "Feature", properties: { id: p.id }, geometry: { type: "Polygon", coordinates: [circle(p.lon, p.lat, r)] } };
        })
      }
    });
    map.addLayer({ id: "grove-fill", type: "fill", source: "groves", paint: {
      "fill-color": "#ffc429",
      "fill-opacity": ["case", ["boolean", ["feature-state", "active"], false], 0.5, 0.25]
    } });
    map.addLayer({ id: "grove-line", type: "line", source: "groves", paint: { "line-color": "#ffc429", "line-width": 2.5 } });

    d.plantations.forEach(function (p) {
      var el = marker("grove-marker", "<span class='pin'><svg viewBox='0 0 40 40' aria-hidden='true'><use href='#mango-icon'/></svg></span><span class='marker-label'>" + p.name + "</span>", p.name + ", " + p.region);
      el.addEventListener("click", function () { self.emit("select", { type: "plantation", id: p.id }); });
      self.groveMarkers[p.id] = new mapboxgl.Marker({ element: el, anchor: "bottom" }).setLngLat([p.lon, p.lat]).addTo(map);
    });

    var ph = d.packingHouse;
    this.packing = new mapboxgl.Marker({ element: marker("packing-marker", HOUSE + "<span class='marker-label'>" + ph.name + "</span>", ph.name) })
      .setLngLat([ph.lon, ph.lat]).addTo(map);

    d.shops.forEach(function (s, i) {
      var el = marker("shop-marker", SHOP + "<span class='crate' aria-hidden='true'></span><span class='marker-label'>" + s.name + "</span>", s.name + " in " + s.town);
      el.addEventListener("click", function () { self.emit("select", { type: "shop", index: i }); });
      self.shopMarkers.push(new mapboxgl.Marker({ element: el }).setLngLat([s.lon, s.lat]).addTo(map));
    });

    var truck = document.createElement("div");
    truck.className = "truck-marker";
    truck.innerHTML = "<span class='truck-body'>" + TRUCK + "</span>";
    this.truckEl = truck;
    this.truck = new mapboxgl.Marker({ element: truck, rotationAlignment: "map" }).setLngLat([ph.lon, ph.lat]).addTo(map);

    this.loadRoute();
    this.ready = true;
    if (this.scene) this.setScene(this.scene);
    requestAnimationFrame(this.tick);
  };

  // Ask Mapbox for the driving route through the packing house and every shop.
  FarmMap.prototype.loadRoute = function () {
    var d = this.data, self = this;
    var stops = [[d.packingHouse.lon, d.packingHouse.lat]].concat(d.shops.map(function (s) { return [s.lon, s.lat]; }));
    var url = "https://api.mapbox.com/directions/v5/mapbox/driving/" +
      stops.map(function (p) { return p[0].toFixed(5) + "," + p[1].toFixed(5); }).join(";") +
      "?geometries=geojson&overview=full&access_token=" + encodeURIComponent(mapboxgl.accessToken);
    fetch(url).then(function (r) { return r.json(); }).then(function (res) {
      var line = res.routes && res.routes[0] && res.routes[0].geometry.coordinates;
      self.setRoute(line && line.length > 1 ? line : stops, (res.waypoints || []).map(function (w) { return w.location; }));
    }).catch(function () {
      // Without directions, draw straight hops between the stops.
      self.setRoute(stops, []);
    });
  };

  FarmMap.prototype.setRoute = function (line, waypoints) {
    var map = this.map, d = this.data;
    this.route = line;
    this.along = [0];
    for (var i = 1; i < line.length; i++) this.along.push(this.along[i - 1] + meters(line[i - 1], line[i]));

    // Where each shop sits along the road: the nearest road point, in order.
    var from = 0, self = this;
    this.shopAt = d.shops.map(function (s, k) {
      var target = waypoints[k + 1] || [s.lon, s.lat], best = from, bestD = Infinity;
      for (var j = from; j < line.length; j++) {
        var m = meters(line[j], target);
        if (m < bestD) { bestD = m; best = j; }
      }
      from = best;
      return self.along[best];
    });

    map.addSource("route", { type: "geojson", data: { type: "Feature", geometry: { type: "LineString", coordinates: line } } });
    map.addSource("driven", { type: "geojson", data: { type: "Feature", geometry: { type: "LineString", coordinates: [line[0], line[0]] } } });
    map.addLayer({ id: "route-casing", type: "line", source: "route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#0c141c", "line-opacity": 0.5, "line-width": 7 } });
    map.addLayer({ id: "route", type: "line", source: "route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#ffffff", "line-width": 3, "line-dasharray": [2, 1.5] } });
    map.addLayer({ id: "driven", type: "line", source: "driven", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#f39c12", "line-width": 5 } });

    if (this.scene) this.setScene(this.scene);
  };

  // The road position `dist` meters from the start, and the heading there.
  FarmMap.prototype.pointAt = function (dist) {
    var a = this.along, r = this.route, lo = 0, hi = a.length - 1;
    dist = Math.max(0, Math.min(a[hi], dist));
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (a[mid] <= dist) lo = mid; else hi = mid; }
    var t = a[hi] > a[lo] ? (dist - a[lo]) / (a[hi] - a[lo]) : 0;
    return {
      index: lo,
      at: [r[lo][0] + (r[hi][0] - r[lo][0]) * t, r[lo][1] + (r[hi][1] - r[lo][1]) * t],
      heading: bearing(r[lo], r[hi])
    };
  };

  FarmMap.prototype.placeTruck = function (dist) {
    if (!this.route) return;
    this.truckAt = dist;
    var p = this.pointAt(dist);
    if (this.drive && this.drive.to < this.drive.from) p.heading = (p.heading + 180) % 360;
    this.truck.setLngLat(p.at).setRotation(p.heading - 90);
    // Keep the truck the right way up when it heads west.
    this.truckEl.classList.toggle("is-west", p.heading > 180);
    this.map.getSource("driven").setData({ type: "Feature", geometry: { type: "LineString", coordinates: this.route.slice(0, p.index + 1).concat([p.at]) } });
    var self = this;
    this.shopMarkers.forEach(function (m, i) {
      m.getElement().classList.toggle("is-delivered", dist >= self.shopAt[i] - 5);
    });
    this.truckPos = p.at;
  };

  FarmMap.prototype.tick = function (now) {
    var dr = this.drive;
    if (dr) {
      var t = Math.min(1, (now - dr.start) / dr.duration);
      this.placeTruck(dr.from + (dr.to - dr.from) * easeInOut(t));
      if (t >= 1) { this.drive = null; this.truckEl.classList.remove("is-driving"); }
    }
    // Follow the truck once the camera has finished flying to it.
    if (this.scene && this.scene.follow && this.truckPos && !this.map.isMoving()) {
      this.map.jumpTo({ center: this.truckPos });
    }
    requestAnimationFrame(this.tick);
  };

  FarmMap.prototype.driveTo = function (dist) {
    var from = this.truckAt, gap = Math.abs(dist - from);
    if (reduceMotion || gap < 1) { this.drive = null; this.placeTruck(dist); return; }
    // About 25 km of road per second of animation, between 1.2 and 5 seconds.
    this.drive = { from: from, to: dist, start: performance.now(), duration: Math.max(1200, Math.min(5000, gap / 25)) };
    this.truckEl.classList.add("is-driving");
  };

  /*
   * scene = {
   *   mode: "overview" | "plantation" | "all" | "packing" | "delivery" | "finale",
   *   plantation: id, shop: index,
   *   view: "island" or { center, zoom, pitch, bearing },
   *   truck: "start" | shop index | "end",
   *   follow: true to keep the camera on the truck
   * }
   */
  FarmMap.prototype.setScene = function (scene) {
    this.scene = scene;
    if (!this.ready) return;
    var map = this.map, self = this;
    this.container.setAttribute("data-mode", scene.mode);

    Object.keys(this.groveMarkers).forEach(function (id) {
      var on = scene.mode === "all" || scene.plantation === id;
      self.groveMarkers[id].getElement().classList.toggle("is-active", on);
      map.setFeatureState({ source: "groves", id: id }, { active: on });
    });
    this.shopMarkers.forEach(function (m, i) { m.getElement().classList.toggle("is-target", scene.shop === i); });

    if (this.route) {
      if (scene.truck == null) {
        this.truckEl.classList.remove("is-visible");
        this.drive = null;
        this.placeTruck(0);
      } else {
        this.truckEl.classList.add("is-visible");
        var end = this.along[this.along.length - 1];
        this.driveTo(scene.truck === "start" ? 0 : scene.truck === "end" ? end : this.shopAt[scene.truck]);
      }
    }

    var move = { padding: this.padding(), duration: reduceMotion ? 0 : 2400, essential: true };
    if (scene.follow) {
      var start = [this.data.packingHouse.lon, this.data.packingHouse.lat];
      map.flyTo(Object.assign(move, { center: this.truckPos || start, zoom: 12.5, pitch: 50, bearing: 0 }));
    } else if (scene.view === "island") {
      map.fitBounds(this.data.mapbox.island, Object.assign(move, { pitch: 0, bearing: 0 }));
    } else if (scene.view) {
      map.flyTo(Object.assign(move, { center: scene.view.center, zoom: scene.view.zoom, pitch: scene.view.pitch || 0, bearing: scene.view.bearing || 0 }));
    }
  };

  window.FarmMap = FarmMap;
})();
