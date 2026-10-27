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

  // The satellite map image and the area it covers.
  map: {
    image: "img/gran-canaria-4000.jpg",
    preview: "img/gran-canaria-1200.jpg",
    west: -15.87, east: -15.33, south: 27.72, north: 28.2,
    // Pixel size of the full image, used for its shape.
    pixelWidth: 5310, pixelHeight: 5321,
    credit: "Imagery: Copernicus Sentinel-2 (2024) · Roads: © OpenStreetMap contributors via Overture Maps · Terrain: AWS Terrain Tiles"
  },

  // Each grove's name sits below it unless `label` says "left" or "right".
  plantations: [
    {
      id: "mogan",
      name: "Finca Valle de Mogán",
      region: "Mogán valley",
      lat: 27.884, lon: -15.722, label: "right",
      hectares: 38, trees: 4200, since: 1978,
      varieties: ["Kent", "Haden"],
      blurb: "Where it all started. Grandpa planted the first 200 trees on the terraces of the Mogán valley."
    },
    {
      id: "veneguera",
      name: "Finca Veneguera",
      region: "Veneguera ravine",
      lat: 27.864, lon: -15.768, label: "left",
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

  // The road the truck drives is in js/route.js. `routeIndex` is the point
  // on that road where each shop sits, so the truck stops at its door.
  // `label` places the name: "right" (default), "left", "above" or "below".
  shops: [
    { name: "Frutería El Faro",    town: "Maspalomas", routeIndex: 57, label: "below" },
    { name: "Mercado del Sureste", town: "Vecindario", routeIndex: 128 },
    { name: "Frutas San Gregorio", town: "Telde",      routeIndex: 178 },
    { name: "Puesto de Vegueta",   town: "Las Palmas de Gran Canaria", routeIndex: 237 },
    { name: "Frutería Gáldar",     town: "Gáldar",     routeIndex: 377, label: "above" }
  ],

  // Extra names shown on the map for orientation.
  landmarks: [
    { name: "Roque Nublo", lat: 27.969, lon: -15.613 },
    { name: "Pico de las Nieves", lat: 27.959, lon: -15.571 },
    { name: "Agaete", lat: 28.1, lon: -15.7 }
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
