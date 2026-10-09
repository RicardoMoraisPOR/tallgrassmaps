# Architecture

How Tall Grass Maps is put together. For setup and commands see the [README](../README.md).

## 1. Overview

A static, client-only React app: an interactive atlas of Pokémon games. Each game's region is a zoomable map, and every town, route, cave and building shows its wild encounters, trainer battles, items, NPCs, signs and static or gift Pokémon at their exact position. Each game also has a Pokédex, and the home page lists every game (some marked "coming soon").

There is no backend. All content is committed under `src/data` and generated offline by the scripts in `scripts/`. It deploys on Vercel (`vercel.json` rewrites every path to `/` for SPA routing).

**Stack:** React 19, React Router 8 (`createBrowserRouter`), Vite 8, Tailwind 4, Radix/shadcn primitives, Leaflet + react-leaflet, `motion`, zustand (persisted settings), Storybook, Vitest, oxlint/oxfmt.

| Game              | Version group / region id | Navigation                                         | State                        |
| ----------------- | ------------------------- | -------------------------------------------------- | ---------------------------- |
| Red, Blue, Yellow | `RBY` / `kanto-rby`       | nested (region → location → sub-location → floors) | complete                     |
| Legends: Z-A      | `ZA` / `lumiose-za`       | seamless (one Leaflet map, zones fly to)           | missing content, in progress |

## 2. Repository layout

```
src/
  main.tsx, router.tsx     entry and routes
  index.css                Tailwind and theme tokens
  data/                    all content and its typed accessors (§4)
  pages/                   feature folders: Home, Game, Credits, MapMaker, NotFound, RootLayout
  components/              shared: map/, settings/, ui/ (shadcn), small generic components
  hooks/                   useGameRoute, useMapLayout, useMediaQuery, usePokemonSprite, usePrefersReducedMotion
  stores/                  settings (zustand, persisted)
  lib/                     breakpoints, motion, paths, theme, utils
scripts/                   offline data and asset generators (§9)
public/                    covers, map images, sprites
vendor/                    gitignored pret checkouts used by the scripts
.storybook/                Storybook config and decorators
docs/                      this file (docs/superpowers is gitignored)
```

Folders are feature-based (`pages/Game/Location`, `pages/Game/Pokedex`), not type-based. Tests sit next to the code they cover.

## 3. Routing and page flow

```
/                        RootLayout
  index                  HomePage
  credits                CreditsPage
  legends-za/map-maker   MapMakerPage   (dev builds only, lazy)
  :gameId                GameLayout
    index, *             GamePage
  *                      NotFoundPage
```

- `useGameRoute()` resolves `:gameId` and the splat path into `{ game, region, trail, href }`. `trail` is the chain of `Location` objects from the region down (`/red/pallet-town/players-house/2f` is three segments). Unknown ids return `undefined` and the pages render NotFound.
- `GameLayout` renders the header, the layout toggle (minimalist or immersive) and a `PageTransition` outlet. Transitions are keyed by `/game` versus `/game/location`, or just `/game` for seamless regions.
- `GamePage` picks one of three views: `SeamlessMapPage` when `region.navigation === 'seamless'`, `RegionPage` for an empty trail, otherwise `LocationPage`. The seamless and location pages are lazy-loaded.
- The Pokédex is not a route. It is a drawer driven by the `?pokedex=<number>` query param (`usePokedex`, `usePokedexLink`), so it overlays whichever page is open.
- Region and seamless overview pages show one `GameInfoCard` (`pages/Game/Region`): cover, console, release date, developer, remake status, Pokédex and world counts from `gameStats.ts` (a row is hidden when its section is marked missing in `Game.contentStatus`), a build-progress block, and the Pokédex and Bulbapedia buttons.
- Place search: `GameLayout` wraps every game page in `PlaceSearchProvider` (`pages/Game/Search`). A Search button (and Ctrl/⌘ K, or `/`) opens a palette that searches the region's towns, routes, caves and buildings (`placeSearch.ts`) and navigates to the pick. The button sits in the top-right row in both layouts.

## 4. Data layer (`src/data`)

Data is keyed by **version group** (`RBY`, `ZA`) or **game id** (`red`, `blue`, `yellow`, `legends-za`).

