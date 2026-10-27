import type { Priority } from './priorities';

export type TodoGroup = {
  title: string;
  items: Array<{ id: string; text: string; priority: Priority }>;
};

export const todoGroups: Array<TodoGroup> = [
  {
    title: 'Website UI/UX',
    items: [
      {
        id: 'ui-game-page-map-list',
        priority: 'medium',
        text: "Change the Game page's map list",
      },
    ],
  },
  {
    title: 'Code Review',
    items: [
      {
        id: 'review-lint-warnings',
        priority: 'medium',
        text: 'Clear the 35 lint warnings: 20 exhaustive-deps, 7 refs read during render, 5 setState in effect, 2 only-export-components, 1 preserve-manual-memoization',
      },
      {
        id: 'review-mip-layers',
        priority: 'high',
        text: 'Review the floor image layer ordering in GlFloorImages and glMipLayers (greyscale levels must sit under the coloured ones)',
      },
      {
        id: 'review-unused-events',
        priority: 'low',
        text: 'Decide whether to keep EventPicker, useEventState and MapEvent, since no map has a before/after event any more',
      },
      {
        id: 'review-large-files',
        priority: 'low',
        text: 'Look at the largest files for splitting: kanto-rby/inside.ts (1122 lines), RbyMapMakerPage (959), lumiose-za.ts (843), kanto-rby/services.ts (795), SeamlessMap (651)',
      },
      {
        id: 'review-audit-doc',
        priority: 'low',
        text: 'Update docs/CLEANUP-AUDIT.md: it still mentions Leaflet and lists items that are done',
      },
      {
        id: 'review-browser-walk',
        priority: 'medium',
        text: 'Walk the site in dark mode and at 375px width, and check route transitions (never verified in a browser)',
      },
      {
        id: 'review-clean-scripts',
        priority: 'medium',
        text: 'Run the pnpm data and map scripts from a clean checkout (they download pinned pret commits into vendor/)',
      },
    ],
  },
  {
    title: 'RBY',
    items: [
      {
        id: 'rby-walk-locations',
        priority: 'high',
        text: 'Walk every location in Red, Blue and Yellow in the browser: map image, entrances, floor exits and arrival highlights (only snapshot tests cover this today)',
      },
      {
        id: 'rby-yellow-outdoor',
        priority: 'high',
        text: 'Check the new Yellow outdoor maps in the browser, zoomed in and out, with and without Game Boy Color colours',
      },
      {
        id: 'rby-no-encounter',
        priority: 'medium',
        text: 'Confirm the Pokémon with no direct encounter are all evolutions, version exclusives, trades or Mew: 45 in Red, 45 in Blue, 44 in Yellow',
      },
      {
        id: 'rby-yellow-differences',
        priority: 'medium',
        text: 'Spot-check items, trainers, people and shop stock that differ in Yellow against pokeyellow',
      },
      {
        id: 'rby-changelog',
        priority: 'low',
        text: 'Write the changelog entry for the RBY release',
      },
    ],
  },
  {
    title: 'ZA · Map',
    items: [
      {
        id: 'za-map-sectors',
        priority: 'medium',
        text: 'Add the sector zones as places: the Sector Zones group exists in lumiose-za.ts but has no locations',
      },
      {
        id: 'za-map-buildings',
        priority: 'medium',
        text: 'Add buildings and landmarks as places (Pokémon Centers, shops, restaurants and so on): the Buildings group exists but has no locations',
      },
      {
        id: 'za-map-markers',
        priority: 'high',
        text: 'Render markers on the seamless map: items, trainers and people cannot be placed yet, only wild zone doors',
      },
      {
        id: 'za-map-layers',
        priority: 'medium',
        text: 'Give ZA its own map layers panel, with the layers that apply to Lumiose',
      },
      {
        id: 'za-map-outlines',
        priority: 'high',
        text: 'Check the 20 wild zone outlines and their door positions against the game map (traced by hand in the map maker)',
      },
      {
        id: 'za-map-art',
        priority: 'low',
        text: 'Check the Town Map art stays sharp at maximum zoom, and look for a higher resolution source',
      },
      {
        id: 'za-map-mega-dimension',
        priority: 'medium',
        text: 'Decide how to show the Mega Dimension (Hyperspace) areas: 137 encounters point at ordinary wild zones today',
      },
      {
        id: 'za-map-mobile',
        priority: 'medium',
        text: 'Check the seamless map, zone panel and fly-to camera on a phone',
      },
    ],
  },
  {
    title: 'ZA · Pokémon',
    items: [
      {
        id: 'za-dex-obtainable',
        priority: 'medium',
        text: 'Recompute the 226 obtainable-without-trading count from the site data (it was derived from Bulbapedia by hand)',
      },
      {
        id: 'za-dex-size',
        priority: 'high',
        text: 'Reconcile the Pokédex size: the region in lumiose-za.ts says 364, but za.json holds 380 entries (240 base, 140 DLC)',
      },
      {
        id: 'za-dex-mystery-gift',
        priority: 'low',
        text: 'Decide whether Mystery Gift Pokémon (Mewtwo, Diancie) count towards obtainable: 226 without them, 228 with',
      },
      {
        id: 'za-dex-levels',
        priority: 'high',
        text: '121 of the 269 wild encounters have no levels: fill them in or confirm the source has none',
      },
      {
        id: 'za-dex-gifts',
        priority: 'high',
        text: 'Add a gift method: the starters are recorded as wild walk encounters in zone 20, and gifts like the Mystery Gift Pokémon are missing',
      },
      {
        id: 'za-dex-static',
        priority: 'medium',
        text: 'Check the 9 static, 3 fossil and 3 trade encounters against the game, and look for missing ones',
      },
      {
        id: 'za-dex-dlc-evolutions',
        priority: 'medium',
        text: 'Add evolvesFrom for the 140 DLC entries (none have it)',
      },
      {
        id: 'za-dex-dlc-megas',
        priority: 'medium',
        text: 'Add the DLC Mega Evolutions (18 of the 140 DLC entries have one)',
      },
      {
        id: 'za-dex-forms',
        priority: 'low',
        text: 'Check every form has a sprite: form-sprites.json covers 16 form entries',
      },
      {
        id: 'za-dex-mega-stones',
        priority: 'low',
        text: 'Show where each Mega Stone comes from',
      },
      {
        id: 'za-dex-alpha',
        priority: 'low',
        text: 'Check the alpha chances and levels (255 of 269 wild encounters have them) against the source',
      },
    ],
  },
  {
    title: 'ZA · Trainers',
    items: [
      {
        id: 'za-trainers-list',
        priority: 'high',
        text: 'Add the trainers: only 2 exist today, both in wild zone 6, with parties, moves and levels still to do for every other zone and building',
      },
      {
        id: 'za-trainers-portraits',
        priority: 'medium',
        text: 'Find a source for trainer portraits or sprites (RBY has overworld sprites; ZA has none)',
      },
      {
        id: 'za-trainers-positions',
        priority: 'medium',
        text: 'Place trainers on the map once markers exist',
      },
      {
        id: 'za-trainers-rewards',
        priority: 'low',
        text: 'Add prize money and rewards for each battle',
      },
      {
        id: 'za-trainers-ranked',
        priority: 'medium',
        text: 'Decide how to cover the ranked battles and the main story fights',
      },
    ],
  },
  {
    title: 'ZA · Missions',
    items: [
      {
        id: 'za-missions-details',
        priority: 'medium',
        text: 'Add location, rewards and requirements to the 259 missions: they only have a title and a description',
      },
      {
        id: 'za-missions-counts',
        priority: 'medium',
        text: 'Check the counts against the game: 42 main, 121 side, 14 Hyperspace, 82 Mega Dimension side',
      },
      {
        id: 'za-missions-links',
        priority: 'low',
        text: 'Link missions to the places, trainers and Pokémon they involve',
      },
      {
        id: 'za-missions-tracking',
        priority: 'low',
        text: 'Decide whether missions get a completion checklist',
      },
    ],
  },
  {
    title: 'ZA · Items & shops',
    items: [
      {
        id: 'za-items-pickups',
        priority: 'high',
        text: 'Add item pickups per zone and street: ZA has no item data at all',
      },
      {
        id: 'za-items-details',
        priority: 'medium',
        text: 'Add item names, icons and descriptions',
      },
      {
        id: 'za-shops',
        priority: 'medium',
        text: 'Add shops with their stock and prices',
      },
      {
        id: 'za-people',
        priority: 'low',
        text: 'Decide whether to add people and their dialogue, as RBY has',
      },
    ],
  },
  {
    title: 'ZA · Site & data',
    items: [
      {
        id: 'za-script',
        priority: 'high',
        text: 'Add scripts under scripts/ that regenerate the ZA data, like the RBY ones (there is none for the Pokédex, trainers or missions)',
      },
      {
        id: 'za-credits',
        priority: 'medium',
        text: 'Update the credits for every new data source and image',
      },
      {
        id: 'za-tests',
        priority: 'medium',
        text: 'Add tests for the ZA data: zone targets, outline shapes and encounter paths',
      },
      {
        id: 'za-search',
        priority: 'low',
        text: 'Make the place search cover ZA places, trainers and missions once they exist',
      },
      {
        id: 'za-hub',
        priority: 'low',
        text: 'Review the ZA game hub page and its stats once the data is complete',
      },
      {
        id: 'za-changelog',
        priority: 'low',
        text: 'Write the changelog entry for the ZA release',
      },
    ],
  },
];

