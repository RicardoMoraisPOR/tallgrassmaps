# Animation rules

Based on [7 practical animation tips](https://emilkowal.ski/ui/7-practical-animation-tips). These apply to interface animation (buttons, popovers, dialogs, lists, selection).

Exempt: the home-page diorama (`pages/Home/diorama`, `HeroCityPin`) is decorative scene motion. It may use scale-from-0 spawns and `ease-in` exits, and keeps its own timings. The Home hero entrance also keeps its longer once-per-visit timings.

Shared pieces: `src/lib/motion.ts` (`easeOutSoft`), `src/lib/enter.ts` (`ENTER`, `enterDelay`), `src/components/Collapse.tsx` (expand/collapse).

## 1. Never animate from `scale(0)`

Entrances start at `scale(0.9)` or higher (0.93 preferred), combined with a fade.

Applied to: shadcn dialog/dropdown (`zoom-in-95`), hover cards (`zoom-in-95`), `GameFilters` (0.94), `ZaPreview` (0.92), the Pokédex check badge and the `ThemeToggle` icons (`scale-90` + fade).

## 2. Easing: `ease-out` for enter and exit, never `ease-in` for UI

Prefer custom curves over the built-in CSS ones (`easeOutSoft`, `EASE_OUT_EXPO`). `ease-in-out` is acceptable only for looping ambient motion.

## 3. Origin-aware popovers

Popovers scale from their trigger. The dropdown menu uses the Radix origin variable; the map hover card still zooms from its center. Centered dialogs stay centered.

## 4. Keep it fast: under 300ms

UI animations stay under 300ms; small state changes use about 200ms. Remove animations and hover effects people see many times a day.

Current values: `Collapse` 180ms, dialogs and dropdowns 100ms, hover cards 50ms, `GameCover` hover zoom 200ms, `ENTER` 300ms with a 50ms stagger, `MapZoomControls` 250ms. The Hub tile overlay and `StatsForNerds` color fade sit at exactly 300ms; do not go above that.

## 5. Blur as a last resort

If an easing and duration pass still feels off on a crossfade, add `filter: blur(2px)` during the swap. Not used yet. Existing blur is functional only (`ui/drawer.tsx` backdrop, `components/encounterTransition.ts`).

## Checklist for new animation

1. Does the user see it many times a day? If yes, cut it or make it near-instant.
2. Entering or exiting? `ease-out`, 300ms or less, start scale 0.9 or higher.
3. Anchored to a trigger? Set the transform origin to the trigger.
4. Always add `motion-reduce` handling.
