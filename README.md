# Tall Grass Maps

An interactive atlas of the main Pokémon games. Every town, route, cave and building is mapped with its wild encounters, trainer battles, items, NPCs, signs and static or gift Pokémon at their exact position.

A static client-only React app (Vite, React Router, Tailwind, Leaflet). All content is committed under `src/data` and generated offline by the scripts in `scripts/`.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how the pieces fit together.

## Getting started

```sh
pnpm install
pnpm dev
```

| Command          | What it does                                                                         |
| ---------------- | ------------------------------------------------------------------------------------ |
| `pnpm dev`       | Start the dev server (also registers the Map Maker route at `/legends-za/map-maker`) |
| `pnpm build`     | Typecheck and build for production                                                   |
| `pnpm check`     | Typecheck, lint, format check and tests in one go                                    |
| `pnpm test`      | Run the Vitest suite                                                                 |
| `pnpm storybook` | Run Storybook for the Pokédex, trainer and popup components                          |

## Regenerating data

The generated files in `src/data` and `public` are committed. The generator scripts read pinned `pret/pokered` and `pret/pokeyellow` commits, downloaded into the gitignored `vendor/` folder the first time one runs.

```sh
pnpm pokedex:master     # national dex
pnpm pokedex:rby        # Red/Blue/Yellow Pokédex and encounters
pnpm trainers:rby
pnpm items:rby
pnpm npcs:rby
pnpm signs:rby
pnpm static-pokemon:rby
pnpm connections:rby    # map connections
pnpm wild:rby           # wild encounter areas
pnpm maps:rby           # render location images
pnpm sprites:pokemon    # sprite sets (also sprites:za, sprites:megas, sprites:rby)
pnpm town-map:tall-grass
```

Run a generator, then review the diff of the files it touched before committing.

## Conventions

- Feature-based folders (`pages/Game/Location`, `pages/Game/Pokedex`), not type-based.
- `export const` only, `Array<T>` over `T[]`.
- Format only the files you touch: `pnpm oxfmt <paths>`.
