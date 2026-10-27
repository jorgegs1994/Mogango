/*
 * Mogango site content.
 *
 * Everything the story shows lives here, so you can change names, numbers
 * and places without touching the rest of the code.
 *
 * Places use real coordinates: `lat` and `lon` in decimal degrees, the same
 * numbers Google Maps shows when you right-click a spot (it shows lat first).
 * The plantations, packing house and shop names below are placeholders until
 * we have the family's real ones.
 */
window.MOGANGO = {
  farmName: "Mogango",
  islandName: "Gran Canaria",
  tagline: "Sun-ripened mangoes from the valleys of Gran Canaria, grown by one family since 1978.",

  // The map comes from Mapbox (https://www.mapbox.com). Paste your public
  // access token (it starts with "pk.") from your Mapbox account page.
  mapbox: {
    token: "pk.eyJ1IjoiZ2V0bG9zdHdvcmxkIiwiYSI6ImNrODIzNDJiMjAybGUzbnF0endrNmY2amUifQ.oiv1XT26K46BmoVaWwm5vQ",
    style: "mapbox://styles/mapbox/satellite-streets-v12",
    // The corners of the island, [longitude, latitude]: south-west, north-east.
    island: [[-15.84, 27.73], [-15.35, 28.19]]
  },

  plantations: [
    {
      id: "mogan",
      name: "Finca Valle de Mogán",
      region: "Mogán valley",
      lat: 27.884, lon: -15.722,
      hectares: 38, trees: 4200, since: 1978,
      varieties: ["Kent", "Haden"],
      blurb: "Where it all started. Grandpa planted the first 200 trees on the terraces of the Mogán valley."
    },
    {
      id: "veneguera",
      name: "Finca Veneguera",
      region: "Veneguera ravine",
      lat: 27.864, lon: -15.768,
      hectares: 45, trees: 5100, since: 1986,
      varieties: ["Tommy Atkins", "Keitt"],
      blurb: "A quiet ravine running down to the sea. Afternoon sun gives these mangoes their deep red blush."
    },
    {
      id: "aldea",
      name: "Finca La Aldea",
      region: "La Aldea de San Nicolás",
      lat: 27.985, lon: -15.775,
      hectares: 29, trees: 3300, since: 1994,
      varieties: ["Ataulfo"],
      blurb: "The west coast's farming valley. Small, buttery honey mangoes, the family favourite for breakfast."
    },
    {
      id: "espino",
      name: "Finca Cercado de Espino",
      region: "Arguineguín ravine",
      lat: 27.818, lon: -15.665,
      hectares: 41, trees: 4600, since: 2003,
      varieties: ["Kent", "Keitt"],
      blurb: "Warm, sheltered and close to the coast. These are always the first trees to flower each season."
    },
    {
      id: "fataga",
      name: "Finca Fataga",
      region: "Fataga valley",
      lat: 27.862, lon: -15.575,
      hectares: 52, trees: 5800, since: 2011,
      varieties: ["Tommy Atkins", "Haden", "Kent"],
      blurb: "Our newest and biggest grove, among the palms of the Fataga valley, watered by drip irrigation."
    }
  ],

  packingHouse: {
    name: "The Packing House",
    lat: 27.76589, lon: -15.66902,
    blurb: "Down by the coast at Arguineguín, every mango is washed, sorted by hand and packed within 24 hours of picking."
  },

  // The truck drives from the packing house to each shop in this order,
  // along the real roads Mapbox picks.
  shops: [
    { name: "Frutería El Faro",    town: "Maspalomas", lat: 27.76407, lon: -15.58146 },
    { name: "Mercado del Sureste", town: "Vecindario", lat: 27.84179, lon: -15.44007 },
    { name: "Frutas San Gregorio", town: "Telde",      lat: 27.99887, lon: -15.41845 },
    { name: "Puesto de Vegueta",   town: "Las Palmas de Gran Canaria", lat: 28.10177, lon: -15.4157 },
    { name: "Frutería Gáldar",     town: "Gáldar",     lat: 28.14108, lon: -15.65305 }
  ],

  // Tonnes harvested per month, used by the season chart.
  harvest: [
    { month: "Jan", tonnes: 0 },
    { month: "Feb", tonnes: 0 },
    { month: "Mar", tonnes: 0 },
    { month: "Apr", tonnes: 6 },
    { month: "May", tonnes: 24 },
    { month: "Jun", tonnes: 70 },
    { month: "Jul", tonnes: 165 },
    { month: "Aug", tonnes: 210 },
    { month: "Sep", tonnes: 150 },
    { month: "Oct", tonnes: 72 },
    { month: "Nov", tonnes: 18 },
    { month: "Dec", tonnes: 0 }
  ],

  varieties: [
    { name: "Kent",         color: "#e9a227", blush: "#7fae3a", taste: "Rich and sweet with almost no fibre. Great for eating with a spoon." },
    { name: "Haden",        color: "#f0b530", blush: "#d6452b", taste: "The classic. Bright, aromatic and a little tangy." },
    { name: "Tommy Atkins", color: "#d9952b", blush: "#c0392b", taste: "Firm, travels well, and has that red blush you see in every picture." },
    { name: "Keitt",        color: "#8fbf45", blush: "#5f9a2f", taste: "Stays green when ripe. Juicy and sweet, ripens late in the season." },
    { name: "Ataulfo",      color: "#f6c22c", blush: "#f2a516", taste: "Small honey mango. Silky, very sweet, with a thin seed." }
  ],

  contact: {
    email: "hola@mogango.example",
    phone: "+34 000 000 000",
    address: "The Packing House, Arguineguín, Gran Canaria"
  }
};
