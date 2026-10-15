# Cleanup audit

Checklist of "vibe coded" tells, checked against the repo on 2026-10-15. Each item says what was found, whether it needs fixing, and what to do. Items marked **not verified** were not tested in a browser.

Summary: the codebase is in good shape on the code-hygiene list. The real issues are inconsistent type and radius sizes, a few duplicated patterns, two animation libraries, missing error and loading states, and some copy.

## Code

### Inconsistent spacing and styling: fix

Found:

- Text sizes. Besides the Tailwind scale (`text-xs` 84 uses, `text-sm` 63), there are arbitrary sizes: `text-[13px]` (61), `text-[8px]` (23), `text-[10px]` (22), `text-[11px]` (18). `13px` sits between `xs` and `sm` and is used almost as much as them.
- Radius. `rounded-lg` (32), `rounded-md` (21), `rounded-xl` (13) are mixed with `rounded-[14px]` (14) and `rounded-[10px]` (14).
- Page titles. `h1` is `text-4xl sm:text-5xl` with the same tracking on Maps, Credits, Data Lake, Changelog and Pokédex (copy-pasted class string). NotFound and Pokémon Sprites use `text-3xl tracking-tight`. The game page header uses `text-2xl sm:text-3xl`.
- Container. `Container` defaults to `max-w-6xl px-4`. Home overrides it to `max-w-[88rem]`, so pages disagree on width. Page top and bottom padding differs per page (`pt-10`, `pt-14`, `py-8`, `pb-18`).
- 224 arbitrary pixel or rem values in class names.

Suggestion:

1. Pick a small type scale and stop using one-off sizes. Either define `--text-compact: 0.8125rem` (13px) in `index.css` `@theme` so `text-compact` exists, or move those uses to `text-xs` or `text-sm`. Keep `8px` and `10px` only for map labels and sprites, and name them.
2. Radius: use `rounded-md` for controls, `rounded-lg` for cards, `rounded-full` for pills. Replace the `[14px]` and `[10px]` uses or add them as theme tokens if they are deliberate.
3. Extract a `PageTitle` component (one place for the long `h1` class string) and use it on every top-level page.
4. Give `Container` a `size` prop (`default`, `wide`) instead of per-page `max-w` overrides, and a `PageSection` wrapper for the standard vertical padding.

### Several patterns for the same job: fix, small

Found:

- Animation: three systems.
  - `motion` (18 files).
  - `react-transition-group` plus the Web Animations API in `PageTransition.tsx` (only file using it).
  - CSS: `@keyframes` in `index.css` (diorama, map icons, nerd scan), `tw-animate-css` classes (`animate-in`, `fade-in`), and inline `transition` strings.
- Reduced motion has three entry points: `prefersReducedMotion()` in `lib/motion.ts`, the `usePrefersReducedMotion` hook, and Tailwind `motion-safe:` / `motion-reduce:`. Some are fine (non-React code needs the function), but the hook and the function should share one source.
- Touch detection: `isTouchDevice()` in `diorama/config.ts` and a separate `matchMedia(DESKTOP_QUERY)` in `GameAside.tsx`, next to a `useMediaQuery` hook.
- Cover image with blurred backdrop is written twice, in `GameCover.tsx` and `MapCard.tsx` (same `scale-125 ... opacity-60 blur-xl` image plus the same `drop-shadow` on the foreground).
- Dark pill over images (`bg-[oklch(0.145_0_0/0.72)]`) appears in `GameCard.tsx` and `MapCard.tsx`. The green "New" pill in `ChangelogCard.tsx` hardcodes two more oklch values.
- Map toolbar button classes exist in `pages/Game/toolbarButton.ts` and again as local constants in `MapMakerPage.tsx`.
- Page entrance animation: `riseIn` in `HomePage.tsx`, `animate-in ...` in `ChangelogPage.tsx`, `enter.ts` in the Pokédex. Same idea, three implementations.

Suggestion:

- Keep `motion` for component animation. Decide whether `PageTransition` can move off `react-transition-group` (it already uses WAAPI for the animation itself). That would remove a dependency.
- Add `lib/media.ts` that exports `prefersReducedMotion`, `isTouchDevice` and share `useMediaQuery` for everything reactive.
- Extract `CoverBackdrop` (blurred image plus foreground image) and an `OverlayPill` component.
- One shared `enter` class constant for page content entrance, used by Home, Changelog and Pokédex.
- `MapMakerPage` is dev-only. Low priority, but import `toolbarButtonClass` rather than redefine it.

