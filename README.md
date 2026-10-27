# Mogango

The website for our family mango farm. It's one scrolling page that tells the story of our mangoes, from the trees to the shops.

1. **Hero**: a big animated mango and the tagline.
2. **Island tour**: an illustrated map stays pinned on screen while you scroll. The camera flies from grove to grove and highlights each plantation with its hectares, tree count and varieties. It then stops at the packing house, and a delivery truck drives the island road, dropping crates at each shop while customers gather.
3. **In numbers**: totals that count up as they come into view.
4. **The season**: an interactive chart of tonnes harvested per month.
5. **Varieties**: flip cards for each mango, with links that jump back to the groves on the map.
6. **Taste**: click the mango to take bites until only the seed is left.
7. **Contact**: address and the list of shops that sell our mangoes.

Clicking a grove or shop on the map, or a dot on the right-hand rail, jumps the tour to that place. The page works on phones, and it skips the animations for visitors who have "reduce motion" turned on.

## Editing the content

All the names, numbers and places are in **`js/data.js`**, so most changes never touch the rest of the code:

- `plantations`: each grove's name, region, position on the map, size, tree count, varieties and a short story.
- `packingHouse`, `shops` and `route`: the road the truck drives and where it stops. Each shop's `routeIndex` is the point on `route` where it sits.
- `harvest`: tonnes per month for the season chart.
- `varieties`: colours and tasting notes for the flip cards.
- `contact`: footer details.

Map positions use the drawing's own grid: x runs 0 (west) to 1000 (east) and y runs 0 (north) to 700 (south). To match your real island, change the coastline points in `ISLAND_OUTLINE` at the top of `js/map.js`.

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
js/map.js        island drawing, camera flights and the delivery truck
js/main.js       story steps, stats, chart, variety cards, bite-the-mango
```
