import { townMapGroups } from './catalog/townMaps';
import { versionGroupNames } from './catalog/versionGroups';
import { coverCount, coversFrom, coverSources } from './covers';
import { getGame } from './games';
import { type Location, type MapSource, regions } from './maps';
import {
  gameSprite,
  megaStoneSprite,
  pokeapiSprite,
  pokemonSpriteSources,
} from './sprites';

export type Credit = {
  name: string;
  url: string;
  by?: string;
  detail?: string;
  fontFamily?: string;
  usedFor?: string;
  covers?: Array<string>;
  sprite?: { src: string; pixelated?: boolean };
};

export type DataCredit = Omit<Credit, 'detail'> & {
  games: Array<string>;
  uses: Array<string>;
};

export type MapWork = { label: string; url: string };

export type MapCredit = {
  credit: string;
  site: string;
  note?: string;
  works: Array<MapWork>;
};

export type MapCreditGroup = {
  id: string;
  title: string;
  credits: Array<MapCredit>;
};

const groupTitles: Record<string, string> = {
  RBY: 'Red, Blue and Yellow',
  GSC: 'Gold, Silver and Crystal',
  RSE: 'Ruby, Sapphire and Emerald',
  FRLG: 'FireRed and LeafGreen',
  DPPt: 'Diamond, Pearl and Platinum',
  HGSS: 'HeartGold and SoulSilver',
  BW: 'Black and White',
  B2W2: 'Black 2 and White 2',
  XY: 'X and Y',
  ORAS: 'Omega Ruby and Alpha Sapphire',
  SM: 'Sun and Moon',
  USUM: 'Ultra Sun and Ultra Moon',
  LGPE: 'Let’s Go, Pikachu! and Let’s Go, Eevee!',
  SwSh: 'Sword and Shield',
  BDSP: 'Brilliant Diamond and Shining Pearl',
  PLA: 'Legends: Arceus',
  SV: 'Scarlet and Violet',
  ZA: 'Legends: Z-A',
};

type Placed = { location: Location; parent?: Location };

const collectLocations = (
  locations: Array<Location>,
  parent?: Location,
): Array<Placed> =>
  locations.flatMap((location) => [
    { location, parent },
    ...collectLocations(location.locations, location),
  ]);

const townMapCredits = (): Array<MapCreditGroup> =>
  townMapGroups.map(({ versionGroup, credits }) => ({
    id: versionGroup,
    title:
      groupTitles[versionGroup] ?? versionGroupNames(versionGroup).join(', '),
    credits,
  }));

export const mapCredits = (): Array<MapCreditGroup> => {
  const seen = new Set<string>();

  return [...mapRegionCredits(seen), ...townMapCredits()];
};

const mapRegionCredits = (seen: Set<string>): Array<MapCreditGroup> => {
  return regions.map((region) => {
    const credits = new Map<string, MapCredit>();
    const add = (source: MapSource, image: string, label: string) => {
      if (seen.has(image)) return;

      seen.add(image);

      const key = `${source.credit}|${source.name}`;
      const credit = credits.get(key) ?? {
        credit: source.credit,
        site: source.name,
        note: source.note,
        works: [],
      };

      credit.works.push({ label, url: source.url });
      credits.set(key, credit);
    };

    add(
      region.source,
      region.image,
      `${region.name} Town Map (${region.versionGroup})`,
    );

    if (region.pointer) {
      add(
        region.pointer.source,
        region.pointer.hover.frames[0],
        `Town Map cursor sprites (${region.versionGroup})`,
      );
    }

    for (const { location, parent } of collectLocations(region.locations)) {
      const place = parent ? `${location.name}, ${parent.name}` : location.name;

      for (const image of location.floors ?? [location]) {
        const label = image === location ? place : `${place}, ${image.name}`;

        add(image.source, image.image, `${label} (${region.versionGroup})`);

        for (const variant of image.variants ?? []) {
          add(
            variant.source,
            variant.image,
            `${label}, Yellow (${region.versionGroup})`,
          );
        }
      }
    }

    return {
      id: region.versionGroup,
      title: groupTitles[region.versionGroup] ?? region.name,
      credits: [...credits.values()],
    };
  });
};

