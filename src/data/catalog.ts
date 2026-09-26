import { type Game, games } from './games';

export type UpcomingGame = {
  id: string;
  title: string;
  regionName: string;
  colors: string[];
};

export type CatalogEntry =
  | { status: 'available'; game: Game }
  | { status: 'soon'; game: UpcomingGame };

export type Generation = {
  number: number;
  roman: string;
  region: string;
  entries: CatalogEntry[];
};

const C = {
  yellow: 'oklch(0.86 0.16 92)',
  gold: 'oklch(0.76 0.12 85)',
  silver: 'oklch(0.78 0.01 250)',
  crystal: 'oklch(0.78 0.09 220)',
  ruby: 'oklch(0.52 0.2 20)',
  sapphire: 'oklch(0.48 0.16 265)',
  emerald: 'oklch(0.62 0.15 155)',
  fire: 'oklch(0.64 0.2 38)',
  leaf: 'oklch(0.66 0.17 140)',
  diamond: 'oklch(0.72 0.1 250)',
  pearl: 'oklch(0.8 0.07 350)',
  platinum: 'oklch(0.7 0.02 260)',
  black: 'oklch(0.25 0 0)',
  white: 'oklch(0.95 0 0)',
  x: 'oklch(0.5 0.15 255)',
  y: 'oklch(0.55 0.2 25)',
  sun: 'oklch(0.72 0.17 60)',
  moon: 'oklch(0.5 0.15 300)',
  ultraSun: 'oklch(0.7 0.18 50)',
  ultraMoon: 'oklch(0.45 0.18 290)',
  eevee: 'oklch(0.65 0.1 60)',
  sword: 'oklch(0.6 0.13 230)',
  shield: 'oklch(0.55 0.18 10)',
  arceus: 'oklch(0.75 0.08 90)',
  scarlet: 'oklch(0.6 0.22 25)',
  violet: 'oklch(0.5 0.2 305)',
  za: 'oklch(0.7 0.14 150)',
};

const soon = (
  id: string,
  title: string,
  regionName: string,
  color: string,
): CatalogEntry => ({
  status: 'soon',
  game: { id, title, regionName, colors: [color] },
});

const available = (generation: number): CatalogEntry[] =>
  games
    .filter((game) => game.generation === generation)
    .map((game) => ({ status: 'available', game }));

export const generations: Generation[] = [
  { number: 1, roman: 'I', region: 'Kanto', entries: available(1) },
  {
    number: 2,
    roman: 'II',
    region: 'Johto',
    entries: [
      soon('gold', 'Pokémon Gold', 'Johto & Kanto', C.gold),
      soon('silver', 'Pokémon Silver', 'Johto & Kanto', C.silver),
      soon('crystal', 'Pokémon Crystal', 'Johto & Kanto', C.crystal),
    ],
  },
  {
    number: 3,
    roman: 'III',
    region: 'Hoenn',
    entries: [
      soon('ruby', 'Pokémon Ruby', 'Hoenn', C.ruby),
      soon('sapphire', 'Pokémon Sapphire', 'Hoenn', C.sapphire),
      soon('emerald', 'Pokémon Emerald', 'Hoenn', C.emerald),
      soon('firered', 'Pokémon FireRed', 'Kanto', C.fire),
      soon('leafgreen', 'Pokémon LeafGreen', 'Kanto', C.leaf),
    ],
  },
  {
    number: 4,
    roman: 'IV',
    region: 'Sinnoh',
    entries: [
      soon('diamond', 'Pokémon Diamond', 'Sinnoh', C.diamond),
      soon('pearl', 'Pokémon Pearl', 'Sinnoh', C.pearl),
      soon('platinum', 'Pokémon Platinum', 'Sinnoh', C.platinum),
      soon('heartgold', 'Pokémon HeartGold', 'Johto & Kanto', C.gold),
      soon('soulsilver', 'Pokémon SoulSilver', 'Johto & Kanto', C.silver),
    ],
  },
  {
    number: 5,
    roman: 'V',
    region: 'Unova',
    entries: [
      soon('black', 'Pokémon Black', 'Unova', C.black),
      soon('white', 'Pokémon White', 'Unova', C.white),
      soon('black-2', 'Pokémon Black 2', 'Unova', C.black),
      soon('white-2', 'Pokémon White 2', 'Unova', C.white),
    ],
  },
  {
    number: 6,
    roman: 'VI',
    region: 'Kalos',
    entries: [
      soon('x', 'Pokémon X', 'Kalos', C.x),
      soon('y', 'Pokémon Y', 'Kalos', C.y),
      soon('omega-ruby', 'Pokémon Omega Ruby', 'Hoenn', C.ruby),
      soon('alpha-sapphire', 'Pokémon Alpha Sapphire', 'Hoenn', C.sapphire),
    ],
  },
  {
    number: 7,
    roman: 'VII',
    region: 'Alola',
    entries: [
      soon('sun', 'Pokémon Sun', 'Alola', C.sun),
      soon('moon', 'Pokémon Moon', 'Alola', C.moon),
      soon('ultra-sun', 'Pokémon Ultra Sun', 'Alola', C.ultraSun),
      soon('ultra-moon', 'Pokémon Ultra Moon', 'Alola', C.ultraMoon),
      soon('lets-go-pikachu', "Pokémon Let's Go, Pikachu!", 'Kanto', C.yellow),
      soon('lets-go-eevee', "Pokémon Let's Go, Eevee!", 'Kanto', C.eevee),
    ],
  },
  {
    number: 8,
    roman: 'VIII',
    region: 'Galar',
    entries: [
      soon('sword', 'Pokémon Sword', 'Galar', C.sword),
      soon('shield', 'Pokémon Shield', 'Galar', C.shield),
      soon(
        'brilliant-diamond',
        'Pokémon Brilliant Diamond',
        'Sinnoh',
        C.diamond,
      ),
      soon('shining-pearl', 'Pokémon Shining Pearl', 'Sinnoh', C.pearl),
      soon('legends-arceus', 'Pokémon Legends: Arceus', 'Hisui', C.arceus),
    ],
  },
  {
    number: 9,
    roman: 'IX',
    region: 'Paldea',
    entries: [
      soon('scarlet', 'Pokémon Scarlet', 'Paldea', C.scarlet),
      soon('violet', 'Pokémon Violet', 'Paldea', C.violet),
      soon('legends-za', 'Pokémon Legends: Z-A', 'Kalos', C.za),
    ],
  },
];
