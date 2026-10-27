# Mogango

The website for our family mango farm. It's one scrolling page that tells the story of our mangoes, from the trees to the shops.

1. **Hero**: a big animated mango and the tagline.
2. **Island tour**: a Mapbox satellite map of Gran Canaria, in 3D, stays pinned on screen while you scroll. The camera flies from grove to grove and highlights each plantation, drawn at its real size, with its hectares, tree count and varieties. It then stops at the packing house, and a delivery truck drives the real roads around the island to each shop, dropping off crates.
3. **In numbers**: totals that count up as they come into view.
4. **The season**: an interactive chart of tonnes harvested per month.
5. **Varieties**: flip cards for each mango, with links that jump back to the groves on the map.
6. **Taste**: click the mango to take bites until only the seed is left.
7. **Contact**: address and the list of shops that sell our mangoes.

Clicking a grove or shop on the map, or a dot on the right-hand rail, jumps the tour to that place. The page works on phones, and it skips the animations for visitors who have "reduce motion" turned on.

## Editing the content

All the names, numbers and places are in **`js/data.js`**, so most changes never touch the rest of the code:

- `plantations`: each grove's name, region, location (`lat`/`lon`), size, tree count, varieties and a short story.
- `packingHouse` and `shops`: where the truck starts and where it stops, in order. Mapbox works out the road between them.
- `mapbox`: your Mapbox token (see below).
- `harvest`: tonnes per month for the season chart.
- `varieties`: colours and tasting notes for the flip cards.
- `contact`: footer details.

Locations are real coordinates in decimal degrees. To get one, right-click a spot in Google Maps: it shows `latitude, longitude` (for example `27.884, -15.722`).

## The map (Mapbox)

The map, the 3D terrain and the truck's route come from [Mapbox](https://www.mapbox.com). It needs a free account:

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

## Publishing

Any static host works. For GitHub Pages, go to **Settings → Pages**, choose "Deploy from a branch", pick `main` and `/ (root)`.

## Files

```
index.html       page structure
css/styles.css   all styling and animation
js/data.js       the farm's content and Mapbox token (edit this)
js/map.js        Mapbox map, markers and the delivery truck
js/main.js       story steps, stats, chart, variety cards, bite-the-mango
```
