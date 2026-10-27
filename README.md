# Mogango

The website for our family mango farm on Gran Canaria. It's one long scrolling page that tells the story of our mangoes, from the trees to your table, in a quiet editorial style: dark green, warm off-white, and a touch of mango orange.

1. **Hero**: a full-screen photo of the groves and the headline.
2. **The farm**: a short introduction to the family and the farm.
3. **Island tour**: a dusk satellite map of Gran Canaria, in 3D, stays pinned on screen while you scroll. The camera flies slowly from finca to finca, each finca's name appears large over the map, and the tour ends on all three together.
4. **Harvest**: three photos of picking, crates and the packing house.
5. **In numbers**: four large totals that count up as they come into view.
6. **The season**: a twelve-month strip. The deeper the fill, the bigger that month's harvest.
7. **Varieties**: one full-screen panel per mango, sliding sideways as you scroll. Each links back to the fincas where it grows.
8. **Closing**: a slow zoom into a cut mango.
9. **Footer**: contact details and the shops that sell our mangoes.

The page works on phones, where the sideways varieties become a simple vertical list. Visitors who have "reduce motion" turned on get no scroll effects; everything just shows.

## Photos

The photos in **`images/`** are the family's own, resized for the web (about 1200 to 1800 pixels on the long side, JPG). To swap one, replace the file with one of the same name, or change its path in `js/data.js`. If a file is missing, the page shows a dark block with a short description of the shot instead.

| File | Where it goes |
| --- | --- |
| `hero-grove.jpg` | Top of the page, full screen |
| `family.jpg` | The farm, next to the year |
| `picking.jpg` | Harvest, photo 1 |
| `crates.jpg` | Harvest, photo 2 |
| `packing-house.jpg` | Harvest, photo 3 |
| `tommy-atkins.jpg`, `kent.jpg`, `osteen.jpg` | One full-screen panel per variety |
| `mango-cut.jpg` | The closing zoom |

Shots that would still lift the page: a close-up of hands cutting a mango from the branch. Shoot in natural light, holding the phone sideways, with the subject in the centre.

## Editing the content

All the words, names, numbers, places and photos are in **`js/data.js`**, so most changes never touch the rest of the code:

- `copy`: every headline and paragraph on the page. Wrap a word in `*stars*` for italics or `_underscores_` for the orange accent.
- `photos`: file, description (`alt`) and placeholder note for each photo.
- `plantations`: each finca's name, region, location (`lat`/`lon`), size, tree count, varieties and a short story.
- `shops`: the shops listed in the footer.
- `mapbox`: your Mapbox token and the map's light (`dusk` by default).
- `harvest`: tonnes per month for the season strip.
- `varieties`: tasting notes, season and photo for each mango.
- `contact`: footer details.

Locations are real coordinates in decimal degrees. To get one, right-click a spot in Google Maps: it shows `latitude, longitude` (for example `27.884, -15.722`).

## The map (Mapbox)

The map and the 3D terrain come from [Mapbox](https://www.mapbox.com), using its Standard Satellite style with a dusk light and the labels turned off. It needs a free account:

1. Sign up at mapbox.com and copy your **default public token** (it starts with `pk.`) from the account page.
2. Paste it into `mapbox.token` in `js/data.js`.
3. Recommended: in the Mapbox account, restrict the token to your website's address (URL restrictions), so nobody else can use it.

The free tier covers 50,000 map loads a month, far more than a family farm site needs. Until a token is added, the map area shows a short note instead of the map. The rest of the page still works.

## Running it locally

It's a plain static site with no build step. Serve the folder with any web server:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

The fonts (Instrument Serif and Inter Tight) come from Google Fonts. The scroll effects use [GSAP](https://gsap.com) 3.13 with ScrollTrigger and SplitText, and [Lenis](https://lenis.darkroom.engineering) 1.3 for smooth scrolling, all loaded from jsDelivr at fixed versions.

## Publishing

Any static host works. For GitHub Pages, go to **Settings → Pages**, choose "Deploy from a branch", pick `main` and `/ (root)`.

## Files

```
index.html       page structure
empresas.html    the page for business buyers (formats, calendar, quote)
css/styles.css   all styling: colours, type and layout
js/data.js       the farm's words, numbers, places and photos (edit this)
js/map.js        Mapbox map and the finca markers
js/main.js       builds the tour, numbers, season strip, varieties and footer
js/motion.js     smooth scrolling and scroll effects
js/trade.js      fills empresas.html and its quote form
images/          the photos (see the list above)
```