- `games.ts`: the `Game` list (names, platform, release date, developer, wiki article, optional remake source, region id, sprite set and format, colours, per-section `contentStatus` for the "missing content" dialog), plus `getGame` and `gamesSharingMap`.
- `catalog/`: the home page list. `generations.ts` groups games by generation, merging real games with "coming soon" entries from `upcoming.ts`. `CatalogEntry` is `Game | UpcomingGame`, discriminated by `status`. `entries.ts` has the name, region and version-group helpers, `versionGroups.ts` the label letters, and `mapSets.ts` the map switcher list.
- `maps/`: the core model. `Region` → `Location[]` (recursive) → `floors`, `hotspots` (exits and entrances with rect or polygon, travel direction, door/ladder flags, `lands`/`pad` arrival info), `markers` (house, mart, center) and `wildAreas`. Per-game filtering uses an optional `games: string[]` on most things, with `inGame()` and `locationInGame()`.
  - `kanto-rby/` holds the hand-curated Kanto data (`outdoor`, `inside`, `services`, with shared `entries` types and `helpers`) and `build.ts`, which turns it into `Location`s. `index.ts` assembles the `kantoRby` region.
  - `lumiose-za.ts` is the Z-A region.
  - `kanto-rby-connections.json`, `kanto-rby-wild.json` and `kanto-rby-rendered.json` are generated by scripts.
- Per-feature datasets share one shape: `X/index.ts` (`XFor(versionGroup)` lookup), `X/rby.ts` (casts the generated `rby.json`), `X/types.ts`.
  - `pokedex/` (entries and encounters per method, location and floor; `master-data.json` is the national dex; `rby/` and `za/` per version group)
  - `trainers/` (RBY and ZA)
  - `items/`, `npcs/`, `signs/`, `static-pokemon/` (RBY only)
- `sprites.ts`, `covers.ts`, `credits.ts`, `changelog.ts`, `site.ts`: asset path helpers and static site content.

Generated JSON already contains final sprite paths (`/sprites/rby/overworld/…`), so the adapters do no post-processing.

For a location, `LocationPage` reads every `XFor(versionGroup)` and filters by `dataPath` (the dataset key, which can differ from the URL through `Location.dataPath`), the current floor and the current game id.

## 5. Map stack (`components/map`)

Leaflet runs in `CRS.Simple` (pixel coordinates, no tiles) with the map image as an `ImageOverlay`.

- `MapViewer`: the interactive map for a location. Its parts live in `viewer/`: `MapIcon`, `HoverCard`, `MapSprite`, `LinkShape`, `PinControls`, `ViewportEffects`, plus `iconArt`, `links`, `constants` and the `MapLink` types.
- `SeamlessMap`: the single large Lumiose map. Zones are polygons that fly to on selection.
- `RegionMap`, `RegionImage`, `PlacesMap`: region overview rendering with pointer, cursor and label sprites.
- `coordinates.ts` converts image pixels to lat/lng. `MapZoomControls`, `HotspotOutline`, `LocationCursor`, `LocationLabel` and `AnimatedSprite` are small pieces.
- `pages/Game/mapFrame.ts`: `useMapFrame(versionGroup)` animates the map frame between the old and new size when the layout toggle is pressed. The toggle captures the frame's rect just before the layout changes.
- `pages/MapMaker` is a dev-only tool for clicking polygons on the Z-A map and copying coordinates into `lumiose-za.ts`.

## 6. Location page (`pages/Game/Location`)

The largest feature. `LocationPage` orchestrates:

- **State:** floor (`useFloor`), event variant (`useEventState`), layer visibility (`useMapLayers`), selected, highlighted and pinned keys, the arrival highlight and the Town Map dialog.
- **Derived data:** `battleGroups` (`trainerList`), `encounterGroups` (`encounters`) and `locationLinks`.
- **UI:** `MapViewer` and `LocationPanel` with three tabs (`MapInfoTab`, `EncountersTab`, `TrainersTab`), `TrainerDialog` (parts in `trainer-dialog/`), `TrainerTooltip`, `WildPopup` and `StaticPopup`, `MapTextTooltip`, `FloorPicker`, `EventPicker`, `TownMapCard` and `TownMapDialog`.

`locationLinks.ts` composes the builders in `links/` into the map's `MapLink`s and the layer panel entries:

| File                                                           | Builds                                                              |
| -------------------------------------------------------------- | ------------------------------------------------------------------- |
| `connections.ts`                                               | hotspot links, floor-exit labels, teleporter pads, connection icons |
| `buildings.ts`                                                 | house, mart and center markers and their door icons                 |
| `items.ts`, `trainers.ts`, `npcs.ts`, `signs.ts`, `statics.ts` | one marker builder per layer                                        |
| `wild.ts`                                                      | wild-area outlines                                                  |
| `gifts.ts`                                                     | gift entries collected from trainers and NPC dialog                 |
| `arrivals.ts`, `floors.ts`                                     | arrival pairing keys, floor step and naming                         |
| `panel.ts`                                                     | grouping links into the layer panel sections                        |
| `tiles.ts`, `keys.ts`, `types.ts`                              | tile math, entry keys, shared types                                 |

