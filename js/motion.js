/*
 * Scroll motion: Lenis smooth scrolling and GSAP ScrollTrigger effects.
 * Nothing here runs for visitors who ask for reduced motion, or if the
 * libraries fail to load; the page is complete without it.
 */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !window.gsap || !window.ScrollTrigger) { root.classList.remove("motion-pending"); return; }

  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger, SplitText = window.SplitText;
  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);
  root.classList.add("has-motion");

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  // ---- Smooth scrolling ----------------------------------------------------

  var lenis = window.Lenis ? new window.Lenis({ duration: 1.25, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } }) : null;
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  window.mogangoScrollTo = function (el) {
    if (lenis) lenis.scrollTo(el, { duration: 1.8 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // In-page links glide instead of jumping, then move focus for keyboards.
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href^='#']");
    if (!a || e.defaultPrevented) return;
    var id = a.getAttribute("href").slice(1), target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    window.mogangoScrollTo(target);
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });

  // ---- Headlines: line by line, from behind a mask -------------------------

  function reveal(el, trigger) {
    if (!SplitText) {
      return gsap.from(el, { yPercent: 30, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: trigger });
    }
    return SplitText.create(el, {
      type: "lines", mask: "lines", linesClass: "line", autoSplit: true,
      onSplit: function (self) {
        return gsap.from(self.lines, {
          yPercent: 110, duration: 1.3, ease: "expo.out", stagger: 0.1,
          delay: trigger ? 0 : 0.25, scrollTrigger: trigger
        });
      }
    });
  }

  $$(".reveal").forEach(function (el) {
    if (el.closest(".hero")) reveal(el, null);
    else if (!el.closest(".v-track")) reveal(el, { trigger: el, start: "top 88%", once: true });
  });
  root.classList.remove("motion-pending");

  // ---- Hero: slow settle and parallax --------------------------------------

  var hero = $(".hero"), heroMedia = $(".hero-media");
  gsap.fromTo(heroMedia, { scale: 1.1 }, { scale: 1, duration: 2.8, ease: "power2.out" });
  gsap.to(heroMedia, { yPercent: 16, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero-text", { yPercent: -30, opacity: 0, ease: "none", scrollTrigger: { trigger: hero, start: "35% top", end: "bottom top", scrub: true } });
  gsap.from(".hero-line, .topbar, .scroll-cue", { opacity: 0, duration: 1.4, delay: 0.9, ease: "power2.out" });

  // Other photos drift a little inside their frames.
  $$(".intro .photo, .harvest .photo").forEach(function (box) {
    var img = box.querySelector("img");
    if (!img) return;
    gsap.fromTo(img, { yPercent: -5, scale: 1.12 }, {
      yPercent: 5, scale: 1.12, ease: "none",
      scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  // ---- Numbers and season --------------------------------------------------

  gsap.from(".stat", {
    "--rule": 0, duration: 1.6, ease: "expo.out", stagger: 0.12,
    scrollTrigger: { trigger: "#stats", start: "top 80%", once: true }
  });

  gsap.fromTo("#strip .m", { "--p": 0 }, {
    "--p": 1, ease: "none", stagger: 0.08,
    scrollTrigger: { trigger: "#strip", start: "top 85%", end: "bottom 45%", scrub: 0.6 }
  });

  // ---- Varieties: a pinned horizontal run on larger screens ----------------

  var mm = gsap.matchMedia();
  var track = $("#v-track");

  mm.add("(min-width: 900px)", function () {
    function distance() { return Math.max(0, track.scrollWidth - window.innerWidth); }
    var run = gsap.to(track, {
      x: function () { return -distance(); }, ease: "none",
      scrollTrigger: {
        trigger: "#varieties", start: "top top", end: function () { return "+=" + distance(); },
        pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1
      }
    });

    $$(".v-variety", track).forEach(function (panel) {
      gsap.fromTo($(".photo", panel), { xPercent: -8 }, {
        xPercent: 8, ease: "none",
        scrollTrigger: { trigger: panel, containerAnimation: run, start: "left right", end: "right left", scrub: true }
      });
      reveal($(".v-name", panel), { trigger: panel, containerAnimation: run, start: "left 60%", once: true });
    });
    reveal($(".v-intro .reveal", track), { trigger: "#varieties", start: "top 70%", once: true });

    // Keep a focused link on screen when tabbing through the panels.
    function onFocus(e) {
      var panel = e.target.closest(".v-panel"), st = run.scrollTrigger;
      if (!panel || !st || !distance()) return;
      var at = Math.min(1, panel.offsetLeft / distance());
      window.mogangoScrollTo(st.start + at * (st.end - st.start));
    }
    track.addEventListener("focusin", onFocus);
    return function () { track.removeEventListener("focusin", onFocus); };
  });

  mm.add("(max-width: 899px)", function () {
    $$(".v-track .reveal").forEach(function (el) { reveal(el, { trigger: el, start: "top 88%", once: true }); });
  });

  // ---- Closing: a slow push into the cut mango -----------------------------

  var closing = $(".closing");
  var push = gsap.timeline({ scrollTrigger: { trigger: closing, start: "top top", end: "bottom bottom", scrub: true } });
  push.fromTo(".closing-media", { scale: 1 }, { scale: 1.45, ease: "none" }, 0)
    .fromTo(".closing-stage", { "--shade": 0.15 }, { "--shade": 0.55, ease: "none" }, 0);

  // Measurements change once the web fonts arrive.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