### Error handling that hides errors: mostly fine

Found 2 `catch` blocks in `src`:

- `lib/theme.ts`: `catch {}` around `localStorage.setItem`. This is legitimate (storage can throw in private mode) but the empty block reads like swallowed errors.
- `PageTransition.tsx`: `.catch(() => {})` on `animation.finished`. Also legitimate, since a cancelled animation rejects, but undocumented.

No `console.log/error/warn` in `src`. Optional chaining: 194 uses. Sampled the ones on route and location values (`location?.floors?.find`, `location?.name ?? region.name`). These are real optionals (not every page has a location), so they are fine. Not every one was individually checked.

Suggestion: leave the logic. Name the intent in code, not comments, for example move the storage write into `const persist = (theme) => ignoreFailure(...)`-style helper, or accept it as is. Do a pass on the 194 `?.` when touching those files.

### Type escape hatches: fine

- No `any`, no `@ts-ignore` / `@ts-expect-error`.
- One `as unknown as`: `ViewportEffects.tsx:79` (`leafletMap as unknown as ZoomLimiter`, reaching into a private Leaflet field). Acceptable, keep it isolated and typed as it is.
- No `eslint-disable` comments remain. `Walkers.tsx` had two that were added while working on the hero; they were removed by restructuring the spawn logic. `pnpm lint` (oxlint) does run the hooks rules, so it now flags only one warning there (`set-state-in-effect` in the refill effect) and the existing `only-export-components` warning in `HeroCityPin.tsx`.
- About 60 `as Type` casts, mostly DOM event targets and Select values. Fine. `SettingsDialog.tsx` casts select strings to `ThemePreset` / `ThemeStyle`, which could use a type guard.

### Huge components: mostly fine

Largest hand-written files: `PlaceSearch.tsx` (591 lines, 15 hooks), `HeroTileWalker.tsx` (511), `CreditsPage.tsx` (510, already split into small components inside), `SeamlessMap.tsx` (458), `MapMakerPage.tsx` (435, dev only). Everything larger is data (`src/data`). Nothing near 1000 lines of mixed fetching and UI, and there is no fetching at all (static data).

Suggestion: split `PlaceSearch.tsx` into the search logic (hook) and the dialog UI. The others can wait.

### Leftover scaffolding: none found

No TODO / FIXME / mock / lorem in source. Dev-only pages (`/pokemon-sprites`, `/legends-za/map-maker`, `DevMenu`) are gated behind `import.meta.env.DEV` and are not shipped. Fine.

### Summary docs in the root: fine

Root has only `README.md`. `docs/ARCHITECTURE.md` reads as hand-written and useful. `docs/superpowers/specs/` holds two design specs generated by a planning tool. They are dated and describe work already done.

Suggestion: delete `docs/superpowers/` or fold anything still true into `ARCHITECTURE.md`. Stale specs are the kind of file nobody maintains.

### Bloated dependencies: small cleanup

- All dependencies are imported somewhere. `shadcn` is used only for its CSS import, which is fine.
- `cn` (the npm package) is re-exported from `lib/utils.ts`. The standard setup is `clsx` + `tailwind-merge`. Check that `cn` does both. If it does, it is fine, just unusual.
- `react-transition-group` is used once (see animation above). Candidate to remove.
- Two font systems are loaded for different purposes (Geist, Barlow, Michroma, Press Start 2P). Each is used. Barlow is imported per page and per weight (400, 500, 700) across 5 files, so check the weights are all needed.
- `tw-animate-css` and `motion` overlap in purpose (see animation above).

### Version-suffixed files: none

No `_new`, `_v2`, `.fixed`, `.bak` source files. The only matches are map images (`copycats-house`), which are game location names.

## UI and UX

The site was designed around its content (maps, Pokédex, data) so most landing-page tells do not apply.

