/*
 * Mogango site content.
 *
 * Everything the story shows lives here, so you can change names, numbers
 * and places without touching the rest of the code.
 *
 * Map coordinates use the island drawing's own grid: x goes 0 (west) to
 * 1000 (east) and y goes 0 (north) to 700 (south). The island fills roughly
 * x 140–900 and y 100–600.
 */
window.MOGANGO = {
  farmName: "Mogango",
  islandName: "our island",
  tagline: "Sun-ripened mangoes, grown by one family since 1978.",

  plantations: [
    {
      id: "norte",
      name: "Finca El Norte",
      region: "Northern valley",
      x: 420, y: 205, radius: 46,
      hectares: 38, trees: 4200, since: 1978,
      varieties: ["Kent", "Haden"],
      blurb: "Where it all started. Grandpa planted the first 200 trees here on land that used to be sugar cane."
    },
    {
      id: "poniente",
      name: "Los Ponientes",
      region: "Western hills",
      x: 265, y: 330, radius: 52,
      hectares: 45, trees: 5100, since: 1986,
      varieties: ["Tommy Atkins", "Keitt"],
      blurb: "Afternoon sun and a cool sea breeze give these mangoes their deep red blush."
    },
    {
      id: "valle",
      name: "Valle Dorado",
      region: "Central lowlands",
      x: 368, y: 478, radius: 40,
      hectares: 29, trees: 3300, since: 1994,
      varieties: ["Ataulfo"],
      blurb: "Small, buttery honey mangoes, the family favourite for breakfast."
    },
    {
      id: "costa",
      name: "La Costa Sur",
      region: "South coast",
      x: 630, y: 488, radius: 44,
      hectares: 41, trees: 4600, since: 2003,
      varieties: ["Kent", "Keitt"],
      blurb: "Sandy soil and long hot days. These are always the first trees to flower each season."
    },
    {
      id: "oriente",
      name: "Alto Oriente",
      region: "Eastern slopes",
      x: 738, y: 292, radius: 46,
      hectares: 52, trees: 5800, since: 2011,
      varieties: ["Tommy Atkins", "Haden", "Kent"],
      blurb: "Our newest and biggest grove, terraced into the hillside with drip irrigation."
    }
  ],

  packingHouse: {
    name: "The Packing House",
    x: 500, y: 345,
    blurb: "Every mango is washed, sorted by hand and packed within 24 hours of picking."
  },

  // The truck drives this road in order. Each shop sits on one of these
  // points, so the truck stops exactly at its door.
  route: [
    [500, 345], [455, 372], [400, 395], [330, 418], [262, 440], [205, 462],
    [250, 512], [330, 540], [410, 552], [482, 552],
    [560, 545], [640, 552], [720, 520], [780, 470], [818, 410],
    [835, 340], [810, 270], [745, 205], [680, 168], [618, 150]
  ],

  shops: [
    { name: "Mercado Puerto Oeste", town: "West Port",  routeIndex: 5,  x: 205, y: 462, label: "below" },
    { name: "Frutería La Plaza",    town: "San Miguel", routeIndex: 9,  x: 482, y: 552, label: "below" },
    { name: "Tienda del Muelle",    town: "East Harbour", routeIndex: 14, x: 818, y: 410, label: "right" },
    { name: "Super Norte",          town: "Villa Norte", routeIndex: 19, x: 618, y: 150, label: "above" }
  ],

  // Scenery only.
  mountain: { name: "Cerro Grande", x: 590, y: 320 },

  // Tonnes harvested per month, used by the season chart.
  harvest: [
    { month: "Jan", tonnes: 0 },
    { month: "Feb", tonnes: 0 },
    { month: "Mar", tonnes: 12 },
    { month: "Apr", tonnes: 48 },
    { month: "May", tonnes: 135 },
    { month: "Jun", tonnes: 210 },
    { month: "Jul", tonnes: 185 },
    { month: "Aug", tonnes: 96 },
    { month: "Sep", tonnes: 34 },
    { month: "Oct", tonnes: 6 },
    { month: "Nov", tonnes: 0 },
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
    phone: "+00 000 000 000",
    address: "The Packing House, Camino Real s/n"
  }
};