const spriteOf = (number: number, gameId: string) => {
  const game = getGame(gameId);
  const src = game && gameSprite(number, game);

  return src
    ? { src, pixelated: game.sprites?.pixelated ?? true }
    : { src: pokeapiSprite(number) };
};

export const spriteCredits: Array<Credit> = [
  {
    ...pokemonSpriteSources.pret,
    name: 'pret/pokered and pret/pokeyellow',
    by: pokemonSpriteSources.pret.credit,
    detail:
      'Pokémon sprites for Red, Blue and Yellow in their Super Game Boy colours, and the people, trainers and items on the maps (Yellow only where they differ from Red and Blue)',
    sprite: spriteOf(25, 'yellow'),
  },
  {
    ...pokemonSpriteSources.pokeapi,
    by: pokemonSpriteSources.pokeapi.credit,
    detail:
      'Pokémon, regional form and Mega Evolution sprites, including the Legends Z-A menu sprites',
    sprite: { src: pokeapiSprite(10034) },
  },
  {
    ...pokemonSpriteSources.bulbagarden,
    by: pokemonSpriteSources.bulbagarden.credit,
    detail: 'Mega Stone icons for Legends Z-A',
    sprite: { src: megaStoneSprite('Lucarionite Z'), pixelated: false },
  },
];

const COVER_PREVIEWS = 4;

export const coverCredits: Array<Credit> = [
  {
    ...coverSources.libretro,
    by: coverSources.libretro.credit,
    detail: `Box art for ${coverCount('libretro')} games`,
    covers: coversFrom('libretro', COVER_PREVIEWS),
  },
  {
    ...coverSources.thegamesdb,
    by: coverSources.thegamesdb.credit,
    detail: `Box art for ${coverCount('thegamesdb')} games`,
    covers: coversFrom('thegamesdb', COVER_PREVIEWS),
  },
];

export const dataCredits: Array<DataCredit> = [
  {
    name: 'pret/pokered',
    url: 'https://github.com/pret/pokered',
    by: 'the pret team',
    uses: [
      'Encounters and trades',
      'Trainers and their teams',
      'Items',
      'People and their dialogue',
      'Signs',
      'Warps and map connections',
      'Town Map positions',
      'Trainer prize money',
      'Poké Mart stock and prices',
    ],
    games: ['red', 'blue'],
  },
  {
    name: 'pret/pokeyellow',
    url: 'https://github.com/pret/pokeyellow',
    by: 'the pret team',
    uses: [
      'Only what differs from Red and Blue',
      'Encounters, trainers and gifts',
      'Maps and sprites',
      'Poké Mart stock that differs',
    ],
    games: ['yellow'],
  },
  {
    name: 'Bulbapedia',
    url: 'https://bulbapedia.bulbagarden.net/',
    by: 'the Bulbagarden community',
    uses: [
      'Pokémon availability in Red, Blue, Yellow and Legends Z-A',
      'Mega Evolutions and Mega Stones',
      'Links to Pokémon and game pages',
    ],
    games: ['red', 'blue', 'yellow', 'legends-za'],
  },
  {
    name: 'Serebii.net',
    url: 'https://www.serebii.net/',
    by: 'Joe Merrick and the Serebii team',
    uses: [
      'Unobtainable Pokémon in Yellow',
      'Wild zone levels in Legends Z-A',
      'Alpha chances in Legends Z-A',
      'Trainers in Legends Z-A',
    ],
    games: ['yellow', 'legends-za'],
  },
  {
    name: 'Eurogamer',
    url: 'https://www.eurogamer.net/all-wild-zone-pokemon-legends-z-a',
    by: 'the Eurogamer team',
    uses: [
      'Where and when each Pokémon appears in the Legends Z-A wild zones',
      'The in-game map used to trace the zone outlines',
    ],
    games: ['legends-za'],
  },
  {
    name: 'Nintendo Life',
    url: 'https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-1-guide-all-pokemon-and-alphas',
    by: 'the Nintendo Life team',
    uses: [
      'Wild zone guides to cross-check the Legends Z-A Pokémon',
      'Guaranteed Alphas',
    ],
    games: ['legends-za'],
  },
  {
    name: 'Pokémon Database',
    url: 'https://pokemondb.net/',
    by: 'the Pokémon Database team',
    uses: ['Red and Blue version exclusives'],
    games: ['red', 'blue'],
  },
];

