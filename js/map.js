/*
 * The island map, built on Mapbox: dusk satellite imagery with 3D terrain
 * and the family's fincas. The camera is flown here rather than by Mapbox:
 * Mapbox keeps its camera a set distance above the ground under the map's
 * centre, so over the ravines it bobbed up and down with every ridge. Ours
 * flies at a steady height and rises a little between distant stops.
 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // A polygon circle of the grove's real size, for the highlight on the map.
  function circle(lon, lat, radius) {
    var pts = [], dx = radius / (111320 * Math.cos(lat * Math.PI / 180)), dy = radius / 110574;
    for (var i = 0; i <= 48; i++) {
      var a = i / 48 * Math.PI * 2;
      pts.push([lon + Math.cos(a) * dx, lat + Math.sin(a) * dy]);
    }
    return pts;
  }

  var ACCENT = "#E8891C";

  // The ground height the camera is measured from, in metres. The fincas
  // sit on terraces a few hundred metres up.
  var BASE_ALTITUDE = 300;

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

  function FarmMap(container, data) {
    this.data = data;
    this.container = container;
    this.handlers = {};
    this.scene = null;
    this.groveMarkers = {};

    var cfg = data.mapbox || {};
    if (!window.mapboxgl || !cfg.token) {
      container.classList.add("map-missing");
      container.innerHTML = "<div class='map-missing-note'><p class='label'>Map</p>" +
        "<p>The island map needs a Mapbox key. Add your public token to <code>mapbox.token</code> in <code>js/data.js</code>.</p></div>";
      return;
    }

    mapboxgl.accessToken = cfg.token;
    this.map = new mapboxgl.Map({
      container: container,
      style: cfg.style,
      // Settings for Mapbox's Standard styles: a dusk light and no labels,
      // so the island reads as one quiet landscape.
      config: { basemap: {
        lightPreset: cfg.lightPreset || "dusk",
        showPlaceLabels: false,
        showRoadLabels: false,
        showPointOfInterestLabels: false,
        showTransitLabels: false
      } },
      bounds: cfg.island,
      fitBoundsOptions: { padding: this.padding() },
      interactive: false,
      attributionControl: true,
      logoPosition: "bottom-right"
    });
    var self = this;
    this.map.on("load", function () { self.onLoad(); });
    window.addEventListener("resize", function () {
      if (self.scene) self.setScene(self.scene);
    });
  }

  FarmMap.prototype.on = function (name, fn) { this.handlers[name] = fn; };
  FarmMap.prototype.emit = function (name, payload) { if (this.handlers[name]) this.handlers[name](payload); };

  // Keep what the camera looks at clear of the captions in the lower left.
  FarmMap.prototype.padding = function () {
    var W = window.innerWidth, H = window.innerHeight;
    if (W >= 900) return { top: 100, bottom: Math.round(H * 0.3), left: Math.round(W * 0.34), right: 120 };
    return { top: 90, bottom: Math.round(H * 0.5), left: 24, right: 24 };
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
    map.addLayer({ id: "grove-fill", type: "fill", source: "groves", slot: "top", paint: {
      "fill-color": ACCENT,
      "fill-emissive-strength": 1,
      "fill-opacity": ["case", ["boolean", ["feature-state", "active"], false], 0.14, 0],
      "fill-opacity-transition": { duration: 1200 }
    } });
    map.addLayer({ id: "grove-line", type: "line", source: "groves", slot: "top", paint: {
      "line-color": ACCENT,
      "line-emissive-strength": 1,
      "line-width": ["case", ["boolean", ["feature-state", "active"], false], 1.5, 1],
      "line-opacity": ["case", ["boolean", ["feature-state", "active"], false], 1, 0.55]
    } });

    d.plantations.forEach(function (p) {
      var el = marker("grove-marker", "<span class='dot'></span><span class='marker-label'>" + p.name + "</span>", p.name + ", " + p.region);
      el.addEventListener("click", function () { self.emit("select", { type: "plantation", id: p.id }); });
      self.groveMarkers[p.id] = new mapboxgl.Marker({ element: el, anchor: "center" }).setLngLat([p.lon, p.lat]).addTo(map);
    });

    this.ready = true;
    if (this.scene) this.setScene(this.scene);
  };

  /*
   * scene = {
   *   mode: "overview" | "plantation" | "all",
   *   plantation: id,
   *   view: "island", "groves" or { center, zoom, pitch, bearing }
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
    // Each view becomes a plain camera (centre, zoom, pitch, bearing) with the
    // caption padding already worked in, then the camera flies there.
    var padding = this.padding(), to;
    if (scene.view === "groves") {
      // Frame all the groves together, close enough that their names don't overlap.
      var lons = this.data.plantations.map(function (p) { return p.lon; });
      var lats = this.data.plantations.map(function (p) { return p.lat; });
      to = map.cameraForBounds([[Math.min.apply(null, lons), Math.min.apply(null, lats)], [Math.max.apply(null, lons), Math.max.apply(null, lats)]],
        { padding: padding, pitch: 45, bearing: -10, maxZoom: 13 });
      to.pitch = 45; to.bearing = -10;
    } else if (scene.view === "island") {
      to = map.cameraForBounds(this.data.mapbox.island, { padding: padding, pitch: 0, bearing: 0 });
      to.pitch = 0; to.bearing = 0;
    } else if (scene.view) {
      var v = scene.view, e = 0.0005;
      to = map.cameraForBounds([[v.center[0] - e, v.center[1] - e], [v.center[0] + e, v.center[1] + e]],
        { padding: padding, pitch: v.pitch || 0, bearing: v.bearing || 0, maxZoom: v.zoom });
      to.zoom = v.zoom; to.pitch = v.pitch || 0; to.bearing = v.bearing || 0;
    }
    if (to) this.fly(to);
  };

  // Where the camera sits for a given centre, zoom, pitch and bearing,
  // measured from BASE_ALTITUDE instead of from the terrain.
  FarmMap.prototype.place = function (cam) {
    var map = this.map, t = map.transform;
    var fov = (t.fov || 36.87) * Math.PI / 180;
    var dist = (t.height / 2 / Math.tan(fov / 2)) / (512 * Math.pow(2, cam.zoom));
    var c = mapboxgl.MercatorCoordinate.fromLngLat(cam.center, BASE_ALTITUDE);
    var p = cam.pitch * Math.PI / 180, b = cam.bearing * Math.PI / 180, back = dist * Math.sin(p);
    var opts = map.getFreeCameraOptions();
    opts.position = new mapboxgl.MercatorCoordinate(c.x - back * Math.sin(b), c.y + back * Math.cos(b), c.z + dist * Math.cos(p));
    opts.setPitchBearing(cam.pitch, cam.bearing);
    map.setFreeCameraOptions(opts);
  };

  // A slow flight from wherever the camera is now. Between stops that are
  // far apart it rises enough to keep both in view, then settles back down.
  FarmMap.prototype.fly = function (to) {
    var self = this, map = this.map;
    var target = { center: mapboxgl.LngLat.convert(to.center), zoom: to.zoom, pitch: to.pitch, bearing: to.bearing };
    var from = this.cam || { center: map.getCenter(), zoom: map.getZoom(), pitch: map.getPitch(), bearing: map.getBearing() };
    cancelAnimationFrame(this.frame);
    if (reduceMotion) { this.cam = target; this.place(target); return; }

    var a = mapboxgl.MercatorCoordinate.fromLngLat(from.center), z = mapboxgl.MercatorCoordinate.fromLngLat(target.center);
    var span = Math.hypot(z.x - a.x, z.y - a.y);
    var fit = span ? Math.log2(0.6 * map.transform.width / (span * 512)) : Infinity;
    var rise = Math.max(0, (from.zoom + target.zoom) / 2 - Math.min(from.zoom, target.zoom, fit));
    var turn = ((target.bearing - from.bearing + 540) % 360) - 180;
    var start = performance.now(), dur = 5200;

    (function step(now) {
      var t = Math.min(1, (now - start) / dur), e = easeInOut(t);
      var c = new mapboxgl.MercatorCoordinate(a.x + (z.x - a.x) * e, a.y + (z.y - a.y) * e);
      self.cam = {
        center: c.toLngLat(),
        zoom: from.zoom + (target.zoom - from.zoom) * e - rise * Math.sin(Math.PI * e),
        pitch: from.pitch + (target.pitch - from.pitch) * e,
        bearing: from.bearing + turn * e
      };
      self.place(self.cam);
      if (t < 1) self.frame = requestAnimationFrame(step);
    })(start);
  };

  window.FarmMap = FarmMap;
})();
