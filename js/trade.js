/*
 * The page for business buyers (empresas.html): fills it from js/data.js
 * with the availability calendar, the formats, how to order and the quote
 * request. The landing page is wired by js/main.js.
 */
(function () {
  "use strict";

  var D = window.MOGANGO;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
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

  $$("[data-bind]").forEach(function (n) {
    var v = D[n.getAttribute("data-bind")];
    if (v != null) n.textContent = v;
  });
  $$("[data-copy]").forEach(function (n) {
    var v = D.copy[n.getAttribute("data-copy")];
    if (v != null) n.innerHTML = rich(v);
  });
  $("#year").textContent = new Date().getFullYear();
  document.documentElement.style.setProperty("--logo", "url('" + new URL(D.logo.src, document.baseURI).href + "')");
  document.documentElement.classList.toggle("logo-colour", !!D.logo.colour);

  // ---- For businesses ------------------------------------------------------

  var T = D.trade;
  var LEVEL = ["Sin fruta", "Inicio o final de temporada", "Plena temporada"];
  $("#calendar").innerHTML = "<caption class='visually-hidden'>Disponibilidad de cada variedad por mes</caption>" +
    "<thead><tr><th scope='col'><span class='visually-hidden'>Variedad</span></th>" +
    D.harvest.map(function (m) {
      return "<th scope='col' class='label' title='" + m.name + "'><b>" + m.month.charAt(0) + "</b><span>" + m.month.slice(1) + "</span></th>";
    }).join("") + "</tr></thead><tbody>" +
    D.varieties.map(function (v) {
      return "<tr><th scope='row'>" + esc(v.name) + "</th>" + v.availability.map(function (a, i) {
        return "<td class='is-" + a + "'><span class='visually-hidden'>" + D.harvest[i].name + ": " + LEVEL[a] + "</span></td>";
      }).join("") + "</tr>";
    }).join("") + "</tbody>";

  $("#formats").innerHTML = T.formats.map(function (f) {
    return "<li><span class='f-name'>" + esc(f.name) + "</span><span class='f-detail'>" + esc(f.detail) + "</span><span class='label'>" + esc(f.use) + "</span></li>";
  }).join("");

  $("#order-steps").innerHTML = T.steps.map(function (st, i) {
    return "<li><span class='label'>" + pad(i + 1) + "</span><b>" + esc(st.title) + "</b><span>" + esc(st.text) + "</span></li>";
  }).join("");

  function options(list) {
    return list.map(function (o) { return "<option>" + esc(o) + "</option>"; }).join("");
  }
  $("#q-type").innerHTML = options(T.businessTypes);
  $("#q-format").innerHTML = options(T.formats.map(function (f) { return f.name; }).concat(["Aún no lo sé"]));
  $("#q-varieties").innerHTML = D.varieties.map(function (v, i) {
    return "<label><input type='checkbox' name='variedad' value='" + esc(v.name) + "'" + (i ? "" : " checked") + "> " + esc(v.name) + "</label>";
  }).join("");

  // There is no server behind the page, so the request opens the buyer's
  // email with everything already written.
  var quote = $("#quote");
  quote.addEventListener("submit", function (e) {
    e.preventDefault();
    var missing = $$("[required]", quote).filter(function (f) { return !f.checkValidity(); });
    $$(".field", quote).forEach(function (f) { f.classList.remove("is-invalid"); });
    if (missing.length) {
      missing.forEach(function (f) { f.closest(".field").classList.add("is-invalid"); });
      $("#quote-note").textContent = "Falta tu nombre, la empresa o un correo válido.";
      missing[0].focus();
      return;
    }
    var f = quote.elements;
    var picked = $$("input[name=variedad]:checked", quote).map(function (c) { return c.value; });
    var body = [
      "Nombre: " + f.nombre.value,
      "Empresa: " + f.empresa.value + " (" + f.tipo.value + ")",
      "Correo: " + f.correo.value,
      f.telefono.value ? "Teléfono: " + f.telefono.value : "",
      "Variedades: " + (picked.length ? picked.join(", ") : "Cualquiera"),
      "Formato: " + f.formato.value,
      f.cantidad.value ? "Cantidad y semanas: " + f.cantidad.value : "",
      f.notas.value ? "\n" + f.notas.value : ""
    ].filter(Boolean).join("\n");
    window.location.href = "mailto:" + D.contact.email +
      "?subject=" + encodeURIComponent("Presupuesto para " + f.empresa.value) +
      "&body=" + encodeURIComponent(body);
    $("#quote-note").textContent = "Revisa tu correo y pulsa enviar. Te respondemos en 24 horas.";
  });

  // ---- Footer --------------------------------------------------------------

  var c = D.contact;
  $("#contact-lines").innerHTML = esc(c.address) + "<br><a href='mailto:" + esc(c.email) + "'>" + esc(c.email) + "</a><br>" +
    "<a href='tel:" + esc(c.phone.replace(/\s/g, "")) + "'>" + esc(c.phone) + "</a>";
  $("#shop-list").innerHTML = D.shops.map(function (s) {
    return "<li><span>" + esc(s.name) + "</span><span>" + esc(s.town) + "</span></li>";
  }).join("");
})();
