# Hero Town Map: exploded layers on click

## Goal

Keep the home hero Town Map exactly as it behaves today (pointer tilt, glow, sheen), and add a click interaction: the map turns into an isometric 3D stack. The Town Map becomes a thick base tile at the back and several layers float above it. Inspired by the vite.dev hero stack, not a copy of it.

## States

### Rest (unchanged)

The flat Town Map with the pointer tilt (±8°), glow and sheen, pixel-identical to today. All layers sit at height 0 and the base's side faces have zero thickness, so nothing extra is visible.

### Exploded

- The stage rotates into an isometric view (about 55–60° back and 40° around) and scales down slightly so the whole stack fits inside the hero.
- The base becomes a slab like the tile in the logo: the Town Map is the top face and two visible side faces use the logo greens (`#3f9150`, `#1f5130`), about 16–20px thick at full size.
- The glow lies flat under the slab.
- Hover tilt still works, softened to about ±4° around the isometric angle.

## Layer stack (bottom to top)

1. **Base slab:** the Town Map image.
2. **Items plate:** outlined see-through plate, small "Items" label, a few placeholder dots in `--map-item`.
3. **Trainers plate:** same style, "Trainers" label, a few placeholder marks in `--map-trainer`.
4. **Cursor layer:** the blinking cursor alone, directly above its spot on the map, with a thin dashed guide line down to the map.
5. **Title layer:** the location title (e.g. "LAVENDER TOWN") in the Town Map pixel font.
6. **Empty plate:** decorative, for depth.

Plate outlines and labels use the brand green at low opacity. Placeholder marks are fixed decorative positions, not real item or trainer data.

## Animation

- **Explode (~0.7s):** the slab rotates to isometric while its side faces grow in. The layers then rise from the map surface to their heights bottom to top, staggered about 60ms, fading in. The guide line draws last. Uses the site's soft ease-out, with a light spring on the layers.
- **Collapse (~0.5s):** the reverse. Layers sink first, then the slab flattens back.

## Interaction and accessibility

- The card is a `<button>`. Click, tap, Enter and Space toggle between rest and exploded. There is no auto-collapse.
- Accessible label switches between "Show map layers" and "Hide map layers". Visible focus ring.
- A small "Click to explore" hint on the card fades out after the first toggle.
- **Reduced motion** (system setting or the site's Animations switch): no animation. The toggle switches straight between the two states and stays fully usable.
- Phones behave the same, with tap to toggle.

## Components (all in `src/pages/Home/`)

- **`HeroTownMap.tsx`** (existing): owns the pointer tilt, glow and the `exploded` state. Renders the button and the stack, and picks the tilt range per state.
- **`HeroMapStack.tsx`** (new): the preserve-3d stage. Lays out the layers with their heights and stagger delays for the current state.
- **`HeroMapLayer.tsx`** (new): one layer with the same size and aspect ratio as the map, so children positioned in map coordinates line up with the base. Props: height, delay, optional outline, optional label, children.
- **`HeroMapSlab.tsx`** (new): the base tile, with the Town Map face and the two side faces whose thickness animates with the state.
- **Reused unchanged:** `RegionImage` (map image only, without title and cursor), `LocationCursor`, `LocationLabel`.
- **Placeholder marks:** a short constant list of positions in map pixel coordinates for the Items and Trainers plates.

## Out of scope

- Real item, trainer or encounter data on the plates.
- Any change to the Town Map on the region pages or to the shared map components.

## Verification

The project has no automated test setup. Verify in the browser:

- The rest state matches today's map.
- Click, Enter and Space toggle both ways; focus ring visible.
- Reduced motion (system and site setting) toggles without animation.
- Phone width: the stack fits without horizontal scroll.
- Light and dark mode.
- Typecheck, lint and format pass.