export const fontCredits: Array<Credit> = [
  {
    name: 'Press Start 2P',
    url: 'https://fonts.google.com/specimen/Press+Start+2P',
    by: 'CodeMan38',
    fontFamily: "'Press Start 2P', monospace",
    usedFor:
      'The Game theme: map labels, text boxes, trainer dialogs and the Game Boy Pokédex.',
    detail: 'SIL Open Font License 1.1',
  },
  {
    name: 'Outfit',
    url: 'https://fonts.google.com/specimen/Outfit',
    by: 'Outfit Project Authors',
    fontFamily: "'Outfit Variable', sans-serif",
    usedFor: 'Headings and page titles across the site.',
    detail: 'SIL Open Font License 1.1',
  },
  {
    name: 'Barlow',
    url: 'https://fonts.google.com/specimen/Barlow',
    by: 'Jeremy Tribby',
    fontFamily: "'Barlow', sans-serif",
    usedFor: 'Body text, the logo and the Legends: Z-A Pokédex and map labels.',
    detail: 'SIL Open Font License 1.1',
  },
  {
    name: 'Michroma',
    url: 'https://fonts.google.com/specimen/Michroma',
    by: 'Vernon Adams',
    fontFamily: "'Michroma', sans-serif",
    usedFor: 'Headings in the Legends: Z-A Pokédex.',
    detail: 'SIL Open Font License 1.1',
  },
];

export const softwareCredits: Array<Credit> = [
  { name: 'React', url: 'https://react.dev/', detail: 'MIT' },
  { name: 'React Router', url: 'https://reactrouter.com/', detail: 'MIT' },
  { name: 'Leaflet', url: 'https://leafletjs.com/', detail: 'BSD-2-Clause' },
  {
    name: 'React Leaflet',
    url: 'https://react-leaflet.js.org/',
    detail: 'Hippocratic License 2.1',
  },
  { name: 'Motion', url: 'https://motion.dev/', detail: 'MIT' },
  { name: 'Radix UI', url: 'https://www.radix-ui.com/', detail: 'MIT' },
  { name: 'shadcn/ui', url: 'https://ui.shadcn.com/', detail: 'MIT' },
  { name: 'Vaul', url: 'https://vaul.emilkowal.ski/', detail: 'MIT' },
  { name: 'Lucide', url: 'https://lucide.dev/', detail: 'ISC' },
  { name: 'Tailwind CSS', url: 'https://tailwindcss.com/', detail: 'MIT' },
  {
    name: 'tw-animate-css',
    url: 'https://github.com/Wombosvideo/tw-animate-css',
    detail: 'MIT',
  },
  {
    name: 'class-variance-authority',
    url: 'https://github.com/joe-bell/cva',
    detail: 'Apache-2.0',
  },
  { name: 'cn', url: 'https://github.com/shadcn-ui/cn', detail: 'MIT' },
  { name: 'Zustand', url: 'https://github.com/pmndrs/zustand', detail: 'MIT' },
  { name: 'Vite', url: 'https://vite.dev/', detail: 'MIT' },
  {
    name: 'TypeScript',
    url: 'https://www.typescriptlang.org/',
    detail: 'Apache-2.0',
  },
  { name: 'Oxc (oxlint and oxfmt)', url: 'https://oxc.rs/', detail: 'MIT' },
];