"Highlight keys" (`wild:walk`, `static:25`, `trade:…`, `prize:…`, `arrival:…`) are what let hovering a row in a tab highlight the matching thing on the map, and what pair a door on one map with its arrival point on the next.

## 7. Pokédex, theming, settings

- **Pokédex:** `Pokedex.tsx` picks a view from `pokedexViews[versionGroup][themeStyle]`. The `tall-grass` and `rby` styles share `ListPokedex.tsx` (drawer, search, list) and differ by a skin: title, row, class names (`tallGrassSkin.ts`, `rbySkin.ts`). `za/` has its own drawer, search, preview pane and rows, and reuses `PokedexList`. `usePokedexSearch` and `entryDetails.ts` are shared; `MegaEvolutions` and `EncounterPlaces` are detail sections. All views are lazy-loaded so their fonts only load when used.
- **Theming:** two styles, `game` and `tall-grass`, chosen per area (pokedex, mapIcons, dialogBoxes, trainers, pokemonPopups, sprites) through `useThemeStyle(area)`. Presets (`game`, `tall-grass`, `custom`) set every area at once. Light and dark is separate (`lib/theme.ts`, a class on `<html>`, localStorage key `tall-grass-theme`).
- **Settings:** `stores/settings.ts` is a persisted zustand store (`tallgrass-settings`, version 2 with a migration) holding animations, game pointer, theme preset and areas, map layer toggles, last location tab and the map layout per version group. `useMapLayout` (in `hooks/`) falls back to immersive on mobile when no layout is saved.
- **Breakpoints:** `lib/breakpoints.ts` holds the media queries; components use `useMediaQuery`.
- **Motion:** `lib/motion.ts` (easings, and a reduced-motion check that also respects the animations setting), `PageTransition`, and the home hero timeline.

## 8. Home page

`HomePage` is the hero, `GamesSection` and a footer. The hero is an animated "exploding layers" Kanto Town Map (`HeroTownMap`, `HeroMapStack`, `HeroMapLayer`, `HeroMapSlab`, `heroMapTimeline`). `GamesSection` has filters (`useFilters`, `filters.ts`, `GameFilters`), a `GameCard` per catalog entry, `MissingContentDialog` and `ChangelogBadge`/`ChangelogDialog`.

## 9. Scripts (offline pipeline)

Plain `node scripts/…mjs`, run through `pnpm` scripts. None run at build time and their outputs are committed. The generators for npcs, trainers, signs and static Pokémon are deterministic, so re-running one gives a diff only when the source or the script changed (format the JSON with `oxfmt` afterwards).

- `scripts/rby/*`: the shared pret toolkit. `disassembly.mjs` downloads pinned `pret/pokered` and `pret/pokeyellow` commits into `vendor/` and exports helpers such as `spriteUrl` and `overworldSprite`. `text.mjs`, `tiles.mjs` and `map-tiles.mjs` parse assets. `render-maps.mjs` draws location PNGs into `public/maps/rby`, `clean-maps.mjs` makes the NPC-free versions, and `connections.mjs` and `wild-areas.mjs` write the JSON used by `data/maps/kanto-rby`.
- `scripts/{pokedex,trainers,items,npcs,signs,static-pokemon}/rby.mjs`: write the matching `src/data/*/rby.json`. `pokedex/master.mjs` builds the national dex.
- `scripts/sprites/*`: fetch and process Pokémon, Z-A, mega and RBY overworld sprites into `public/sprites`. Z-A sprites are written as lossy WebP through `scripts/lib/webp.mjs` (sharp); the others stay PNG.
- `scripts/town-map/*`: generates the site-styled "Tall Grass" Town Map (see the `tall-grass-town-map` skill).

## 10. Tooling and tests

- `pnpm check` runs typecheck, lint, format check and tests. The typecheck is `tsc -p tsconfig.app.json` (plain `tsc -p .` checks nothing); `pnpm build` runs `tsc -b && vite build`.
- Format with oxfmt on the files you touch (`pnpm oxfmt <paths>`).
- Tests (Vitest, `pnpm test`) are characterisation tests that protect refactors:
  - `locationLinks.test.ts` hashes the output for every location, floor and game in the data.
  - `kanto-rby.test.ts` hashes every location of the Kanto region.
  - `catalog.test.ts` snapshots entries, map sets and version-group labels.
  - `datasets.test.ts` hashes the RBY datasets, checks that every sprite path points at an existing file under `public/`, and checks facings.

  After an intended data or code change, review the mismatch and update with `pnpm vitest run -u`.

- Storybook covers the Pokédex views, trainer dialog and tooltip, wild popup and map icons. Story-only helpers live in `stories/` subfolders next to the feature (`Pokedex/stories`, `Location/stories`).