export const nextUpOrder: Array<string> = [
  'rby-walk-locations',
  'rby-yellow-outdoor',
  'review-mip-layers',
  'rby-yellow-differences',
  'rby-no-encounter',
  'review-lint-warnings',
  'review-clean-scripts',
  'review-browser-walk',
  'rby-changelog',
  'ui-game-page-map-list',
  'review-audit-doc',
  'review-unused-events',
  'review-large-files',
  'za-dex-size',
  'za-script',
  'za-dex-levels',
  'za-dex-gifts',
  'za-dex-static',
  'za-map-outlines',
  'za-dex-obtainable',
  'za-dex-mystery-gift',
  'za-dex-dlc-evolutions',
  'za-dex-dlc-megas',
  'za-tests',
  'za-map-markers',
  'za-map-layers',
  'za-items-pickups',
  'za-items-details',
  'za-shops',
  'za-trainers-list',
  'za-trainers-portraits',
  'za-trainers-positions',
  'za-trainers-rewards',
  'za-trainers-ranked',
  'za-map-sectors',
  'za-map-buildings',
  'za-map-mega-dimension',
  'za-missions-counts',
  'za-missions-details',
  'za-missions-links',
  'za-missions-tracking',
  'za-people',
  'za-dex-alpha',
  'za-dex-forms',
  'za-dex-mega-stones',
  'za-map-art',
  'za-map-mobile',
  'za-credits',
  'za-search',
  'za-hub',
  'za-changelog',
];