| Tell                                                  | Result                                                                                                                                                                                                                                                                                                                            |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Everything centered                                   | Not present. Pages are left aligned. Only the zoomed hero message and the 404 are centered.                                                                                                                                                                                                                                       |
| Same section rhythm (pill, heading, subheading, grid) | Not present.                                                                                                                                                                                                                                                                                                                      |
| Pricing table                                         | None.                                                                                                                                                                                                                                                                                                                             |
| Footer with dead links                                | Footer has a fan-project disclaimer and a Credits link. No `href="#"` anywhere.                                                                                                                                                                                                                                                   |
| `max-w-7xl` everywhere                                | Default is `max-w-6xl`, Home is wider, map pages are full screen. See spacing above.                                                                                                                                                                                                                                              |
| Gradient text, blobs, glassmorphism                   | None. `backdrop-blur` is used on the sticky header and dialog overlays, where there is content behind it. One `blur-xl` blob behind the hero city pin is a deliberate glow.                                                                                                                                                       |
| Glow and scale on hover                               | Limited to game cards (`game-card-glow`, cover scale on hover). Intentional but could be dropped on `MapCard` if it should feel less decorated.                                                                                                                                                                                   |
| Dot grids with fade mask                              | The hero grid in `HeroCityPin` and the diorama is a map metaphor, not decoration. Keep.                                                                                                                                                                                                                                           |
| Fade-in on scroll                                     | No `whileInView`. Entrance animations run once on page load.                                                                                                                                                                                                                                                                      |
| Badge spam                                            | One "New" pill on the home changelog card. It is hardcoded and never goes away, so it means nothing. Show it only when the latest entry is under about 14 days old, or remove it.                                                                                                                                                 |
| Fake screenshots, avatar stacks                       | None.                                                                                                                                                                                                                                                                                                                             |
| Feature-card icon tiles                               | None.                                                                                                                                                                                                                                                                                                                             |
| Generic logo                                          | Custom favicon SVG.                                                                                                                                                                                                                                                                                                               |
| AI cadence copy                                       | Home subtitle: "an accurate and effortless way to explore, without feeling like you left the game." Rewrite plainly, for example "Interactive maps of the Pokémon games, with every item, trainer and encounter where it is in the game." The hero tagline "The Definitive Pokémon Atlas" is a claim, consider something smaller. |
| Buttons that do nothing                               | None found. Not every link was clicked.                                                                                                                                                                                                                                                                                           |
| Dark mode                                             | Most colors use tokens. Hardcoded colors remain in `GameCard`, `MapCard`, `ChangelogCard` (oklch literals) and the diorama (hex). **Not verified** in a browser. Walk every page in both themes once.                                                                                                                             |
| Mobile                                                | Hero and menus were tuned this session (touch tilt removed, fewer grass clumps). **Not verified**: nav overflow, hamburger closing, tables (Data Lake) on narrow screens.                                                                                                                                                         |
| Loading, empty, error states                          | Weak. `Suspense` fallbacks are `null` in `GamePage`, `Pokedex` and `Credits`, so lazy chunks show a blank area. The router has no `errorElement`, so a thrown error shows React Router's default screen. Search and Data Lake have no explicit empty state that was found.                                                        |
| Toasts                                                | No toast library.                                                                                                                                                                                                                                                                                                                 |
| Forms                                                 | Only search inputs and filters, no submit flows.                                                                                                                                                                                                                                                                                  |

## Suggested order

1. Add a route `errorElement` and real `Suspense` fallbacks (a simple skeleton block per page type).
2. Settle the type scale and radius (`text-[13px]`, `rounded-[14px]`, `rounded-[10px]`), then add `PageTitle` and the `Container` size prop.
3. Extract `CoverBackdrop`, `OverlayPill`, and the shared media helpers.
4. Decide on `react-transition-group` and remove it if `PageTransition` can live without it.
5. Rewrite the home subtitle, and make the "New" pill conditional.
6. Delete `docs/superpowers/`.
7. Walk the site in dark mode and at 375px wide and note what breaks.

## Decisions

Answers from the review on 2026-10-15. Each entry lists the options offered and the choice made. Nothing below is implemented yet.

### Text sizes (`text-[13px]`)

Options: add a `text-compact` token, fold into `text-xs`, fold into `text-sm`, leave as is.

**Decision: fold into `text-xs`.** Replace all `text-[13px]` with `text-xs`. Text gets about 1px smaller, so check for layout shifts on cards and tooltips.

### Corner radius

Options: map to the scale, make `10px` / `14px` tokens, leave as is.

**Decision: map to the scale.** Controls `rounded-md`, cards `rounded-lg`, pills `rounded-full`. Replace `rounded-[14px]` and `rounded-[10px]`.

### Page titles and widths

Options: `PageTitle` + `Container` size prop, `PageTitle` only, full `PageShell`, leave as is.

**Decision: `PageTitle` + `Container` size prop.** One `PageTitle` for the top-level pages, and `Container` gets `size` (`default`, `wide`) instead of per-page `max-w` overrides.

### Animation systems

