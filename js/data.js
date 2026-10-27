/*
 * Mogango site content.
 *
 * Everything the page shows lives here, so you can change words, numbers,
 * places and photos without touching the rest of the code.
 *
 * Places use real coordinates: `lat` and `lon` in decimal degrees, the same
 * numbers Google Maps shows when you right-click a spot (it shows lat first).
 * The plantations, packing house and shop names below are placeholders until
 * we have the family's real ones.
 *
 * Photos live in the /images folder. Until a file exists, the page shows a
 * dark block with the `note` describing the intended shot.
 */
window.MOGANGO = {
  farmName: "MOGANGO",

  // The logo. With `colour: false` it is drawn in one colour that matches
  // the page (off-white on dark, ink on light); `true` shows the original
  // yellow and green.
  logo: { src: "images/logo.png", colour: false },
  islandName: "Gran Canaria",
  since: 1978,
  tagline: "Mangos de Mogán, madurados al sol en sus barrancos y cultivados por una misma familia desde 1978.",

  // The words on the page, top to bottom. Wrap a word in *stars* to set it
  // in italics; wrap it in _underscores_ to give it the orange accent;
  // \n starts a new line.
  copy: {
    heroTitle: "Mangos\nde\u00a0_Mogán._",
    heroLine: "Finca familiar · desde 1978",

    introLabel: "La finca",
    introTitle: "Empezó con tomates y berenjenas. Hoy son dos fincas y una fruta de la que nunca dejamos de *aprender*.",
    introText: "La luna de miel de los abuelos fue un viaje en carricoche, cargados de fruta para el mercado; esa noche se quedaron en Las Palmas. El negocio empezó delante de su casa, entre dos eucaliptos enormes. A la sombra del de la derecha, el abuelo empaquetaba tomates, o eso se recuerda en casa. Después pasó al almacén del Molino de Viento y empezó con las berenjenas. Las cosas fueron a mejor: alquiló el almacén de los Quesada en El Cercado, sembró en terrenos alquilados por todo el barranco de Mogán y en la playa, en los de doña Concha, y llegó a mandar berenjenas hasta Róterdam. Con los años cambió las berenjenas por mangos. Hoy la familia cuida de dos fincas en el barranco de Mogán, y cada mango se sigue cogiendo a mano, en su punto.",

    tourLabel: "La isla",
    tourText: "En el suroeste, entre barrancos que bajan al mar, Mogán es tierra de mango: de aquí sale buena parte de la fruta de la isla. Baja para sobrevolar cada finca.",

    harvestLabel: "La cosecha",
    harvestTitle: "Cogidos al amanecer. *Empaquetados* a mediodía.",
    harvestText: "La cuadrilla empieza antes de que apriete el calor y corta cada mango con un trocito de rabo para que no pierda la savia. A mediodía las cajas ya están en el almacén, donde cada fruta se lava, se selecciona a mano y se enfría.",

    numbersLabel: "En cifras",

    seasonLabel: "La temporada",
    seasonTitle: "Seis meses de *sol*, una temporada corta.",
    seasonText: "El mango pide unos días frescos en invierno para florecer y después calor, mucho calor. Los barrancos de Mogán, resguardados y mirando al sur, le dan las dos cosas. La primera fruta llega en abril, de los bancales más bajos y calientes. El grueso de la cosecha va de julio a septiembre.",

    varietiesLabel: "Lo que cultivamos",
    varietiesTitle: "Tres mangos, tres *caracteres*.",
    varietiesText: "Las tres crecen en nuestras dos fincas, y cada una madura a su ritmo. Estas son las nuestras.",

    tradeLabel: "Para empresas",
    tradeTitle: "Mango de Mogán para tu *negocio*.",
    tradeText: "Mango cogido en Mogán y vendido en la isla. Vendemos directamente a fruterías, mayoristas, hoteles, restaurantes y distribuidores. Sin intermediarios: la fruta sale de nuestras fincas y llega a tu negocio a través de nuestro puesto en el mercado.",
    tradeTeaser: "Disponibilidad por variedad, formatos y calibres, y cómo pedir presupuesto.",
    calendarLabel: "Cuándo hay de cada uno",
    calendarText: "Para planificar tus pedidos. Las semanas exactas dependen de cada año; te las confirmamos al pedir presupuesto.",
    formatsLabel: "Formatos y calibres",
    formatsNote: "Cada caja lleva una sola variedad, fruta seleccionada a mano y una etiqueta con la finca y el día de recogida. Puedes pedirla lista para consumir o con unos días de margen.",
    orderLabel: "Cómo pedir",

    closingLine: "Meses de sol.\n*Un bocado.*"
  },

  // Every photo on the page. `alt` is read aloud by screen readers; `note`
  // is shown in the placeholder and tells the family what to shoot. A
  // `video` plays muted on a loop, with `src` as its still frame.
  photos: {
    hero:     { src: "images/hero-grove.jpg",     alt: "Bancales de mangos subiendo por el barranco de Mogán bajo un cielo azul", note: "Árboles en los bancales" },
    family:   { src: "images/family.jpg",         alt: "Nuestro abuelo sentado bajo un mango, junto a una rama cargada de fruta", note: "La familia entre los árboles" },
    picking:  { src: "images/picking.jpg",        alt: "Bajando por el camino de la finca con mangos recién cogidos en las manos", note: "La recogida" },
    processing: { video: "images/processing.mp4", src: "images/processing-poster.jpg", alt: "Mangos recién cogidos avanzando por la línea de lavado y selección del almacén", note: "La línea de lavado" },
    packing:  { src: "images/warehouse-pallets.jpg", alt: "Palés de cajas negras de MOGANGO apilados en el almacén, listos para salir", note: "El almacén" },
    cut:      { src: "images/mango-cut.jpg",      alt: "Un mango maduro abierto, con la pulpa dorada, sobre una carretilla de fruta recién cogida", note: "Un mango abierto" }
  },

  // The map comes from Mapbox (https://www.mapbox.com). Paste your public
  // access token (it starts with "pk.") from your Mapbox account page.
  mapbox: {
    token: "pk.eyJ1IjoiZ2V0bG9zdHdvcmxkIiwiYSI6ImNrODIzNDJiMjAybGUzbnF0endrNmY2amUifQ.oiv1XT26K46BmoVaWwm5vQ",
    style: "mapbox://styles/mapbox/standard-satellite",
    // Light for the satellite style: "dawn", "day", "dusk" or "night".
    lightPreset: "dusk",
    // The corners of the island, [longitude, latitude]: south-west, north-east.
    island: [[-15.84, 27.73], [-15.35, 28.19]]
  },

  // The family's two fincas, at their exact locations. Sizes, tree
  // counts, years and stories are still placeholders. All three varieties
  // grow at both fincas.
  // `camera` sets the map's angle for each finca: `bearing` is the compass
  // direction the camera looks (0 = north) and `pitch` how far it tilts from
  // straight down. Look along a ravine, not across it, or the ridges hide
  // the finca.
  plantations: [
    {
      id: "molino",
      name: "Finca Molino de Viento",
      region: "Barranco de Mogán",
      lat: 27.87506, lon: -15.72661,
      camera: { bearing: 25, pitch: 50 },
      hectares: 38, trees: 4200, since: 1978,
      blurb: "En el Molino de Viento tuvo el abuelo su primer almacén, en los tiempos de las berenjenas. Hoy sus bancales están llenos de mangos."
    },
    {
      id: "llanos",
      name: "Finca Los Llanos",
      region: "Barranco de Mogán",
      lat: 27.89222, lon: -15.719,
      camera: { bearing: 25, pitch: 50 },
      hectares: 45, trees: 5100, since: 1994,
      blurb: "Más arriba en el barranco, en el llano que da nombre a la finca. El sol de la tarde les da a estos mangos su color rojo intenso."
    }
  ],

  // The shops that sell our mangoes, listed at the foot of the page.
  shops: [
    { name: "Frutería El Faro",    town: "Maspalomas" },
    { name: "Mercado del Sureste", town: "Vecindario" },
    { name: "Frutas San Gregorio", town: "Telde" },
    { name: "Puesto de Vegueta",   town: "Las Palmas de Gran Canaria" },
    { name: "Frutería Gáldar",     town: "Gáldar" }
  ],

  // Tonnes harvested per month, used by the season strip.
  harvest: [
    { month: "Ene", name: "enero",     tonnes: 0 },
    { month: "Feb", name: "febrero",   tonnes: 0 },
    { month: "Mar", name: "marzo",     tonnes: 0 },
    { month: "Abr", name: "abril",     tonnes: 6 },
    { month: "May", name: "mayo",      tonnes: 24 },
    { month: "Jun", name: "junio",     tonnes: 70 },
    { month: "Jul", name: "julio",     tonnes: 165 },
    { month: "Ago", name: "agosto",    tonnes: 210 },
    { month: "Sep", name: "septiembre",tonnes: 150 },
    { month: "Oct", name: "octubre",   tonnes: 72 },
    { month: "Nov", name: "noviembre", tonnes: 18 },
    { month: "Dic", name: "diciembre", tonnes: 0 }
  ],

  // The three mangoes we grow. Seasons are approximate.
  // `availability` has one number per month, January first, for the buyers'
  // calendar: 0 none, 1 a little (start or end of the season), 2 plenty.
  // Made-up for now, to match the seasons below.
  varieties: [
    { name: "Tommy Atkins", availability: [0, 0, 0, 0, 1, 1, 2, 2, 1, 0, 0, 0],
      season: "Julio a agosto",
      taste: "Firme, aguanta bien el viaje y tiene ese rojo intenso que sale en todas las fotos.",
      photo: { src: "images/tommy-atkins.jpg", alt: "Un racimo de mangos Tommy Atkins de un rojo intenso colgando del árbol", note: "Mangos Tommy Atkins en el árbol" } },
    { name: "Kent",         availability: [0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 1, 0],
      season: "Agosto a octubre",
      taste: "Dulce e intenso, casi sin hebra. Para comerlo a cucharadas.",
      photo: { src: "images/kent.jpg",         alt: "Un mango Kent grande, verde con un toque rojizo, colgando entre las hojas", note: "Un mango Kent en el árbol" } },
    { name: "Osteen",       availability: [0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 1],
      season: "Septiembre a noviembre",
      taste: "Alargado y de piel morada, con la pulpa firme, jugosa y casi sin hebra. El tardío.",
      photo: { src: "images/osteen.jpg",       alt: "Mangos Osteen morados colgando del árbol entre hojas verde oscuro", note: "Mangos Osteen en el árbol" } }
  ],

  // The section for business buyers. Formats, calibres, the market stall and the
  // order steps are made-up placeholders until the family confirms them.
  trade: {
    formats: [
      { name: "Caja de 4 kg", detail: "Calibres 8 a 14", use: "Para fruterías y hostelería" },
      { name: "Caja de 6 kg", detail: "Calibres 10 a 18", use: "La más pedida en el mercado" },
      { name: "Palé completo", detail: "120 cajas de 6 kg", use: "Para mayoristas y distribuidores" }
    ],
    steps: [
      { title: "Cuéntanos qué necesitas", text: "Variedad, formato, cantidad y las semanas en que lo quieres." },
      { title: "Te respondemos en 24 horas", text: "Con precio y disponibilidad para esas semanas." },
      { title: "Lo recoges en el mercado", text: "En nuestro puesto de Mercalaspalmas, con la fruta recién llegada de las fincas." }
    ],
    businessTypes: ["Frutería", "Mayorista", "Hotel", "Restaurante", "Distribuidor", "Otro"]
  },

  contact: {
    email: "hola@mogango.example",
    phone: "+34 000 000 000",
    address: "Almacén de empaquetado, Mogán, Gran Canaria"
  }
};
