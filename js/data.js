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
  farmName: "Mogango",
  islandName: "Gran Canaria",
  since: 1978,
  tagline: "Sun-ripened mangoes from the valleys of Gran Canaria, grown by one family since 1978.",

  // The words on the page, top to bottom. Wrap a word in *stars* to set it
  // in italics; wrap it in _underscores_ to give it the orange accent;
  // \n starts a new line.
  copy: {
    heroTitle: "From our trees to your _table._",
    heroLine: "Family mango farm · Gran Canaria · since 1978",

    introLabel: "The farm",
    introTitle: "Three generations, three fincas and one fruit we have never stopped *learning* about.",
    introText: "Our grandfather planted two hundred trees on the terraces of the Mogán valley in 1978. Today the family looks after three fincas in the Mogán and Tasarte valleys. Every mango is still picked by hand, at the moment it is ready, and on a shop shelf within two days.",

    tourLabel: "The island",

    harvestLabel: "Harvest",
    harvestTitle: "Picked at dawn. *Packed* by noon.",
    harvestText: "The crews start before the heat, cutting each mango with a short piece of stem so the sap stays inside. By midday the crates are at the packing house, where every fruit is washed, sorted by hand and cooled.",

    numbersLabel: "In numbers",

    seasonLabel: "The season",
    seasonTitle: "Six months of *sun*, one short season.",
    seasonText: "The first fruit comes in April from the warmest, lowest terraces. Most of the harvest falls between July and September.",

    varietiesLabel: "What we grow",
    varietiesTitle: "Five mangoes, five *characters*.",
    varietiesText: "Each variety ripens at its own pace and suits its own valley. These are the ones we grow.",

    closingLine: "Months of sun.\n*One bite.*"
  },

  // Every photo on the page. `alt` is read aloud by screen readers; `note`
  // is shown in the placeholder and tells the family what to shoot.
  photos: {
    hero:     { src: "images/hero-grove.jpg",    alt: "Rows of mango trees on a terraced hillside at golden hour",       note: "Trees at golden hour, low sun through the leaves" },
    family:   { src: "images/family.jpg",        alt: "The family standing together between the mango trees",            note: "The family among the trees, natural and unposed" },
    picking:  { src: "images/picking-hands.jpg", alt: "Hands cutting a ripe mango from the branch",                      note: "Close-up of hands picking a mango" },
    crates:   { src: "images/crates.jpg",        alt: "Wooden crates full of freshly picked mangoes",                    note: "Full crates, shot from above" },
    packing:  { src: "images/packing-house.jpg", alt: "Inside the packing house, mangoes being sorted by hand",          note: "Packing house interior, people sorting fruit" },
    cut:      { src: "images/mango-cut.jpg",     alt: "A ripe mango cut open, its golden flesh scored into cubes",       note: "A cut mango, close and glistening, dark background" }
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

  // The family's three fincas, at their exact locations. Sizes, tree
  // counts, years, varieties and stories are still placeholders.
  plantations: [
    {
      id: "molino",
      name: "Finca Molino de Viento",
      region: "Mogán valley",
      lat: 27.87506, lon: -15.72661,
      hectares: 38, trees: 4200, since: 1978,
      varieties: ["Kent", "Haden"],
      blurb: "Where it all started. Grandpa planted the first 200 trees on the terraces of the Mogán valley."
    },
    {
      id: "llanos",
      name: "Finca Los Llanos",
      region: "Mogán valley",
      lat: 27.89222, lon: -15.719,
      hectares: 45, trees: 5100, since: 1994,
      varieties: ["Tommy Atkins", "Keitt"],
      blurb: "Higher up the valley, on the flat land that gives the finca its name. The afternoon sun gives these mangoes their deep red blush."
    },
    {
      id: "tasarte",
      name: "Finca de Tasarte",
      region: "Tasarte valley",
      lat: 27.89072, lon: -15.78169,
      hectares: 29, trees: 3300, since: 2003,
      varieties: ["Ataulfo", "Kent"],
      blurb: "A quiet valley running down to the west coast. Small, buttery honey mangoes, the family favourite for breakfast."
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
    { month: "Jan", name: "January",   tonnes: 0 },
    { month: "Feb", name: "February",  tonnes: 0 },
    { month: "Mar", name: "March",     tonnes: 0 },
    { month: "Apr", name: "April",     tonnes: 6 },
    { month: "May", name: "May",       tonnes: 24 },
    { month: "Jun", name: "June",      tonnes: 70 },
    { month: "Jul", name: "July",      tonnes: 165 },
    { month: "Aug", name: "August",    tonnes: 210 },
    { month: "Sep", name: "September", tonnes: 150 },
    { month: "Oct", name: "October",   tonnes: 72 },
    { month: "Nov", name: "November",  tonnes: 18 },
    { month: "Dec", name: "December",  tonnes: 0 }
  ],

  varieties: [
    { name: "Kent",         season: "July to September",
      taste: "Rich and sweet with almost no fibre. Best eaten with a spoon.",
      photo: { src: "images/kent.jpg",         alt: "A Kent mango, green with a soft red blush",        note: "Kent mango, whole and halved, side light" } },
    { name: "Haden",        season: "June to August",
      taste: "The classic. Bright, aromatic and a little tangy.",
      photo: { src: "images/haden.jpg",        alt: "A Haden mango, yellow with a bright red blush",    note: "Haden mango on its branch" } },
    { name: "Tommy Atkins", season: "June to September",
      taste: "Firm, travels well, with the deep red blush you see in every picture.",
      photo: { src: "images/tommy-atkins.jpg", alt: "A Tommy Atkins mango with deep red skin",          note: "Tommy Atkins mangoes in a crate, close" } },
    { name: "Keitt",        season: "September to November",
      taste: "Stays green when ripe. Juicy and sweet, the last of the season.",
      photo: { src: "images/keitt.jpg",        alt: "A large green Keitt mango",                        note: "Keitt mango, green skin, on dark stone" } },
    { name: "Ataulfo",      season: "May to July",
      taste: "Small honey mango. Silky and very sweet, with a thin seed.",
      photo: { src: "images/ataulfo.jpg",      alt: "Small golden Ataulfo honey mangoes",               note: "A handful of Ataulfo mangoes in a hand" } }
  ],

  contact: {
    email: "hola@mogango.example",
    phone: "+34 000 000 000",
    address: "The Packing House, Arguineguín, Gran Canaria"
  }
};
