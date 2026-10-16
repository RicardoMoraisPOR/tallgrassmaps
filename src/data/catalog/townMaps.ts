import type { MapSource } from '../maps';

export type TownMapVariant = {
  label: string;
  games: Array<string>;
  image: string;
  url: string;
};

export type TownMap = {
  url?: string;
  regions?: Array<string>;
  pixelated?: boolean;
  image: string;
  width: number;
  height: number;
  variants?: Array<TownMapVariant>;
};

type TownMapSet = {
  source: MapSource;
  maps: Record<string, TownMap>;
};

const townMaps: Record<string, TownMapSet> = {
  GSC: {
    source: {
      name: 'pret/pokecrystal',
      url: 'https://github.com/pret/pokecrystal',
      credit: 'the pret community',
      note: 'The Johto and Kanto Pokégear maps, drawn from the game’s tile data and palettes',
    },
    maps: {
      Johto: { image: '/maps/gsc/johto-town-map.png', width: 160, height: 144 },
      Kanto: { image: '/maps/gsc/kanto-town-map.png', width: 160, height: 144 },
    },
  },
  RSE: {
    source: {
      name: 'pret/pokeemerald',
      url: 'https://github.com/pret/pokeemerald',
      credit: 'the pret community',
      note: 'The Hoenn Town Map, drawn from the game’s tile data and palette',
    },
    maps: {
      Hoenn: { image: '/maps/rse/hoenn-town-map.png', width: 240, height: 160 },
    },
  },
  FRLG: {
    source: {
      name: 'pret/pokefirered',
      url: 'https://github.com/pret/pokefirered',
      credit: 'the pret community',
      note: 'The Kanto Town Map and the three Sevii Islands pages, drawn from the game’s tile data and palette',
    },
    maps: {
      Kanto: {
        image: '/maps/frlg/kanto-town-map.png',
        width: 192,
        height: 144,
      },
      'Sevii Islands': {
        image: '/maps/frlg/sevii-islands-town-map.png',
        width: 584,
        height: 144,
      },
    },
  },
  DPPt: {
    source: {
      name: 'Bulbagarden Archives',
      url: 'https://archives.bulbagarden.net/wiki/File:Sinnoh.png',
      credit: 'Abcboy',
      note: 'The Sinnoh Town Map from Platinum and from Diamond and Pearl, and the Sinnoh Underground map',
    },
    maps: {
      Sinnoh: {
        image: '/maps/dppt/sinnoh-town-map.png',
        width: 216,
        height: 168,
        variants: [
          {
            label: 'Diamond and Pearl',
            games: ['diamond', 'pearl'],
            image: '/maps/dppt/sinnoh-dp-town-map.png',
            url: 'https://archives.bulbagarden.net/wiki/File:Sinnoh_DP.png',
          },
        ],
      },
      Underground: {
        url: 'https://archives.bulbagarden.net/wiki/File:Sinnoh_Underground_Map_DPPt.png',
        image: '/maps/dppt/underground-town-map.png',
        width: 576,
        height: 534,
      },
    },
  },
  HGSS: {
    source: {
      name: 'pret/pokeheartgold',
      url: 'https://github.com/pret/pokeheartgold',
      credit: 'the pret community',
      note: 'The combined Johto and Kanto Pokégear map, drawn from the game’s tile data and palette',
    },
    maps: {
      'Johto and Kanto': {
        regions: ['Johto', 'Kanto'],
        image: '/maps/hgss/johto-kanto-town-map.png',
        width: 376,
        height: 160,
      },
    },
  },
  BW: {
    source: {
      name: 'Bulbagarden Archives',
      url: 'https://archives.bulbagarden.net/wiki/File:Unova.png',
      credit: 'SnorlaxMonster',
      note: 'The Unova Town Map as it appears in Black and White',
    },
    maps: {
      Unova: {
        image: '/maps/bw/unova-town-map.png',
        width: 256,
        height: 168,
      },
    },
  },
  B2W2: {
    source: {
      name: 'Bulbagarden Archives',
      url: 'https://archives.bulbagarden.net/wiki/File:Unova_2.png',
      credit: 'Lady Ariel',
      note: 'The Unova Town Map as it appears in Black 2 and White 2',
    },
    maps: {
      Unova: {
        image: '/maps/b2w2/unova-town-map.png',
        width: 256,
        height: 168,
      },
    },
  },
  XY: {
    source: {
      name: 'Bulbagarden Archives',
      url: 'https://archives.bulbagarden.net/wiki/File:Kalos.png',
      credit: 'Gaspershut',
      note: 'The Kalos Town Map as it appears in X and Y',
    },
    maps: {
      Kalos: {
        image: '/maps/xy/kalos-town-map.png',
        pixelated: false,
        width: 320,
        height: 210,
      },
    },
  },
  ORAS: {
    source: {
      name: 'Bulbagarden Archives',
      url: 'https://archives.bulbagarden.net/wiki/File:Hoenn_ORAS_Map.png',
      credit: 'Pattyman',
      note: 'The Hoenn Town Map as it appears in Omega Ruby and Alpha Sapphire',
    },
    maps: {
      Hoenn: {
        image: '/maps/oras/hoenn-town-map.png',
        width: 320,
        height: 210,
      },
    },
  },
  SM: {
    source: {
      name: 'Bulbagarden Archives',
      url: 'https://archives.bulbagarden.net/wiki/File:Alola.png',
      credit: 'Abcboy',
      note: 'The Alola Town Map as it appears in Sun and Moon',
    },
    maps: {
      Alola: {
        image: '/maps/sm/alola-town-map.png',
        pixelated: false,
        width: 400,
        height: 240,
      },
    },
  },
  USUM: {
    source: {
      name: 'Bulbagarden Archives',
      url: 'https://archives.bulbagarden.net/wiki/File:Alola_USUM.png',
      credit: 'Abcboy',
      note: 'The Alola Town Map as it appears in Ultra Sun and Ultra Moon',
    },
    maps: {
      Alola: {
        image: '/maps/usum/alola-town-map.png',
        pixelated: false,
        width: 400,
        height: 240,
      },
    },
  },
  LGPE: {
    source: {
      name: 'Bulbagarden Archives',
      url: 'https://archives.bulbagarden.net/wiki/File:Kanto_Town_Map_PE.png',
      credit: 'Sibartzy',
      note: 'The Kanto Town Map as it appears in Let’s Go, Pikachu! and Let’s Go, Eevee!',
    },
    maps: {
      Kanto: {
        image: '/maps/lgpe/kanto-town-map.webp',
        pixelated: false,
        width: 1280,
        height: 720,
      },
    },
  },
  SwSh: {
    source: {
      name: 'Bulbagarden Archives',
      url: 'https://archives.bulbagarden.net/wiki/File:Galar_Sw_DLC.png',
      credit: 'Sibartzy',
      note: 'The Galar Town Map, with the Isle of Armor and the Crown Tundra, from Sword and from Shield',
    },
    maps: {
      Galar: {
        image: '/maps/swsh/galar-sword-town-map.webp',
        pixelated: false,
        width: 720,
        height: 1455,
        variants: [
          {
            label: 'Shield',
            games: ['shield'],
            image: '/maps/swsh/galar-shield-town-map.webp',
            url: 'https://archives.bulbagarden.net/wiki/File:Galar_Sh_DLC.png',
          },
        ],
      },
    },
  },
  BDSP: {
    source: {
      name: 'Bulbagarden Archives',
      url: 'https://archives.bulbagarden.net/wiki/File:Sinnoh_BDSP.png',
      credit: 'Rjd1922 and Serebii.net',
      note: 'The Sinnoh Town Map and the Grand Underground map as they appear in Brilliant Diamond and Shining Pearl',
    },
    maps: {
      Sinnoh: {
        image: '/maps/bdsp/sinnoh-town-map.webp',
        pixelated: false,
        width: 1268,
        height: 734,
      },
      'Grand Underground': {
        url: 'https://www.serebii.net/brilliantdiamondshiningpearl/grandunderground.shtml',
        image: '/maps/bdsp/grand-underground-town-map.webp',
        pixelated: false,
        width: 640,
        height: 360,
      },
    },
  },
  PLA: {
    source: {
      name: 'Bulbagarden Archives',
      url: 'https://archives.bulbagarden.net/wiki/File:Hisui.png',
      credit: 'TehPerson',
      note: 'The Hisui map as it appears in Pokémon Legends: Arceus',
    },
    maps: {
      Hisui: {
        image: '/maps/pla/hisui-town-map.webp',
        pixelated: false,
        width: 1280,
        height: 720,
      },
    },
  },
  SV: {
    source: {
      name: 'Bulbagarden Archives',
      url: 'https://archives.bulbagarden.net/wiki/File:Paldea.png',
      credit: 'Minibug and Tiddlywinks',
      note: 'The Paldea, Kitakami and Blueberry Academy maps as they appear in Scarlet and Violet',
    },
    maps: {
      Paldea: {
        image: '/maps/sv/paldea-town-map.webp',
        pixelated: false,
        width: 1000,
        height: 1000,
      },
      Kitakami: {
        url: 'https://archives.bulbagarden.net/wiki/File:Kitakami.png',
        image: '/maps/sv/kitakami-town-map.webp',
        pixelated: false,
        width: 1000,
        height: 1000,
      },
      'Blueberry Academy': {
        url: 'https://archives.bulbagarden.net/wiki/File:Blueberry_Academy.png',
        image: '/maps/sv/blueberry-academy-town-map.webp',
        pixelated: false,
        width: 1000,
        height: 1000,
      },
    },
  },
};

export const townMapFor = (
  versionGroup: string,
  region: string,
  gameId: string,
) => {
  const maps = townMaps[versionGroup]?.maps ?? {};
  const map =
    maps[region] ??
    Object.values(maps).find(({ regions }) => regions?.includes(region));
  const variant = map?.variants?.find(({ games }) => games.includes(gameId));

  return map && { ...map, image: variant?.image ?? map.image };
};

export const townMapGroups = Object.entries(townMaps).map(
  ([versionGroup, { source, maps }]) => ({
    versionGroup,
    source,
    works: Object.entries(maps).flatMap(([region, { url, variants = [] }]) => [
      {
        label: `${region} Town Map (${versionGroup})`,
        url: url ?? source.url,
      },
      ...variants.map(({ label, url }) => ({
        label: `${region} Town Map, ${label} (${versionGroup})`,
        url,
      })),
    ]),
  }),
);