Options: keep `motion` and drop `react-transition-group`, document the split, move everything to `motion`, leave as is.

**Decision: keep `motion`, drop `react-transition-group`.** Rewrite `PageTransition` without it and remove the dependency. Test route transitions carefully (map travel, hash scroll, enter and exit).

### Duplicated UI

Options (first round): extract all four, only cover and pill, only user-facing, leave as is. The answer to that round was about blur (next entry), so the question was asked again without the cover backdrop.

Options (second round): pill and entrance, pill only, none.

**Decision: extract `OverlayPill` and one shared page-entrance class, and reuse `toolbarButtonClass` in `MapMakerPage`.**

### Blur

Options: header and cover backdrops, everything, header only.

**Decision: remove all blur.** Reason given: on the map pages the content used to sit under the top bar, and it no longer does. This covers:

- the header `backdrop-blur-lg` (make the header background solid),
- the blurred cover images in `GameCover` and `MapCard`,
- the dialog and drawer overlay blur,
- the blur glow behind the hero city pin.

Because the cover backdrop goes away, `CoverBackdrop` is no longer needed. Check the header still reads well over scrolled content on pages where it is `sticky`.

### Loading and error states

Options: both, error page only, skeletons only, leave as is.

**Decision: both.** Add a skeleton per page type for the `Suspense` fallbacks (`GamePage`, `Pokedex`, `Credits`) and a themed `errorElement` on the router.

### Home subtitle

Options: plain rewrite, shorter, user writes it, keep it.

**Decision: keep it.** The current subtitle stays. The "AI cadence" note in the audit is dropped for this line.

### "New" pill on the changelog card

Options: show for 14 days, remove it, hide until visited, keep it.

**Decision: remove it.** The date beside it already shows how recent the entry is.

### `docs/superpowers/`

Options: delete, fold into `ARCHITECTURE.md`, keep.

**Decision: delete.** Git history keeps the two specs.

### `PlaceSearch.tsx` (591 lines)

Options: split logic and UI, leave it.

**Decision: split.** A `usePlaceSearch` hook plus a smaller dialog component.

### Media helpers

Options: one `lib/media.ts`, leave as is.

**Decision: one `lib/media.ts`.** Export `prefersReducedMotion`, `isTouchDevice` and the shared query constants. `usePrefersReducedMotion` and the `GameAside` desktop check build on `useMediaQuery`.

### Hover effects on cards

Options: keep on `GameCard` only, drop the glow and keep the zoom, remove both, keep everywhere.

**Decision: drop the glow, keep the zoom.** Remove `game-card-glow` and keep the cover `scale-106`.

### `cn` package

Options: check then decide, swap to `clsx` + `tailwind-merge` now, leave it.

**Decision: check, then decide.** Confirm the `cn` package merges conflicting Tailwind classes. Swap to `clsx` + `tailwind-merge` only if it does not.

### Dark mode and 375px mobile

Options: walk it in Chrome, user checks, skip.

**Decision: walk it in Chrome.** Open the dev server (port 5173), go through every page in light and dark at 375px and at desktop width, and add the findings to this file.

### Not asked, left at the audit's suggestion

- Remove the empty-looking `catch {}` blocks only if a clearer helper makes sense when `theme.ts` is next touched.
- Review the 194 optional chains when touching those files.
- Check which Barlow weights (400, 500, 700) are actually needed.
- Replace the string casts in `SettingsDialog.tsx` with type guards.

## Implementation status

Done (2026-10-15): `text-[13px]` to `text-xs`; radius literals to `rounded-xl` / `rounded-lg`; all blur removed except the iris blur layer in `encounterTransition.ts`; `OverlayPill`; "New" pill removed; `docs/superpowers/` deleted; `PageTitle` and `Container` `size`; `lib/media.ts`; card glow removed; `PageTransition` rewritten without `react-transition-group` (dependency and its credit removed); shared `lib/enter.ts`; `RouteErrorPage` and `PageSkeleton`; `PlaceSearch` split into `usePlaceSearch.ts` and `SearchParts.tsx`; `cn` checked and kept (it is shadcn's own package and merges conflicting classes).

Not done:

- `MapMakerPage` still has its own toolbar classes. They are a different style from `toolbarButtonClass` (square map buttons vs. a docked side button), so reusing it would change the look of a dev-only page.
- Dark mode and 375px walk: the Chrome extension was not connected, so nothing was verified in a browser.
- Route transitions (`PageTransition`) and the new blur-free header need a manual check.
