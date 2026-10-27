# Mogango

The website for our family mango farm on Gran Canaria. It's one long scrolling page that tells the story of our mangoes, from the trees to the shops, in a quiet editorial style: dark green, warm off-white, and a touch of mango orange.

1. **Hero**: a full-screen photo of the groves and the headline.
2. **The farm**: a short introduction to the family and the farm.
3. **Island tour**: a dusk satellite map of Gran Canaria, in 3D, stays pinned on screen while you scroll. The camera flies slowly from grove to grove, each grove's name appears large over the map, and then a truck drives the real roads from the packing house to every shop.
4. **Harvest**: three photos of picking, crates and the packing house.
5. **In numbers**: four large totals that count up as they come into view.
6. **The season**: a twelve-month strip. The deeper the fill, the bigger that month's harvest.
7. **Varieties**: one full-screen panel per mango, sliding sideways as you scroll. Each links back to the groves where it grows.
8. **Closing**: a slow zoom into a cut mango.
9. **Footer**: contact details and the shops that sell our mangoes.

The page works on phones, where the sideways varieties become a simple vertical list. Visitors who have "reduce motion" turned on get no scroll effects; everything just shows.

## Photos we need

Put each photo in the **`images/`** folder with exactly the file name below. Until a photo is there, the page shows a dark block with a short description of the shot, so the layout still looks finished.

Shoot in natural light, with no filters, and hold the phone **sideways** unless the note says upright. Bigger is better: at least 2000 pixels on the long side, saved as JPG.

| File | Where it goes | What to shoot |
| --- | --- | --- |
| `hero-grove.jpg` | Top of the page, full screen | Rows of trees on the hillside at golden hour, low sun through the leaves. Sideways, wide, with sky at the top. |
| `family.jpg` | The farm | The family standing among the trees, relaxed and unposed. **Upright.** |
| `picking-hands.jpg` | Harvest, photo 1 | Close-up of hands cutting a mango from the branch, with a bit of stem. |
| `crates.jpg` | Harvest, photo 2 | Full crates of mangoes, shot from directly above. **Upright.** |
| `packing-house.jpg` | Harvest, photo 3 | Inside the packing house, people sorting fruit by hand. Wide. |
| `mango-cut.jpg` | Closing zoom | A ripe mango cut open and scored into cubes, close up, on a dark background. Keep the fruit in the centre. |
| `kent.jpg` | Varieties: Kent | A Kent mango, whole and halved, lit from the side. Dark background. |
| `haden.jpg` | Varieties: Haden | A Haden mango still on its branch. |
| `tommy-atkins.jpg` | Varieties: Tommy Atkins | Tommy Atkins mangoes in a crate, close, showing the red blush. |
| `keitt.jpg` | Varieties: Keitt | A green Keitt mango on dark stone or wood. |
| `ataulfo.jpg` | Varieties: Ataulfo | A handful of small Ataulfo mangoes held in a hand. |

The variety photos fill the whole screen with the name over the lower left, so leave some calm space at the bottom of the frame. The descriptions screen readers read out (`alt`) live next to each photo in `js/data.js`.

## Editing the content

All the words, names, numbers, places and photos are in **`js/data.js`**, so most changes never touch the rest of the code:

- `copy`: every headline and paragraph on the page. Wrap a word in `*stars*` for italics or `_underscores_` for the orange accent.
- `photos`: file, description (`alt`) and placeholder note for each photo.
- `plantations`: each grove's name, region, location (`lat`/`lon`), size, tree count, varieties and a short story.
- `packingHouse` and `shops`: where the truck starts and where it stops, in order. Mapbox works out the road between them.
- `mapbox`: your Mapbox token and the map's light (`dusk` by default).
- `harvest`: tonnes per month for the season strip.
- `varieties`: tasting notes, season and photo for each mango.
- `contact`: footer details.

Locations are real coordinates in decimal degrees. To get one, right-click a spot in Google Maps: it shows `latitude, longitude` (for example `27.884, -15.722`).

## The map (Mapbox)

The map, the 3D terrain and the truck's route come from [Mapbox](https://www.mapbox.com), using its Standard Satellite style with a dusk light and the labels turned off. It needs a free account:

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
css/styles.css   all styling: colours, type and layout
js/data.js       the farm's words, numbers, places and photos (edit this)
js/map.js        Mapbox map, markers and the delivery truck
js/main.js       builds the tour, numbers, season strip, varieties and footer
js/motion.js     smooth scrolling and scroll effects
images/          the photos (see the list above)
```
