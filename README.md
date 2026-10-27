# Mogango

The website for our family mango farm. It's one scrolling page that tells the story of our mangoes, from the trees to the shops.

1. **Hero**: a big animated mango and the tagline.
2. **Island tour**: a real satellite map of Gran Canaria stays pinned on screen while you scroll. The camera flies from grove to grove and highlights each plantation, drawn at its real size, with its hectares, tree count and varieties. It then stops at the packing house, and a delivery truck drives the real roads (GC-1 and GC-2) around the island, dropping crates at each shop while customers gather.
3. **In numbers**: totals that count up as they come into view.
4. **The season**: an interactive chart of tonnes harvested per month.
5. **Varieties**: flip cards for each mango, with links that jump back to the groves on the map.
6. **Taste**: click the mango to take bites until only the seed is left.
7. **Contact**: address and the list of shops that sell our mangoes.

Clicking a grove or shop on the map, or a dot on the right-hand rail, jumps the tour to that place. The page works on phones, and it skips the animations for visitors who have "reduce motion" turned on.

## Editing the content

All the names, numbers and places are in **`js/data.js`**, so most changes never touch the rest of the code:

- `plantations`: each grove's name, region, location (`lat`/`lon`), size, tree count, varieties and a short story.
- `packingHouse` and `shops`: where the truck starts and stops. Each shop's `routeIndex` is the point on the road in `js/route.js` where it sits.
- `landmarks`: extra place names shown on the map.
- `harvest`: tonnes per month for the season chart.
- `varieties`: colours and tasting notes for the flip cards.
- `contact`: footer details.

Locations are real coordinates in decimal degrees. To get one, right-click a spot in Google Maps: it shows `latitude, longitude` (for example `27.884, -15.722`).

## The map

The satellite image in `img/` is a cloud-free Copernicus Sentinel-2 picture from summer 2024 (10 m per pixel), with terrain shading from elevation data. The road in `js/route.js` follows real roads from Overture Maps (OpenStreetMap data). The credits are shown on the map and in the footer, as the data licences require.

The scripts in `tools/` rebuild both. They need Python with `rasterio pyproj pyarrow networkx pillow shapely requests`, and should be run from a scratch folder:

1. `fetch_satellite.py` and `fetch_satellite_backup_date.py`: download the two satellite passes (the second fills in clouds).
2. `build_map_image.py`: makes `gran-canaria-4000.jpg` and `gran-canaria-1200.jpg`.
3. `find_road_files.py` then `fetch_roads.py`: download the main roads.
4. `build_route.py`: routes the truck through the stops in `stops.json`. Then `write_route_js.py route.json`, run from the repo root, writes `js/route.js`.

If a stop changes, update the shop's `routeIndex` in `js/data.js` to the new index that `build_route.py` prints.

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
js/data.js       the farm's content (edit this)
js/route.js      the delivery road (generated)
js/map.js        satellite map, camera flights and the delivery truck
img/             satellite map images
tools/           scripts that build the map image and the road
js/main.js       story steps, stats, chart, variety cards, bite-the-mango
```
