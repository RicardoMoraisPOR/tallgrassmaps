import { coverCount, coverSources } from './covers';
import { type Location, type MapSource, regions } from './maps';
import { pokemonSpriteSources } from './sprites';

export type Credit = {
  name: string;
  url: string;
  by?: string;
  detail?: string;
};

export type MapWork = { label: string; url: string };

export type MapCredit = {
  credit: string;
  site: string;
  note?: string;
  works: Array<MapWork>;
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

export const mapCredits = (): Array<MapCredit> => {
  const credits = new Map<string, MapCredit>();
  const seen = new Set<string>();
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

  for (const region of regions) {
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
  }

  return [...credits.values()];
};

export const spriteCredits: Array<Credit> = [
  {
    ...pokemonSpriteSources.pret,
    name: 'pret/pokered and pret/pokeyellow',
    by: pokemonSpriteSources.pret.credit,
    detail:
      'Pokémon sprites for Red, Blue and Yellow in their Super Game Boy colours, and the people, trainers and items on the maps',
  },
  {
    ...pokemonSpriteSources.showdown,
    by: pokemonSpriteSources.showdown.credit,
    detail: 'Pokémon sprites in the Pokédex',
  },
  {
    ...pokemonSpriteSources.smogon,
    by: pokemonSpriteSources.smogon.credit,
    detail: 'Sprites for the Pokémon added after Black and White',
  },
];

export const coverCredits: Array<Credit> = [
  {
    ...coverSources.libretro,
    by: coverSources.libretro.credit,
    detail: `Box art for ${coverCount('libretro')} games`,
  },
  {
    ...coverSources.thegamesdb,
    by: coverSources.thegamesdb.credit,
    detail: `Box art for ${coverCount('thegamesdb')} games`,
  },
];

export const dataCredits: Array<Credit> = [
  {
    name: 'pret/pokered',
    url: 'https://github.com/pret/pokered',
    by: 'the pret team',
    detail:
      'Red and Blue disassembly: encounters, trades, trainers and their teams, items, people and their dialogue, signs, warps, Town Map positions and map connections',
  },
  {
    name: 'pret/pokeyellow',
    url: 'https://github.com/pret/pokeyellow',
    by: 'the pret team',
    detail:
      'Yellow disassembly: the same data for Yellow, including its own encounters, trainers, gifts and maps',
  },
  {
    name: 'Bulbapedia',
    url: 'https://bulbapedia.bulbagarden.net/',
    by: 'the Bulbagarden community',
    detail: 'Pokémon availability, and the Pokédex links',
  },
  {
    name: 'Serebii.net',
    url: 'https://www.serebii.net/',
    by: 'Joe Merrick and the Serebii team',
    detail: 'Unobtainable Pokémon in Yellow',
  },
  {
    name: 'Pokémon Database',
    url: 'https://pokemondb.net/',
    by: 'the Pokémon Database team',
    detail: 'Red and Blue version exclusives',
  },
];

export const fontCredits: Array<Credit> = [
  {
    name: 'Geist',
    url: 'https://vercel.com/font',
    by: 'Vercel',
    detail: 'SIL Open Font License 1.1',
  },
  {
    name: 'Press Start 2P',
    url: 'https://fonts.google.com/specimen/Press+Start+2P',
    by: 'CodeMan38',
    detail: 'SIL Open Font License 1.1',
  },
  {
    name: 'Fontsource',
    url: 'https://fontsource.org/',
    by: 'the Fontsource team',
    detail: 'Self-hosted font packages',
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
  {
    name: 'React Transition Group',
    url: 'https://github.com/reactjs/react-transition-group',
    detail: 'BSD-3-Clause',
  },
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
